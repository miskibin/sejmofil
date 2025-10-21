import { useCallback, useState } from 'react'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  references?: Array<{
    type: string
    title: string
    url?: string | null
    score: number
    downloadUrl?: string
    changeDate?: string | null
  }>
}

export interface UseChatReturn {
  messages: ChatMessage[]
  input: string
  setInput: (input: string) => void
  isLoading: boolean
  error: string | null
  sendMessage: (content: string) => Promise<void>
  clearMessages: () => void
  conversationId: string | null
  setConversationId: (id: string | null) => void
  status: string | null
  isGenerating: boolean
  useStreaming?: boolean
}

export function useChat(initialConversationId?: string, useStreaming: boolean = true): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(
    initialConversationId || null
  )

  const sendMessageWithStreaming = useCallback(
    async (content: string) => {
      if (!content.trim()) return

      setError(null)
      setStatus('Przygotowanie pytania...')
      setIsLoading(true)

      try {
        // Add user message to state
        const userMessage: ChatMessage = {
          id: `msg-${Date.now()}`,
          role: 'user',
          content: content.trim(),
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, userMessage])
        setInput('')

        // Initialize streaming response with placeholder
        const assistantMessageId = `msg-${Date.now()}-assistant`
        const placeholderMessage: ChatMessage = {
          id: assistantMessageId,
          role: 'assistant',
          content: '',
          timestamp: new Date(),
          references: [],
        }

        setMessages((prev) => [...prev, placeholderMessage])

        // Call streaming API
        const response = await fetch('/api/chat/stream', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [
              ...messages.map((m) => ({
                role: m.role,
                content: m.content,
              })),
              {
                role: 'user',
                content: content.trim(),
              },
            ],
            conversationId,
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to send message')
        }

        const reader = response.body?.getReader()
        if (!reader) throw new Error('No response stream')

        const decoder = new TextDecoder()
        let buffer = ''
        let assistantContent = ''
        let references: any[] = []

        console.log('[useChat] Starting stream read loop')
        let chunkCount = 0

        while (true) {
          const { done, value } = await reader.read()
          if (done) {
            console.log('[useChat] Stream done after', chunkCount, 'chunks')
            break
          }

          chunkCount++
          const chunk = decoder.decode(value, { stream: true })
          console.log('[useChat] Received chunk', chunkCount, 'size:', chunk.length)
          
          buffer += chunk
          console.log('[useChat] Buffer size:', buffer.length, 'first 200 chars:', buffer.substring(0, 200))

          // Split by double newlines (SSE message separator)
          const messages = buffer.split('\n\n')

          // Keep the last incomplete message in buffer
          buffer = messages[messages.length - 1]
          console.log('[useChat] Split into', messages.length, 'parts, keeping incomplete:', buffer.length)

          for (let i = 0; i < messages.length - 1; i++) {
            const msg = messages[i]
            if (!msg.trim()) continue

            if (msg.startsWith('data: ')) {
              try {
                const jsonStr = msg.substring(6)
                console.log('[useChat] Parsing JSON:', jsonStr.substring(0, 100))
                const data = JSON.parse(jsonStr)
                console.log('[useChat] Received SSE event:', data.type)

                if (data.type === 'status') {
                  console.log('[useChat] Status update:', data.data.message)
                  setStatus(data.data.message)
                } else if (data.type === 'content') {
                  // Mark that we're now generating (hide status bubble)
                  setIsGenerating(true)
                  assistantContent += data.data.data
                  console.log('[useChat] Added content, total length:', assistantContent.length)
                  // Update message content in real-time
                  setMessages((prev) => {
                    return prev.map((msg) => {
                      if (msg.id === assistantMessageId) {
                        return {
                          ...msg,
                          content: assistantContent,
                        }
                      }
                      return msg
                    })
                  })
                } else if (data.type === 'references') {
                  references = data.data.references
                  console.log('[useChat] Received', references.length, 'references')
                  setMessages((prev) => {
                    return prev.map((msg) => {
                      if (msg.id === assistantMessageId) {
                        return {
                          ...msg,
                          references,
                        }
                      }
                      return msg
                    })
                  })
                } else if (data.type === 'done') {
                  console.log('[useChat] Stream completed')
                  setStatus(null)
                } else if (data.type === 'error') {
                  console.error('[useChat] Stream error:', data.data.message)
                  setError(data.data.message)
                  setStatus(null)
                }
              } catch (e) {
                console.error('[useChat] Error parsing SSE data:', e, 'message:', msg.substring(0, 200))
              }
            }
          }
        }

        // Process any remaining buffer content
        console.log('[useChat] Final buffer:', buffer.length, 'content:', buffer.substring(0, 200))
        if (buffer.trim() && buffer.startsWith('data: ')) {
          try {
            const jsonStr = buffer.substring(6)
            console.log('[useChat] Parsing final message JSON:', jsonStr.substring(0, 100))
            const data = JSON.parse(jsonStr)
            console.log('[useChat] Final SSE event:', data.type)
            if (data.type === 'references') {
              references = data.data.references
              console.log('[useChat] Final references:', references.length)
              setMessages((prev) => {
                return prev.map((msg) => {
                  if (msg.id === assistantMessageId) {
                    return {
                      ...msg,
                      references,
                    }
                  }
                  return msg
                })
              })
            }
          } catch (e) {
            console.error('[useChat] Error parsing final buffer:', e, 'buffer:', buffer.substring(0, 200))
          }
        }

        setStatus(null)
        console.log('[useChat] Stream processing complete')
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        setError(errorMessage)
        setStatus(null)
        console.error('[useChat] Chat error:', err)
      } finally {
        setIsLoading(false)
        setIsGenerating(false)
      }
    },
    [messages, conversationId]
  )

  const sendMessageWithoutStreaming = useCallback(
    async (content: string) => {
      if (!content.trim()) return

      setError(null)
      setIsLoading(true)
      setStatus('Przetwarzanie...')

      try {
        // Add user message to state
        const userMessage: ChatMessage = {
          id: `msg-${Date.now()}`,
          role: 'user',
          content: content.trim(),
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, userMessage])
        setInput('')

        // Call API
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [
              ...messages.map((m) => ({
                role: m.role,
                content: m.content,
              })),
              {
                role: 'user',
                content: content.trim(),
              },
            ],
            conversationId,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to send message')
        }

        const data = await response.json()

        // Add assistant message to state
        const assistantMessage: ChatMessage = {
          id: `msg-${Date.now()}-assistant`,
          role: 'assistant',
          content: data.message,
          timestamp: new Date(),
          references: data.references,
        }

        setMessages((prev) => [...prev, assistantMessage])
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        setError(errorMessage)
        console.error('[useChat] Chat error:', err)
      } finally {
        setIsLoading(false)
        setStatus(null)
        setIsGenerating(false)
      }
    },
    [messages, conversationId]
  )

  const sendMessage = useStreaming ? sendMessageWithStreaming : sendMessageWithoutStreaming

  const clearMessages = useCallback(() => {
    setMessages([])
    setInput('')
    setError(null)
    setStatus(null)
    setIsGenerating(false)
  }, [])

  return {
    messages,
    input,
    setInput,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    conversationId,
    setConversationId,
    status,
    isGenerating,
    useStreaming,
  }
}
