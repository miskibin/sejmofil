import { useCallback, useState, useEffect } from 'react'

const CHAT_STORAGE_KEY = 'sejmofil-chat-messages'
const MAX_MESSAGES = 6 // Maximum number of messages to store (3 pairs)

export interface ToolCall {
  iteration: number
  toolName: string
  arguments: Record<string, any>
  result?: string
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
  sendMessage: (content: string) => Promise<void>
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
    console.error('[useChat] Error loading messages from storage:', error)
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
    console.error('[useChat] Error saving messages to storage:', error)
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
      console.log('[useChat] Loaded', loadedMessages.length, 'messages from storage')
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
        let toolCalls: ToolCall[] = []

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
                } else if (data.type === 'tool_call') {
                  const toolCall: ToolCall = {
                    iteration: data.data.iteration,
                    toolName: data.data.toolName,
                    arguments: data.data.arguments,
                  }
                  toolCalls.push(toolCall)
                  console.log('[useChat] Tool call', data.data.iteration, ':', data.data.toolName)
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
                  console.log('[useChat] Tool result for iteration', iteration, ':', result?.substring(0, 100))
                  
                  // Find and update the tool call with the result
                  const toolCallIndex = toolCalls.findIndex(tc => tc.iteration === iteration)
                  if (toolCallIndex !== -1) {
                    toolCalls[toolCallIndex].result = result
                  }
                  
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
