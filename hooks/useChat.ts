import { useCallback, useState, useEffect } from 'react'

const CHAT_STORAGE_KEY = 'sejmofil-chat-messages'
const MAX_MESSAGES = 6 // Maximum number of messages to store (3 pairs)

export interface ToolCall {
  iteration: number
  toolName: string
  arguments: Record<string, any>
  result?: string
  duration?: number // Time in milliseconds
}

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
  toolCalls?: ToolCall[]
}

export interface UseChatReturn {
  messages: ChatMessage[]
  input: string
  setInput: (input: string) => void
  isLoading: boolean
  error: string | null
  sendMessage: (content: string, model?: string) => Promise<void>
  clearMessages: () => void
  conversationId: string | null
  setConversationId: (id: string | null) => void
  status: string | null
  isGenerating: boolean
}

// Helper functions for localStorage
function loadMessagesFromStorage(): ChatMessage[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(CHAT_STORAGE_KEY)
    if (!stored) return []
    
    const parsed = JSON.parse(stored)
    // Convert timestamp strings back to Date objects
    return parsed.map((msg: any) => ({
      ...msg,
      timestamp: new Date(msg.timestamp),
    }))
  } catch (error) {
    return []
  }
}

function saveMessagesToStorage(messages: ChatMessage[]) {
  if (typeof window === 'undefined') return
  
  try {
    // Keep only the last MAX_MESSAGES
    const messagesToSave = messages.slice(-MAX_MESSAGES)
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messagesToSave))
  } catch (error) {
    // Silently fail
  }
}

export function useChat(initialConversationId?: string): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(
    initialConversationId || null
  )

  // Load messages from localStorage on mount
  useEffect(() => {
    const loadedMessages = loadMessagesFromStorage()
    if (loadedMessages.length > 0) {
      setMessages(loadedMessages)
    }
  }, [])

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      saveMessagesToStorage(messages)
    }
  }, [messages])

  const sendMessage = useCallback(
    async (content: string, model?: string) => {
      if (!content.trim()) return

      setError(null)
      setStatus('Przygotowanie pytania...')
      setIsLoading(true)

      // Timeout for the entire request (60 seconds)
      const requestTimeout = setTimeout(() => {
        console.error('[Chat] Timeout')
        setError('Przekroczono czas oczekiwania. Spróbuj ponownie z krótszym pytaniem.')
        setIsLoading(false)
        setIsGenerating(false)
        setStatus(null)
      }, 60000)

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

        // Get the last MAX_MESSAGES messages for context (to limit token usage)
        const recentMessages = messages.slice(-MAX_MESSAGES)

        // Call agent API endpoint (SSE streaming)
        const response = await fetch('/api/chat/agent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [
              ...recentMessages.map((m) => ({
                role: m.role,
                content: m.content,
              })),
              {
                role: 'user',
                content: content.trim(),
              },
            ],
            conversationId,
            model, // Pass the selected model
          }),
        })

        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error')
          console.error('[Chat] API error:', response.status)
          throw new Error(`Request failed: ${response.status} - ${errorText}`)
        }

        const reader = response.body?.getReader()
        if (!reader) {
          console.error('[Chat] No stream')
          throw new Error('No response stream available')
        }

        const decoder = new TextDecoder()
        let buffer = ''
        let assistantContent = ''
        let references: any[] = []
        let toolCalls: ToolCall[] = []
        let hasReceivedContent = false

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          buffer += chunk

          // Split by double newlines (SSE message separator)
          const messages = buffer.split('\n\n')

          // Keep the last incomplete message in buffer
          buffer = messages[messages.length - 1]

          for (let i = 0; i < messages.length - 1; i++) {
            const msg = messages[i]
            if (!msg.trim()) continue

            if (msg.startsWith('data: ')) {
              try {
                const jsonStr = msg.substring(6)
                const data = JSON.parse(jsonStr)

                if (data.type === 'status') {
                  setStatus(data.data.message)
                } else if (data.type === 'content') {
                  hasReceivedContent = true
                  // Mark that we're now generating (hide status bubble)
                  setIsGenerating(true)
                  assistantContent += data.data.data
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
                } else if (data.type === 'tool_call') {
                  const toolCall: ToolCall = {
                    iteration: data.data.iteration,
                    toolName: data.data.toolName,
                    arguments: data.data.arguments,
                    duration: data.data.duration,
                  }
                  toolCalls.push(toolCall)
                  setMessages((prev) => {
                    return prev.map((msg) => {
                      if (msg.id === assistantMessageId) {
                        return {
                          ...msg,
                          toolCalls,
                        }
                      }
                      return msg
                    })
                  })
                } else if (data.type === 'tool_result') {
                  const iteration = data.data.iteration
                  const result = data.data.result
                  const duration = data.data.duration
                  
                  // Find and update the tool call with the result and duration
                  const toolCallIndex = toolCalls.findIndex(tc => tc.iteration === iteration)
                  if (toolCallIndex !== -1) {
                    toolCalls[toolCallIndex].result = result
                    if (duration !== undefined) {
                      toolCalls[toolCallIndex].duration = duration
                    }
                  }
                  
                  setMessages((prev) => {
                    return prev.map((msg) => {
                      if (msg.id === assistantMessageId) {
                        return {
                          ...msg,
                          toolCalls: [...toolCalls],
                        }
                      }
                      return msg
                    })
                  })
                } else if (data.type === 'references') {
                  references = data.data.references
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
                  setStatus(null)
                } else if (data.type === 'error') {
                  console.error('[Chat] Server error:', data.data.message)
                  setError(data.data.message)
                  setStatus(null)
                }
              } catch (e) {
                // Silently skip malformed messages
              }
            }
          }
        }

        // Check if we received any content
        if (!hasReceivedContent) {
          console.error('[Chat] No content received')
          throw new Error('No response received from server')
        }

        // Process any remaining buffer content
        if (buffer.trim() && buffer.startsWith('data: ')) {
          try {
            const jsonStr = buffer.substring(6)
            const data = JSON.parse(jsonStr)
            if (data.type === 'references') {
              references = data.data.references
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
            // Silently skip
          }
        }

        clearTimeout(requestTimeout)
        setStatus(null)
      } catch (err) {
        clearTimeout(requestTimeout)
        console.error('[Chat] Error:', err)
        const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd'
        setError(`Błąd: ${errorMessage}`)
        setStatus(null)
        
        // Remove the placeholder assistant message if it's empty
        setMessages((prev) => {
          const lastMsg = prev[prev.length - 1]
          if (lastMsg && lastMsg.role === 'assistant' && !lastMsg.content) {
            return prev.slice(0, -1)
          }
          return prev
        })
      } finally {
        clearTimeout(requestTimeout)
        setIsLoading(false)
        setIsGenerating(false)
      }
    },
    [messages, conversationId]
  )

  const clearMessages = useCallback(() => {
    setMessages([])
    setInput('')
    setError(null)
    setStatus(null)
    setIsGenerating(false)
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CHAT_STORAGE_KEY)
    }
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
  }
}
