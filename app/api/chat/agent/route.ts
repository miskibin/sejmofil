import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { ChatOpenAI } from '@langchain/openai'
import { z } from 'zod'
import { tool } from '@langchain/core/tools'
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages'
import { retrieveContextDocuments } from '@/lib/db/retrieveContextDocuments'
import { runQuery } from '@/lib/db/client'

console.log('[INIT] OPENAI_API_KEY present?', !!process.env.OPENAI_API_KEY)

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

interface ContextDocument {
  type: string
  title: string
  content: string
  url?: string | null
  score: number
  id?: string
  changeDate?: string | null
}

// Initialize LangChain OpenAI model with tools support
const model = new ChatOpenAI({
  modelName: 'gpt-5-nano',
  apiKey: process.env.OPENAI_API_KEY,
})

// Neo4j Query Tool
const neo4jQueryTool = tool(
  async (input: { query: string; params?: Record<string, any> }) => {
    console.log('[NEO4J_TOOL] Executing query:', input.query.substring(0, 100))
    try {
      const results = await runQuery<any>(input.query, input.params || {})
      console.log('[NEO4J_TOOL] Query returned', results.length, 'results')
      return JSON.stringify(results, null, 2)
    } catch (error) {
      console.error('[NEO4J_TOOL] Query failed:', error)
      throw new Error(`Neo4j query failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  },
  {
    name: 'query_neo4j',
    description: 'Query the Neo4j graph database to find relationships between parliamentary entities. Use this to search for connections between politicians, votes, procedures, and other parliamentary entities.',
    schema: z.object({
      query: z.string().describe('The Cypher query to execute against the Neo4j database'),
      params: z.record(z.string(), z.any()).optional().describe('Query parameters as a key-value object'),
    }),
  }
)

// Vector Search Tool
const vectorSearchTool = tool(
  async (input: { query: string; limit?: number }) => {
    console.log('[VECTOR_SEARCH_TOOL] Searching for:', input.query)
    try {
      // Generate embedding for the query
      const openai = require('openai')
      const client = new openai.default({
        apiKey: process.env.OPENAI_API_KEY,
      })
      
      const embedding = await client.embeddings.create({
        model: 'text-embedding-3-small',
        input: input.query,
      })

      // Retrieve context documents using the embedding
      const documents = await retrieveContextDocuments(embedding.data[0].embedding, input.limit || 5)
      console.log('[VECTOR_SEARCH_TOOL] Found', documents.length, 'documents')
      
      return JSON.stringify(documents, null, 2)
    } catch (error) {
      console.error('[VECTOR_SEARCH_TOOL] Search failed:', error)
      throw new Error(`Vector search failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  },
  {
    name: 'vector_search',
    description: 'Search parliamentary documents using semantic similarity. Use this to find relevant Sejm documents, procedures, prints, and other parliamentary materials by meaning.',
    schema: z.object({
      query: z.string().describe('The search query describing what parliamentary documents you want to find'),
      limit: z.number().optional().describe('Maximum number of results to return (default: 5)'),
    }),
  }
)

// Initialize tools array
const tools = [neo4jQueryTool, vectorSearchTool]

async function generateEmbedding(text: string): Promise<number[]> {
  console.log('[EMBED] Starting embedding generation for text:', text.substring(0, 50) + '...')

  const openai = require('openai')
  const client = new openai.default({
    apiKey: process.env.OPENAI_API_KEY,
  })

  const response = await client.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  })

  console.log('[EMBED] Embedding generated, dimension:', response.data[0].embedding.length)
  return response.data[0].embedding
}

async function retrieveContext(userMessage: string): Promise<ContextDocument[]> {
  console.log('[CONTEXT] Starting context retrieval for user message:', userMessage.substring(0, 50) + '...')

  // Generate embedding for user message
  const embedding = await generateEmbedding(userMessage)

  // Retrieve similar documents from Supabase and Neo4j
  const documents = await retrieveContextDocuments(embedding, 5)

  console.log('[CONTEXT] Retrieved documents:', documents.length)

  return documents
}

