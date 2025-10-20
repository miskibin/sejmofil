import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { retrieveContextDocuments } from '@/lib/db/retrieveContextDocuments'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Initialize Langfuse for tracing (optional, will work without it)
let langfuse: any = null
try {
  if (process.env.NEXT_PUBLIC_LANGFUSE_PUBLIC_KEY && process.env.NEXT_PUBLIC_LANGFUSE_SECRET_KEY) {
    const { Langfuse } = require('langfuse')
    langfuse = new Langfuse({
      publicKey: process.env.NEXT_PUBLIC_LANGFUSE_PUBLIC_KEY,
      secretKey: process.env.NEXT_PUBLIC_LANGFUSE_SECRET_KEY,
      baseUrl: process.env.NEXT_PUBLIC_LANGFUSE_HOST || 'https://cloud.langfuse.com',
    })
  }
} catch (error) {
  console.warn('Langfuse initialization failed, tracing disabled:', error)
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

async function generateResponse(
  messages: ChatMessage[],
  contextDocuments: ContextDocument[],
  conversationId?: string
): Promise<{ response: string; references: ContextDocument[] }> {
  console.log('[RESPONSE] Generating response with', contextDocuments.length, 'context documents')
  console.log('[RESPONSE] Conversation ID:', conversationId)
  
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

  console.log('[RESPONSE] System message length:', systemMessage.length)

  // Create trace in Langfuse if available
  let generation: any = null
  let parentTrace: any = null
  if (langfuse) {
    parentTrace = langfuse.trace({
      name: 'chat-response-generation',
      userId: conversationId || 'anonymous',
      metadata: {
        documentCount: contextDocuments.length,
        date: dateStr,
      },
    })

    // Track retrieved chunks/documents as separate observations
    contextDocuments.forEach((doc, idx) => {
      parentTrace.span({
        name: `retrieved-chunk-${idx + 1}`,
        input: messages[messages.length - 1]?.content || '',
        metadata: {
          chunkIndex: idx + 1,
          type: doc.type,
          score: doc.score,
          title: doc.title?.substring(0, 100),
        },
        output: {
          title: doc.title,
          type: doc.type,
          contentLength: doc.content.length,
          url: doc.url,
          score: doc.score,
        },
      })
    })

    generation = parentTrace.generation({
      name: 'openai-chat',
      model: 'gpt-5-nano',
      input: messages,
      systemPrompt: systemMessage,
    })
  }

  try {
    console.log('[RESPONSE] Calling OpenAI API...')
    const response = await openai.chat.completions.create({
      model: 'gpt-5-nano',
      messages: [
        {
          role: 'system',
          content: systemMessage,
        },
        ...messages,
      ],
    })

    const assistantMessage = response.choices[0]?.message?.content || ''
    console.log('[RESPONSE] OpenAI response received, length:', assistantMessage.length)

    if (generation) {
      generation.end({
        output: assistantMessage,
        usage: {
          input: response.usage?.prompt_tokens || 0,
          output: response.usage?.completion_tokens || 0,
        },
      })
    }

    return {
      response: assistantMessage,
      references: contextDocuments,
    }
  } catch (error) {
    console.error('[RESPONSE] Error generating response:', error)
    if (generation) {
      generation.end({
        error: `${error instanceof Error ? error.message : 'Unknown error'}`,
      })
    }
    throw error
  }
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
      lastMessagePreview: messages?.[messages.length - 1]?.content?.substring(0, 50),
    })

    if (!messages || messages.length === 0) {
      console.log('[POST] No messages in request')
      return NextResponse.json(
        { error: 'Messages are required' },
        { status: 400 }
      )
    }

    // Get user's last message for context retrieval
    const userMessage = messages[messages.length - 1]?.content || ''
    console.log('[POST] User message:', userMessage.substring(0, 100))

    // Retrieve context documents
    console.log('[POST] Calling retrieveContext...')
    const contextDocuments = await retrieveContext(userMessage)
    console.log('[POST] Context documents retrieved:', contextDocuments.length)
    contextDocuments.forEach((doc, i) => {
      console.log(`[POST] Document ${i}:`, {
        type: doc.type,
        title: doc.title?.substring(0, 50),
        id: doc.id,
        url: doc.url,
      })
    })

    // Generate response using OpenAI with Langfuse tracing
    console.log('[POST] Generating response...')
    const { response, references } = await generateResponse(
      messages,
      contextDocuments,
      conversationId || user.id
    )

    console.log('[POST] Response generated, length:', response.length)
    console.log('[POST] References:', references.length)
    
    // If conversation ID provided, save message to database
    if (conversationId) {
      console.log('[POST] Saving conversation to database...')
      // Save user message
      await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          role: 'user',
          content: userMessage,
        })

      // Save assistant message
      await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          role: 'assistant',
          content: response,
        })
      console.log('[POST] Conversation saved')
    }

    // Flush Langfuse if available
    if (langfuse) {
      await langfuse.flush()
    }

    const responsePayload = {
      message: response,
      references: references.map((ref, i) => {
        const mapped = {
          type: ref.type,
          title: ref.title,
          url: ref.url,
          score: ref.score,
          changeDate: ref.changeDate,
        }
        console.log(`[POST] Reference ${i} mapped:`, mapped)
        return mapped
      }),
    }

    console.log('[POST] Sending response with', responsePayload.references.length, 'references')
    return NextResponse.json(responsePayload)
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
