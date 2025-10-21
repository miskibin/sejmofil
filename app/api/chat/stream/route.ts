import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { retrieveContextDocuments } from '@/lib/db/retrieveContextDocuments'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

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

async function generateEmbedding(text: string): Promise<number[]> {
  console.log('[EMBED] Starting embedding generation for text:', text.substring(0, 50) + '...')

  const response = await openai.embeddings.create({
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
  console.log('[CONTEXT] Documents details:', documents.map((d, i) => ({
    index: i,
    type: d.type,
    title: d.title?.substring(0, 50),
    id: d.id,
    url: d.url,
  })))

  return documents
}

// Helper to send SSE events
function createSSEMessage(type: string, data: any): string {
  const jsonStr = JSON.stringify({ type, data })
  const msg = `data: ${jsonStr}\n\n`
  console.log('[SSE] Creating message type:', type, 'message:', msg.substring(0, 100))
  return msg
}

export async function POST(request: NextRequest) {
  try {
    console.log('[STREAM POST] Chat streaming API request started')

    // Check authentication
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      console.log('[STREAM POST] Unauthorized: no user')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('[STREAM POST] User authenticated:', user.id)

    // Parse request
    const body: ChatRequest = await request.json()
    const { messages, conversationId } = body

    console.log('[STREAM POST] Request body:', {
      messageCount: messages?.length,
      conversationId,
      lastMessagePreview: messages?.[messages.length - 1]?.content?.substring(0, 50),
    })

    if (!messages || messages.length === 0) {
      console.log('[STREAM POST] No messages in request')
      return NextResponse.json(
        { error: 'Messages are required' },
        { status: 400 }
      )
    }

    // Get user's last message for context retrieval
    const userMessage = messages[messages.length - 1]?.content || ''
    console.log('[STREAM POST] User message:', userMessage.substring(0, 100))

    // Create readable stream for SSE
    const readable = new ReadableStream({
      async start(controller) {
        try {
          // Send initial status
          console.log('[STREAM POST] Sending initial status...')
          controller.enqueue(createSSEMessage('status', {
            message: 'Parafrazowanie pytania...',
          }))
          console.log('[STREAM POST] Initial status sent')

          // Retrieve context documents
          console.log('[STREAM POST] Calling retrieveContext...')
          controller.enqueue(createSSEMessage('status', {
            message: 'Przeszukiwanie bazy danych...',
          }))

          const contextDocuments = await retrieveContext(userMessage)
          console.log('[STREAM POST] Context documents retrieved:', contextDocuments.length)

          controller.enqueue(createSSEMessage('status', {
            message: 'Generowanie odpowiedzi...',
          }))

          // Get current date
          const today = new Date()
          const dateStr = today.toLocaleDateString('pl-PL', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })

          // Build system message with context
          const systemMessage = `Jesteś asystentem Sejmu Polskiego. Dzisiejsza data to: ${dateStr}

Masz dostęp do oficjalnych dokumentów parlamentarnych zawierających procedury, głosowania i materiały legislacyjne.

WAŻNE INSTRUKCJE:
1. Odpowiadaj zwięźle i precyzyjnie (max 2-3 akapity)
2. Unikaj powtórzeń i długich wyjaśnień
3. Zawsze cytuj źródła używając formatu [1], [2], itp.
4. Jeśli dokument ma datę zmian (changeDate), wspomń ją w kontekście
5. Odpowiadaj po polsku

Dostępne dokumenty:
${contextDocuments
  .map(
    (doc, i) => `
[${i + 1}] Typ: ${doc.type}
Tytuł: ${doc.title}
${doc.changeDate ? `Data zmian: ${doc.changeDate}` : ''}
Zawartość: ${doc.content.substring(0, 500)}${doc.content.length > 500 ? '...' : ''}
URL: ${doc.url || 'brak'}
---`
  )
  .join('\n')}
`

          // Stream the OpenAI response
          console.log('[STREAM POST] Starting OpenAI stream...')
          const stream = await openai.chat.completions.create({
            model: 'gpt-5-nano',
            messages: [
              {
                role: 'system',
                content: systemMessage,
              },
              ...messages,
            ],
            stream: true,
          })
          console.log('[STREAM POST] OpenAI stream created, beginning iteration...')

          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || ''
            if (content) {
              console.log('[STREAM POST] Sending content chunk:', content.length, 'bytes')
              controller.enqueue(createSSEMessage('content', {
                data: content,
              }))
            }
          }

          // Send references
          controller.enqueue(createSSEMessage('references', {
            references: contextDocuments.map((ref) => ({
              type: ref.type,
              title: ref.title,
              url: ref.url,
              score: ref.score,
              changeDate: ref.changeDate,
            })),
          }))

          // Save to database if conversation ID provided
          if (conversationId) {
            console.log('[STREAM POST] Saving conversation to database...')
            try {
              await supabase
                .from('chat_messages')
                .insert({
                  conversation_id: conversationId,
                  role: 'user',
                  content: userMessage,
                } as any)
            } catch (err) {
              console.error('[STREAM POST] Error saving user message:', err)
            }
          }

          controller.enqueue(createSSEMessage('done', { success: true }))
          controller.close()
        } catch (error) {
          console.error('[STREAM POST] Streaming error:', error)
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
    console.error('[STREAM POST] Chat streaming API error:', error)
    if (error instanceof Error) {
      console.error('[STREAM POST] Error message:', error.message)
      console.error('[STREAM POST] Error stack:', error.stack)
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