export async function POST(request: NextRequest) {
  try {
    console.log('[POST] Chat API request started')

    // Check authentication
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      console.log('[POST] Unauthorized: no user')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
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

    // Retrieve context documents for the response
    console.log('[POST] Retrieving context documents...')
    const contextDocuments = await retrieveContext(userMessage)
    console.log('[POST] Context documents retrieved:', contextDocuments.length)

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

Masz dostęp do:
1. Bazy danych parlamentarnych (Supabase)
2. Grafu relacji między parlamentarzystami i procedurami (Neo4j) - możesz wysyłać zapytania Cypher
3. Wyszukiwania semantycznego dokumentów parlamentarnych

WAŻNE INSTRUKCJE:
1. Odpowiadaj zwięźle i precyzyjnie (max 2-3 akapity)
2. Unikaj powtórzeń i długich wyjaśnień
3. Zawsze cytuj źródła używając formatu [1], [2], itp.
4. Jeśli dokument ma datę zmian (changeDate), wspomń ją w kontekście
5. Odpowiadaj po polsku
6. Używaj dostępnych narzędzi aby znaleźć informacje, gdy jest to potrzebne
7. Nie wymyślaj danych - korzystaj z dostępnych narzędzi

Dostępne dokumenty w kontekście:
${contextDocuments
  .map(
    (doc: ContextDocument, i: number) => `
[${i + 1}] Typ: ${doc.type}
Tytuł: ${doc.title}
${doc.changeDate ? `Data zmian: ${doc.changeDate}` : ''}
Zawartość: ${doc.content.substring(0, 500)}${doc.content.length > 500 ? '...' : ''}
URL: ${doc.url || 'brak'}
---`
  )
  .join('\n')}
`

    // Bind tools to the model for tool calling
    const modelWithTools = model.bindTools(tools)

    console.log('[POST] Executing with tools...')

    // Create readable stream for SSE
    const readable = new ReadableStream({
      async start(controller) {
        try {
          // Send initial status
          controller.enqueue(createSSEMessage('status', {
            message: 'Parafrazowanie pytania...',
          }))

          // Convert messages to LangChain format
          const chatHistory = messages.map((msg) => {
            if (msg.role === 'user') {
              return new HumanMessage(msg.content)
            } else if (msg.role === 'assistant') {
              return new AIMessage(msg.content)
            }
            return new SystemMessage(msg.content)
          })

          // Send context retrieval status
          controller.enqueue(createSSEMessage('status', {
            message: 'Przeszukiwanie bazy danych...',
          }))

          // Invoke the model with the messages
          let response = await modelWithTools.invoke(chatHistory)

          // Handle tool calling loop
          let iterations = 0
          const maxIterations = 10
          const toolMap = Object.fromEntries(tools.map((t: any) => [t.name, t]))

          controller.enqueue(createSSEMessage('status', {
            message: 'Generowanie odpowiedzi...',
          }))

          while (response.tool_calls && response.tool_calls.length > 0 && iterations < maxIterations) {
            iterations++
            console.log('[POST] Tool call iteration', iterations)
            controller.enqueue(createSSEMessage('status', {
              message: `Przetwarzanie zapytania (krok ${iterations})...`,
            }))

            const toolCalls = response.tool_calls
            chatHistory.push(response) // Add assistant response

            // Execute each tool call
            for (const toolCall of toolCalls) {
              console.log('[POST] Executing tool:', toolCall.name)
              const toolObj = toolMap[toolCall.name]

              if (!toolObj) {
                console.error('[POST] Tool not found:', toolCall.name)
                chatHistory.push(
                  new HumanMessage(
                    `Tool ${toolCall.name} not found. Available tools: ${Object.keys(toolMap).join(', ')}`
                  )
                )
                continue
              }

              try {
                const toolResult = await (toolObj as any).invoke(toolCall.args as any)
                console.log('[POST] Tool result:', typeof toolResult, toolResult.substring?.(0, 100))
                chatHistory.push(
                  new HumanMessage(`Tool ${toolCall.name} result: ${toolResult}`)
                )
              } catch (err) {
                console.error('[POST] Tool execution error:', err)
                chatHistory.push(
                  new HumanMessage(
                    `Error executing tool ${toolCall.name}: ${err instanceof Error ? err.message : 'Unknown error'}`
                  )
                )
              }
            }

            // Get next response
            response = await modelWithTools.invoke(chatHistory)
          }

          // Extract message content properly
          let assistantMessage = ''
          if (typeof response.content === 'string') {
            assistantMessage = response.content
          } else if (Array.isArray(response.content)) {
            assistantMessage = response.content
              .filter((c: any) => typeof c === 'string' || c.type === 'text')
              .map((c: any) => (typeof c === 'string' ? c : c.text || ''))
              .join('')
          } else if (response.content && typeof response.content === 'object') {
            assistantMessage = JSON.stringify(response.content)
          }

          console.log('[POST] Agent execution complete, message length:', assistantMessage.length)

          // Stream the response content
          controller.enqueue(createSSEMessage('content', {
            data: assistantMessage,
          }))

          // Send references
          controller.enqueue(createSSEMessage('references', {
            references: contextDocuments.map((ref: ContextDocument) => ({
              type: ref.type,
              title: ref.title,
              url: ref.url,
              score: ref.score,
              changeDate: ref.changeDate,
            })),
          }))

          // Save to database if conversation ID provided
          if (conversationId) {
            console.log('[POST] Saving conversation to database...')
            try {
              await supabase
                .from('chat_messages')
                .insert({
                  conversation_id: conversationId,
                  role: 'user',
                  content: userMessage,
                } as any)

              await supabase
                .from('chat_messages')
                .insert({
                  conversation_id: conversationId,
                  role: 'assistant',
                  content: assistantMessage,
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
          controller.enqueue(createSSEMessage('error', {
            message: error instanceof Error ? error.message : 'Unknown error',
          }))
          controller.close()
        }
      },
    })

    return new NextResponse(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
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
