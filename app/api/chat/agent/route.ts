import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { createAgent } from 'langchain'
import { MultiServerMCPClient } from '@langchain/mcp-adapters'
import { ChatOpenAI } from '@langchain/openai'
import { CallbackHandler } from 'langfuse-langchain'
import { Langfuse } from 'langfuse'

// Helper to send SSE events
function createSSEMessage(type: string, data: any): string {
  const jsonStr = JSON.stringify({ type, data })
  const msg = `data: ${jsonStr}\n\n`
  return msg
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface ChatRequest {
  messages: ChatMessage[]
  conversationId?: string
  model?: string
}

export async function POST(request: NextRequest) {
  // Set longer timeout for streaming (if on Vercel, max is 60s for hobby, 300s for pro)
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 55000) // 55s timeout to be safe

  try {
    // Check authentication
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      clearTimeout(timeoutId)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request
    const body: ChatRequest = await request.json()
    const { messages, conversationId, model } = body

    if (!messages || messages.length === 0) {
      clearTimeout(timeoutId)
      return NextResponse.json(
        { error: 'Messages are required' },
        { status: 400 }
      )
    }

    console.log('[Agent] Starting, messages:', messages.length, 'model:', model || 'default')

    // Get user's last message
    const userMessage = messages[messages.length - 1]?.content || ''

    // Get current date
    const today = new Date()
    const dateStr = today.toLocaleDateString('pl-PL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    // Create system prompt with current date
    const systemPromptContent = `Jesteś asystentem parlamentarnym analizującym bazę danych Sejmu RP.

Dzisiejsza data: ${dateStr}

PODSTAWOWE ZASADY:
1. Odpowiadaj w języku polskim, zwięźle i konkretnie
2. Używaj dostępnych narzędzi automatycznie, bez pytania o zgodę
3. Formatuj odpowiedzi w Markdown
4. Dodawaj linki do druków: [Druk 1234](/prints/1234) i posłów: [Imię Nazwisko](/envoys/123)
5. Wywołuj funkcje maksymalnie dla 5 elementów naraz

JAK ODPOWIADAĆ:
- Odpowiadaj bezpośrednio na pytanie użytkownika
- Prezentuj wyniki w przejrzystej formie (listy, tabele)
- Jeśli brak wyników, powiedz wprost i zasugeruj alternatywne wyszukiwanie
- Używaj naturalnego języka bez sztucznych fraz

CZEGO UNIKAĆ:
- Powtarzania tych samych informacji
- Oferowania dodatkowych działań ("Czy chcesz, żebym...")
- Ogólników i długich wstępów`
    // Create readable stream for SSE
    const readable = new ReadableStream({
      async start(controller) {
        let mcpClient: MultiServerMCPClient | null = null
        
        try {
          // Send initial status
          controller.enqueue(
            createSSEMessage('status', {
              message: 'Inicjalizacja agenta...',
            })
          )

          // Initialize MCP Client with timeout handling
          const mcpServerUrl =
            process.env.MCP_SERVER_URL || 'https://neomcp.msulawiak.pl'

          mcpClient = new MultiServerMCPClient({
            sejmofil: {
              transport: 'sse',
              url: `${mcpServerUrl}/sse`,
            },
          })

          // Get tools from MCP with timeout
          const toolsPromise = mcpClient.getTools()
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('MCP connection timeout')), 10000)
          )
          
          const tools = await Promise.race([toolsPromise, timeoutPromise]) as any
          console.log('[Agent] MCP tools loaded:', Array.isArray(tools) ? tools.length : 0)

          // Initialize Langfuse client
          const langfuse = new Langfuse({
            publicKey: process.env.NEXT_PUBLIC_LANGFUSE_PUBLIC_KEY,
            secretKey: process.env.NEXT_PUBLIC_LANGFUSE_SECRET_KEY,
            baseUrl: process.env.NEXT_PUBLIC_LANGFUSE_HOST,
          })

          // Create a trace for this entire agent run
          const trace = langfuse.trace({
            name: 'chat-agent',
            sessionId: conversationId || undefined,
            userId: user.id,
            metadata: {
              userMessage: userMessage.substring(0, 100),
              conversationId: conversationId || 'new',
              timestamp: new Date().toISOString(),
            },
          })

          // Create Langfuse callback handler attached to this trace
          const langfuseHandler = new CallbackHandler({
            root: trace,
          })

          // Create agent with streaming capabilities
          const llmModel = new ChatOpenAI({
            modelName: model || 'gpt-5-nano',
            streaming: true,
            callbacks: [langfuseHandler],
          })

          const agent = createAgent({
            model: llmModel,
            tools,
            systemPrompt: systemPromptContent,
          })

          controller.enqueue(
            createSSEMessage('status', {
              message: 'Agent gotowy, przetwarzam pytanie...',
            })
          )

          // Convert messages to agent format
          const agentMessages = messages.map((msg) => ({
            role: msg.role as 'user' | 'assistant' | 'system',
            content: msg.content,
          }))

          // Track iteration and tool calls for frontend visibility
          let currentIteration = 0
          let lastToolName = ''
          const MAX_ITERATIONS = 4
          const toolCallTimestamps = new Map<number, number>()

          // Stream the agent execution with timeout protection
          let stream
          try {
            stream = await agent.stream(
              {
                messages: agentMessages,
              },
              {
                streamMode: 'values',
              }
            )
          } catch (streamError) {
            console.error('[Agent] Stream start failed:', streamError)
            throw new Error(
              `Failed to start agent stream: ${streamError instanceof Error ? streamError.message : 'Unknown error'}`
            )
          }

          let assistantResponse = ''
          let toolCallInfo: { name: string; args: any; result: string }[] = []

          for await (const chunk of stream) {
            const latestMessage = chunk.messages?.at(-1)

            if (latestMessage) {
              // Get message type for proper detection
              const msgType = latestMessage.constructor?.name || ''

              // Check if it's a tool call (AIMessage with tool_calls)
              if (
                latestMessage.tool_calls &&
                latestMessage.tool_calls.length > 0
              ) {
                currentIteration++

                // Check if max iterations reached
                if (currentIteration > MAX_ITERATIONS) {
                  break
                }

                const toolCall = latestMessage.tool_calls[0]
                lastToolName = toolCall.name

                console.log('[Agent] Tool call:', toolCall.name)

                // Record start time for this tool call
                toolCallTimestamps.set(currentIteration, Date.now())

                // Send tool call info to frontend
                controller.enqueue(
                  createSSEMessage('tool_call', {
                    iteration: currentIteration,
                    toolName: toolCall.name,
                    arguments: toolCall.args,
                  })
                )

                controller.enqueue(
                  createSSEMessage('status', {
                    message: `Krok ${currentIteration}/${MAX_ITERATIONS}: Wywołuję funkcję "${toolCall.name}"...`,
                  })
                )
              }

              // Check if it's a tool result message (ToolMessage)
              else if (
                msgType === 'ToolMessage' ||
                latestMessage.tool_call_id
              ) {
                // Calculate duration
                const startTime = toolCallTimestamps.get(currentIteration)
                const duration = startTime ? Date.now() - startTime : undefined

                // Format result for display
                let formattedResult: string
                const resultContent = latestMessage.content

                if (typeof resultContent === 'string') {
                  formattedResult = resultContent
                } else if (Array.isArray(resultContent)) {
                  // Handle array of content items
                  formattedResult = resultContent
                    .map((item: any) => {
                      if (typeof item === 'string') return item
                      if (item.type === 'text') return item.text
                      return JSON.stringify(item)
                    })
                    .join('\n')
                } else {
                  formattedResult = JSON.stringify(resultContent, null, 2)
                }

                // Send tool result to frontend with duration
                controller.enqueue(
                  createSSEMessage('tool_result', {
                    iteration: currentIteration,
                    result: formattedResult,
                    duration,
                    toolName: lastToolName,
                  })
                )

                controller.enqueue(
                  createSSEMessage('status', {
                    message: `Krok ${currentIteration}/${MAX_ITERATIONS}: Przetwarzanie wyników${duration ? ` (${duration}ms)` : ''}...`,
                  })
                )
              }

              // Always extract content from AIMessage or AIMessageChunk (streaming)
              // The final response comes as AIMessage with content and no tool_calls
              if (
                (msgType === 'AIMessage' || msgType === 'AIMessageChunk') &&
                latestMessage.content
              ) {
                // Only update assistant response if this is NOT a tool call message
                if (
                  !latestMessage.tool_calls ||
                  latestMessage.tool_calls.length === 0
                ) {
                  // Extract content from AIMessage
                  if (typeof latestMessage.content === 'string') {
                    assistantResponse = latestMessage.content
                  } else if (
                    Array.isArray(latestMessage.content) &&
                    latestMessage.content.length > 0
                  ) {
                    const textContent = latestMessage.content.find(
                      (c: any) => typeof c === 'string' || c.type === 'text'
                    )
                    if (textContent) {
                      assistantResponse =
                        typeof textContent === 'string'
                          ? textContent
                          : textContent.text || ''
                    }
                  }
                }
              }
            }
          }

          // Set fallback message if no response generated
          if (!assistantResponse || assistantResponse.length === 0) {
            console.warn('[Agent] No response generated')
            assistantResponse =
              'Przepraszam, nie udało się wygenerować odpowiedzi. Spróbuj ponownie.'
          }

          // Send the final response
          controller.enqueue(
            createSSEMessage('status', {
              message: 'Generowanie odpowiedzi...',
            })
          )

          controller.enqueue(
            createSSEMessage('content', {
              data: assistantResponse,
            })
          )

          // Save to database if conversation ID provided
          if (conversationId) {
            try {
              await supabase.from('chat_messages').insert({
                conversation_id: conversationId,
                role: 'user',
                content: userMessage,
              } as any)

              await supabase.from('chat_messages').insert({
                conversation_id: conversationId,
                role: 'assistant',
                content: assistantResponse,
              } as any)
            } catch (err) {
              console.error('[Agent] DB save failed:', err)
              // Silently fail - not critical
            }
          }

          controller.enqueue(createSSEMessage('done', { success: true }))

          // Flush Langfuse asynchronously (don't block on it)
          Promise.all([
            langfuseHandler.flushAsync().catch(() => {}),
            langfuse.flushAsync().catch(() => {})
          ]).catch(() => {})

          console.log('[Agent] Completed successfully')
          controller.close()
        } catch (error) {
          console.error('[Agent] Error:', error)
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          
          controller.enqueue(
            createSSEMessage('error', {
              message: `Wystąpił błąd: ${errorMessage}`,
            })
          )
          controller.enqueue(
            createSSEMessage('content', {
              data: 'Przepraszam, wystąpił błąd podczas przetwarzania zapytania. Spróbuj ponownie.',
            })
          )
          controller.enqueue(createSSEMessage('done', { success: false }))
          controller.close()
        } finally {
          // Cleanup MCP client
          if (mcpClient) {
            try {
              await mcpClient.close?.()
            } catch (e) {
              // Ignore cleanup errors
            }
          }
        }
      },
    })

    clearTimeout(timeoutId)
    
    return new NextResponse(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no', // Disable nginx buffering
      },
    })
  } catch (error) {
    clearTimeout(timeoutId)
    console.error('[Agent] Top-level error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
