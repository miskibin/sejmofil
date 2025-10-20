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
}

export function useChat(initialConversationId?: string): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [conversationId, setConversationId] = useState<string | null>(
    initialConversationId || null
  )

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return

      setError(null)
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
        console.error('Chat error:', err)
      } finally {
        setIsLoading(false)
      }
    },
    [messages, conversationId]
  )

  const clearMessages = useCallback(() => {
    setMessages([])
    setInput('')
    setError(null)
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
  }
}
