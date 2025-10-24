import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { createAgent } from 'langchain'
import { MultiServerMCPClient } from '@langchain/mcp-adapters'
import { ChatOpenAI } from '@langchain/openai'
import { CallbackHandler } from 'langfuse-langchain'
import { Langfuse } from 'langfuse'

console.log('[INIT] OPENAI_API_KEY present?', !!process.env.OPENAI_API_KEY)
console.log(
  '[INIT] MCP Server URL:',
  process.env.MCP_SERVER_URL || 'https://neomcp.msulawiak.pl'
)
console.log('[INIT] Langfuse configured:', {
  publicKey: !!process.env.NEXT_PUBLIC_LANGFUSE_PUBLIC_KEY,
  secretKey: !!process.env.NEXT_PUBLIC_LANGFUSE_SECRET_KEY,
  host: process.env.NEXT_PUBLIC_LANGFUSE_HOST,
})

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
  try {
    console.log('[POST] Chat API request started')

    // Check authentication
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.log('[POST] Unauthorized: no user')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[POST] User authenticated:', user.id)

    // Parse request
    const body: ChatRequest = await request.json()
    const { messages, conversationId, model } = body

    console.log('[POST] Request body:', {
      messageCount: messages?.length,
      conversationId,
      model: model || 'gpt-5-nano (default)',
    })

    if (!messages || messages.length === 0) {
      console.log('[POST] No messages in request')
      return NextResponse.json(
        { error: 'Messages are required' },
        { status: 400 }
      )
    }

    // Get user's last message
    const userMessage = messages[messages.length - 1]?.content || ''
    console.log('[POST] User message:', userMessage.substring(0, 100))

    // Get current date
    const today = new Date()
    const dateStr = today.toLocaleDateString('pl-PL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    // Create system prompt with current date
    const systemPrompt = `Jesteś asystentem parlamentarnym z dostępem do bazy danych Neo4j Sejmu RP.
Dzisiejsza data: ${dateStr}

ZASADA: DZIAŁAJ NATYCHMIAST, NIE PYTAJ O POTWIERDZENIE.

Gdy użytkownik pyta o temat (np. "co rząd zrobił w sprawie lekarzy?", "ostatnie druki o zdrowiu"):
1. OD RAZU wywołaj odpowiednie narzędzie (search_prints, find_mp_by_name, itp.)


FORMAT ODPOWIEDZI - ZWIĘŹLE I NA TEMAT:

1. KRÓTKO (max 3-4 zdania wprowadzenia)
2. LISTA druków z linkami i 1-2 zdaniami opisu każdy:
   - [Druk XXX](/prints/XXX): Tytuł. Krótki opis (max 2 zdania). Status: XXX
3. BEZ długich wyjaśnień
5. BEZ oferowania dodatkowych akcji na końcu
`
    // Create readable stream for SSE
    const readable = new ReadableStream({
      async start(controller) {
        try {
          // Send initial status
          controller.enqueue(
            createSSEMessage('status', {
              message: 'Inicjalizacja agenta...',
            })
          )

          // Initialize MCP Client
          console.log('[POST] Initializing MCP Client...')
          const mcpServerUrl =
            process.env.MCP_SERVER_URL || 'https://neomcp.msulawiak.pl'

          const client = new MultiServerMCPClient({
            sejmofil: {
              transport: 'sse',
              url: `${mcpServerUrl}/sse`,
            },
          })

          // Get tools from MCP
          console.log('[POST] Loading MCP tools...')
          const tools = await client.getTools()
          console.log('[POST] Loaded', tools.length, 'tools from MCP')

          // List available tools in logs
          const toolNames = tools.map((t: any) => t.name).join(', ')
          console.log('[POST] Available tools:', toolNames)

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

          console.log('[POST] Using model:', model || 'gpt-5-nano')

          const agent = createAgent({
            model: llmModel,
            tools,
            systemPrompt,
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
          const toolCallTimestamps = new Map<number, number>() // iteration -> start timestamp

          // Stream the agent execution
          console.log(
            '[POST] Starting agent stream with max',
            MAX_ITERATIONS,
            'iterations...'
          )
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

          for await (const chunk of stream) {
            const latestMessage = chunk.messages?.at(-1)

            if (latestMessage) {
              // Check if it's a tool call
              if (
                latestMessage.tool_calls &&
                latestMessage.tool_calls.length > 0
              ) {
                currentIteration++

                // Check if max iterations reached
                if (currentIteration > MAX_ITERATIONS) {
                  console.log(
                    `[POST] Max iterations (${MAX_ITERATIONS}) reached, stopping stream`
                  )
                  break
                }

                const toolCall = latestMessage.tool_calls[0]
                lastToolName = toolCall.name

                // Record start time for this tool call
                toolCallTimestamps.set(currentIteration, Date.now())

                console.log(
                  `[POST] Iteration ${currentIteration}/${MAX_ITERATIONS}: Calling tool: ${toolCall.name}`
                )
                console.log(
                  `[POST] Tool arguments:`,
                  JSON.stringify(toolCall.args).substring(0, 200)
                )

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

              // Check if it's a tool result message
              if (
                latestMessage.tool_results &&
                latestMessage.tool_results.length > 0
              ) {
                const toolResult = latestMessage.tool_results[0]
                
                // Calculate duration
                const startTime = toolCallTimestamps.get(currentIteration)
                const duration = startTime ? Date.now() - startTime : undefined
                
                console.log(
                  `[POST] Tool result received:`,
                  JSON.stringify(toolResult.content).substring(0, 200)
                )
                if (duration) {
                  console.log(`[POST] Tool execution took ${duration}ms`)
                }

                // Send tool result to frontend with duration
                controller.enqueue(
                  createSSEMessage('tool_result', {
                    iteration: currentIteration,
                    result: toolResult.content,
                    duration,
                  })
                )

                controller.enqueue(
                  createSSEMessage('status', {
                    message: `Krok ${currentIteration}/${MAX_ITERATIONS}: Przetwarzanie wyników...`,
                  })
                )
              }

              // Extract final response text
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

          console.log('[POST] Agent stream complete')
          console.log(
            '[POST] Final response:',
            assistantResponse.substring(0, 100)
          )

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
            console.log('[POST] Saving conversation to database...')
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

              console.log('[POST] Conversation saved')
            } catch (err) {
              console.error('[POST] Error saving conversation:', err)
            }
          }

          controller.enqueue(createSSEMessage('done', { success: true }))

          // Flush Langfuse to ensure all traces are sent
          await langfuseHandler.flushAsync()
          await langfuse.flushAsync()
          console.log('[POST] Langfuse traces flushed')

          controller.close()
        } catch (error) {
          console.error('[POST] Streaming error:', error)
          controller.enqueue(
            createSSEMessage('error', {
              message: error instanceof Error ? error.message : 'Unknown error',
            })
          )
          controller.close()
        }
      },
    })

    return new NextResponse(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('[POST] Chat API error:', error)
    if (error instanceof Error) {
      console.error('[POST] Error message:', error.message)
      console.error('[POST] Error stack:', error.stack)
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
