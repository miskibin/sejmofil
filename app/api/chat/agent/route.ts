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

DOSTĘPNE NARZĘDZIA MCP I ICH MOŻLIWOŚCI:

1. search_prints(query, limit, status)
   CO MOŻE: Wyszukiwanie druków sejmowych używając wyszukiwania semantycznego lub pełnotekstowego.
   - query: słowa kluczowe tematyczne (np. "podatki", "obrona narodowa", "energia odnawialna")
   - status: "all" (wszystkie), "active" (w trakcie), "finished" (zakończone)
   CO NIE MOŻE:
   - NIE obsługuje sortowania czasowego ("ostatnie", "najnowsze", "z ostatniego miesiąca")
   - NIE wyszukuje po numerze druku (użyj get_print_details)
   - NIE wyszukuje po autorze (użyj find_mp_by_name + get_mp_activity)
   
2. get_print_details(print_number)
   CO MOŻE: Pobiera pełne informacje o konkretnym druku po jego numerze.
   CO NIE MOŻE: NIE wyszukuje druków - wymaga dokładnego numeru druku.

3. get_process_status(process_number)
   CO MOŻE: Sprawdza status procesu legislacyjnego (aktywny/zakończony) i etapy.
   CO NIE MOŻE: NIE wyszukuje procesów - wymaga numeru procesu.

4. find_mp_by_name(name)
   CO MOŻE: Wyszukuje posłów po imieniu/nazwisku (pełne lub częściowe).
   CO NIE MOŻE: NIE zwraca aktywności posła (użyj get_mp_activity z otrzymanym ID).

5. get_mp_activity(person_id)
   CO MOŻE: Pobiera aktywność posła (autorskie druki, przemówienia, komisje).
   CO NIE MOŻE: NIE wyszukuje posłów - wymaga ID z find_mp_by_name.

6. get_similar_topics(topic_name, limit)
   CO MOŻE: Znajduje semantycznie podobne tematy.
   CO NIE MOŻE: NIE wyszukuje druków - tylko podobne tematy.

7. get_topic_statistics(topic_name)
   CO MOŻE: Zwraca statystyki o temacie (liczba druków aktywnych/zakończonych).
   CO NIE MOŻE: NIE listuje druków - tylko statystyki.

8. get_club_statistics(club_name)
   CO MOŻE: Statystyki klubu (członkowie, druki, głosowania, przemówienia).
   CO NIE MOŻE: NIE listuje konkretnych druków klubu.

9. list_clubs()
   CO MOŻE: Lista wszystkich klubów parlamentarnych z liczbą członków.
   CO NIE MOŻE: NIE zwraca szczegółów - użyj get_club_statistics.

10. search_all(query, limit)
    CO MOŻE: Wyszukiwanie w wielu kategoriach (druki, posłowie).
    CO NIE MOŻE: NIE obsługuje sortowania czasowego, mniej precyzyjne niż search_prints.

11. explore_node(node_type, node_id, limit)
    CO MOŻE: Eksploracja wszystkich połączeń węzła (Person, Print, Topic, Process, Club, Committee).
    CO NIE MOŻE: Wymaga dokładnego typu i ID węzła.

OBSŁUGA PYTAŃ CZASOWYCH:
- Dla "ostatnie druki", "najnowsze druki": Wyjaśnij że baza nie obsługuje sortowania czasowego.
  Zaproponuj: "Mogę wyszukać druki na konkretny temat używając search_prints(query, status='active') dla aktywnych procesów."
- NIE używaj search_prints z query="ostatnie" czy "najnowsze" - to NIE ZADZIAŁA.

DOSTĘPNE ENDPOINTY W APLIKACJI:
Gdy odnoszysz się do konkretnych zasobów, używaj hiperłączy w formacie markdown:
- Procesy legislacyjne: [Proces <id>](/processes/<id>) - np. [Proces 123](/processes/123)
- Druki sejmowe: [Druk <numer>](/prints/<numer>) - np. [Druk 456](/prints/456)
- Posłowie: [<Imię Nazwisko>](/envoys/<id>) - np. [Jan Kowalski](/envoys/789)
- Posiedzenia: [Posiedzenie <numer>](/proceedings/<id>) - np. [Posiedzenie 10](/proceedings/10)

WAŻNE INSTRUKCJE:
1. Odpowiadaj zwięźle i precyzyjnie (max 2-3 akapity)
2. Unikaj powtórzeń i długich wyjaśnień
3. Odpowiadaj po polsku
4. PRZED użyciem narzędzia SPRAWDŹ czy pytanie pasuje do jego możliwości
5. Jeśli pytanie wykracza poza możliwości narzędzi, WYJAŚNIJ to użytkownikowi i zaproponuj alternatywę
6. NIE wymyślaj danych - korzystaj TYLKO z dostępnych narzędzi
7. Jeśli funkcja zwraca błąd, spróbuj z innymi parametrami lub WYJAŚNIJ problem
8. ZAWSZE twórz aktywne linki do zasobów (procesów, druków, posłów) używając formatu markdown
9. Gdy wspominasz o konkretnym druku, procesie lub pośle, ZAWSZE dodawaj hiperłącze

PRZYKŁADY DOBRYCH ODPOWIEDZI:
Q: "Jakie były ostatnie druki sejmowe?"
A: "Przepraszam, system nie obsługuje sortowania druków według daty złożenia. Mogę jednak wyszukać druki na konkretny temat lub pokazać aktywne procesy legislacyjne. O jaki temat Cię interesuje?"

Q: "Znajdź druki o podatkach"
A: [Wywołaj search_prints(query="podatki", status="all", limit=10)]

Q: "Co robi poseł Kowalski?"
A: [Wywołaj find_mp_by_name("Kowalski"), potem get_mp_activity(person_id)]`

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
          const model = new ChatOpenAI({
            modelName: 'gpt-5-nano',
            streaming: true,
            callbacks: [langfuseHandler],
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
