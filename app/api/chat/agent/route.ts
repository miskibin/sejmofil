import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { createAgent } from 'langchain'
import { MultiServerMCPClient } from '@langchain/mcp-adapters'
import { ChatOpenAI } from '@langchain/openai'

console.log('[INIT] OPENAI_API_KEY present?', !!process.env.OPENAI_API_KEY)
console.log(
  '[INIT] MCP Server URL:',
  process.env.MCP_SERVER_URL || 'http://localhost:8000'
)

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
    const { messages, conversationId } = body

    console.log('[POST] Request body:', {
      messageCount: messages?.length,
      conversationId,
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

    // Create system prompt
    const systemPrompt = `Jesteś asystentem Sejmu Polskiego. Dzisiejsza data to: ${dateStr}

Masz dostęp do narzędzi MCP do:
1. Wyszukiwania drików parlamentarnych
2. Uzyskiwania informacji o parlamentarzystach
3. Wyszukiwania informacji o procesach legislacyjnych
4. Wyszukiwania podobnych tematów
5. Uzyskiwania statystyk na temat tematów
6. Wyszukiwania we wszystkich zasobach parlamentarnych

DOSTĘPNE ENDPOINTY W APLIKACJI:
Gdy odnoszisz się do konkretnych zasobów, używaj hiperłączy w formacie markdown:
- Procesy legislacyjne: [Proces <id>](/processes/<id>) - np. [Proces 123](/processes/123)
- Druki sejmowe: [Druk <numer>](/prints/<numer>) - np. [Druk 456](/prints/456)
- Posłowie: [<Imię Nazwisko>](/envoys/<id>) - np. [Jan Kowalski](/envoys/789)
- Posiedzenia: [Posiedzenie <numer>](/proceedings/<id>) - np. [Posiedzenie 10](/proceedings/10)

WAŻNE INSTRUKCJE:
1. Odpowiadaj zwięźle i precyzyjnie (max 2-3 akapity)
2. Unikaj powtórzeń i długich wyjaśnień
4. Odpowiadaj po polsku
5. Używaj dostępnych narzędzi aby znaleźć informacje, gdy jest to potrzebne
6. Nie wymyślaj danych - korzystaj z dostępnych narzędzi
7. Jeśli funkcja zwraca błąd, spróbuj z innymi parametrami
8. ZAWSZE twórz aktywne linki do zasobów (procesów, druków, posłów) używając formatu markdown
9. Gdy wspominasz o konkretnym druku, procesie lub pośle, ZAWSZE dodawaj hiperłącze`

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
            process.env.MCP_SERVER_URL || 'http://localhost:8000'

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

          // Create agent with streaming capabilities

          const model = new ChatOpenAI({
            modelName: 'gpt-5-nano',
            streaming: true,
          })

          const agent = createAgent({
            model,
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
            { streamMode: 'values' }
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
              if (latestMessage.tool_results && latestMessage.tool_results.length > 0) {
                const toolResult = latestMessage.tool_results[0]
                console.log(
                  `[POST] Tool result received:`,
                  JSON.stringify(toolResult.content).substring(0, 200)
                )

                // Send tool result to frontend
                controller.enqueue(
                  createSSEMessage('tool_result', {
                    iteration: currentIteration,
                    result: toolResult.content,
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
