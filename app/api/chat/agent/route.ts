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
  console.log('[Agent Route] POST request received')
  try {
    // Check authentication
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    console.log('[Agent Route] User authenticated:', user?.id || 'none')

    if (!user) {
      console.error('[Agent Route] Unauthorized - no user')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request
    const body: ChatRequest = await request.json()
    const { messages, conversationId, model } = body

    console.log('[Agent Route] Request parsed:', {
      messageCount: messages?.length,
      conversationId,
      model,
    })

    if (!messages || messages.length === 0) {
      console.error('[Agent Route] No messages provided')
      return NextResponse.json(
        { error: 'Messages are required' },
        { status: 400 }
      )
    }

    // Get user's last message
    const userMessage = messages[messages.length - 1]?.content || ''
    console.log('[Agent Route] User message:', userMessage.substring(0, 100))

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
          console.log('[Agent Stream] Starting stream')
          // Send initial status
          controller.enqueue(
            createSSEMessage('status', {
              message: 'Inicjalizacja agenta...',
            })
          )

          // Initialize MCP Client
          const mcpServerUrl = 'https://neomcp.msulawiak.pl'
          console.log('[Agent Stream] Connecting to MCP server:', mcpServerUrl)

          mcpClient = new MultiServerMCPClient({
            sejmofil: {
              transport: 'sse',
              url: `${mcpServerUrl}/sse`,
            },
          })

          // Get tools from MCP
          console.log('[Agent Stream] Fetching tools from MCP...')
          const tools = await mcpClient.getTools()
          console.log('[Agent] MCP tools loaded:', Array.isArray(tools) ? tools.length : 0, tools?.map((t: any) => t.name).join(', '))

          // Initialize Langfuse client
          console.log('[Agent Stream] Initializing Langfuse')
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
          console.log('[Agent Stream] Creating agent with model:', model || 'gpt-5-nano')
          const llmModel = new ChatOpenAI({
            modelName: model || 'gpt-5-nano',
            streaming: true,
            callbacks: [langfuseHandler],
          })

          console.log('[Agent Stream] Creating agent with', tools.length, 'tools')
          const agent = createAgent({
            model: llmModel,
            tools,
            systemPrompt: systemPromptContent,
          })

          console.log('[Agent Stream] Agent created successfully')
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

          // Stream the agent execution
          console.log('[Agent Stream] Starting agent stream with', agentMessages.length, 'messages')
          const stream = await agent.stream(
            {
              messages: agentMessages,
            },
            {
              streamMode: 'values',
            }
          )

          let assistantResponse = ''
          let toolCallInfo: { name: string; args: any; result: string }[] = []

          console.log('[Agent Stream] Processing stream chunks...')
          for await (const chunk of stream) {
            const latestMessage = chunk.messages?.at(-1)
            console.log('[Agent Stream] Chunk received, message type:', latestMessage?.constructor?.name)

            if (latestMessage) {
              // Get message type for proper detection
              const msgType = latestMessage.constructor?.name || ''

              // Check if it's a tool call (AIMessage with tool_calls)
              if (
                latestMessage.tool_calls &&
                latestMessage.tool_calls.length > 0
              ) {
                currentIteration++
                console.log('[Agent Stream] Tool call detected, iteration:', currentIteration)

                // Check if max iterations reached
                if (currentIteration > MAX_ITERATIONS) {
                  console.log('[Agent Stream] Max iterations reached, stopping')
                  break
                }

                const toolCall = latestMessage.tool_calls[0]
                lastToolName = toolCall.name
                console.log('[Agent Stream] Calling tool:', toolCall.name, 'with args:', JSON.stringify(toolCall.args).substring(0, 100))

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
          console.log('[Agent Stream] Stream completed, response length:', assistantResponse.length)
          if (!assistantResponse || assistantResponse.length === 0) {
            console.error('[Agent Stream] No response generated!')
            assistantResponse =
              'Przepraszam, nie udało się wygenerować odpowiedzi. Spróbuj ponownie.'
          }

          // Post-process response to convert relative links to absolute URLs
          const origin = process.env.NEXT_PUBLIC_SITE_URL || 'https://sejmofil.pl'
          console.log('[Agent Stream] Converting relative links with origin:', origin)
          const beforeLinks = assistantResponse.match(/\[([^\]]+)\]\(\/([^)]+)\)/g)?.length || 0
          assistantResponse = assistantResponse.replace(
            /\[([^\]]+)\]\(\/([^)]+)\)/g,
            `[$1](${origin}/$2)`
          )
          const afterLinks = assistantResponse.match(/\[([^\]]+)\]\(https?:\/\/[^)]+\)/g)?.length || 0
          console.log('[Agent Stream] Converted', beforeLinks, 'relative links to', afterLinks, 'absolute links')

          // Send the final response
          controller.enqueue(
            createSSEMessage('status', {
              message: 'Generowanie odpowiedzi...',
            })
          )

          console.log('[Agent Stream] Sending final content')
          controller.enqueue(
            createSSEMessage('content', {
              data: assistantResponse,
            })
          )

          // Save to database if conversation ID provided
          if (conversationId) {
            console.log('[Agent Stream] Saving to database, conversation:', conversationId)
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
              console.log('[Agent Stream] Saved to database successfully')
            } catch (err) {
              console.error('[Agent Stream] Failed to save to database:', err)
              // Silently fail - not critical
            }
          }

          controller.enqueue(createSSEMessage('done', { success: true }))

          // Flush Langfuse asynchronously (don't block on it)
          console.log('[Agent Stream] Flushing Langfuse...')
          Promise.all([
            langfuseHandler.flushAsync().catch(() => {}),
            langfuse.flushAsync().catch(() => {})
          ]).catch(() => {})

          console.log('[Agent] Completed successfully')
          controller.close()
        } catch (error) {
          console.error('[Agent] Error in stream:', error)
          console.error('[Agent] Error stack:', error instanceof Error ? error.stack : 'no stack')
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
          console.log('[Agent Stream] Cleanup: closing MCP client')
          if (mcpClient) {
            try {
              await mcpClient.close?.()
              console.log('[Agent Stream] MCP client closed')
            } catch (e) {
              console.error('[Agent Stream] Error closing MCP client:', e)
              // Ignore cleanup errors
            }
          }
        }
      },
    })

    return new NextResponse(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no', // Disable nginx buffering
      },
    })
  } catch (error) {
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
