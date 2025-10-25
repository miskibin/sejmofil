'use client'

import React, { useEffect, useRef, useMemo, useState } from 'react'
import { useChat } from '@/hooks/useChat'
import type { ChatMessage as ChatMessageType } from '@/hooks/useChat'
import { ChatInput } from '@/components/ui/chat-input'
import { Message } from '@/components/ui/message'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Zap } from 'lucide-react'

const MessageCircleIcon = () => (
  <svg
    className="h-12 w-12"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
    />
  </svg>
)

interface ReferenceData {
  [key: number]: {
    title: string
    url?: string | null
    downloadUrl?: string
    changeDate?: string | null
  }
}

export default function ChatPage() {
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    status,
    isGenerating,
  } = useChat()

  const [selectedModel, setSelectedModel] = useState<string>('gpt-5-nano')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Build reference map from all messages' references
  const referenceMap: ReferenceData = useMemo(() => {
    const map: ReferenceData = {}
    let refIndex = 1

    messages.forEach((msg) => {
      if (msg.references && msg.role === 'assistant') {
        msg.references.forEach((ref) => {
          map[refIndex] = {
            title: ref.title,
            url: ref.url || undefined,
            changeDate: ref.changeDate || undefined,
            // downloadUrl can be extracted from the print page if needed
          }
          refIndex++
        })
      }
    })

    return map
  }, [messages])

  // Create pattern handlers for citations and print links
  const patternHandlers = useMemo(
    () => [
      // Handle numbered citations [1], [2], etc. with popover
      {
        pattern: /\[(\d+)\]/g,
        render: (match: RegExpExecArray) => {
          const referenceNum = parseInt(match[1])
          const refData = referenceMap[referenceNum]

          if (!refData) {
            // Fallback to simple link if reference not found
            return (
              <a
                href={`#reference-${referenceNum}`}
                className="text-primary hover:underline font-semibold"
              >
                [{referenceNum}]
              </a>
            )
          }

          return (
            <ReferencePopoverTrigger
              number={referenceNum}
              title={refData.title}
              url={refData.url || undefined}
              downloadUrl={refData.downloadUrl}
              changeDate={refData.changeDate}
            />
          )
        },
      },
      // Handle print links (Druk XXX)
      {
        pattern: /Druk\s+(\d+)/gi,
        render: (match: RegExpExecArray) => {
          const number = match[1]
          return (
            <a
              href={`/prints/${number}`}
              className="text-primary hover:underline font-semibold"
            >
              [{match[0]}](/prints/{number})
            </a>
          )
        },
      },
    ],
    [referenceMap]
  )

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (content: string) => {
    await sendMessage(content, selectedModel)
  }

  // Define tools for ChatInput (model selector)
  const tools = [
    {
      id: 'model',
      label: 'Model',
      icon: <Zap size={14} />,
      type: 'dropdown' as const,
      value: selectedModel,
      options: [
        { value: 'gpt-5-nano', label: 'GPT-5 Nano' },
        { value: 'gpt-5-mini-2025-08-07', label: 'GPT-5 Mini' },
      ],
      onChange: (value: string) => {
        setSelectedModel(value)
        console.log('Model changed to:', value)
      },
    },
  ]

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-background">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto pt-20 pb-4">
        <div className="max-w-4xl mx-auto w-full px-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center min-h-[50vh] md:min-h-[60vh]">
              <div className="text-center px-4">
                <div className="h-12 w-12 text-muted-foreground mx-auto mb-4">
                  <MessageCircleIcon />
                </div>
                <h2 className="text-lg font-semibold mb-2">Zacznij rozmowę</h2>
                <p className="text-sm text-muted-foreground max-w-md mb-3">
                  Pytaj mnie o druki sejmowe
                </p>
                <p className="text-xs text-muted-foreground/70 max-w-md italic">
                  Beta: Na razie chat może odpowiadać tylko na pytania o druki
                  sejmowe
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              {messages.map((message: ChatMessageType) => (
                <div key={message.id}>
                  <Message
                    sender={message.role}
                    content={message.content}
                    references={message.references}
                    patternHandlers={patternHandlers}
                  />
                  {/* Show tool calls in accordion after assistant message */}
                  {message.role === 'assistant' &&
                    message.toolCalls &&
                    message.toolCalls.length > 0 && (
                      <div className="mt-3">
                        <Accordion type="single" collapsible defaultValue="">
                          <AccordionItem value="tool-calls">
                            <AccordionTrigger className="text-xs font-semibold text-muted-foreground hover:text-foreground py-2">
                              Kroki agenta ({message.toolCalls.length})
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="flex flex-col gap-2 pt-2">
                                {message.toolCalls.map((toolCall, idx) => (
                                  <div
                                    key={idx}
                                    className="rounded px-3 py-2 border border-border bg-muted/30"
                                  >
                                    <div className="flex items-center justify-between mb-2">
                                      <p className="text-xs font-semibold">
                                        <span className="text-muted-foreground">
                                          Krok {toolCall.iteration}:
                                        </span>{' '}
                                        <span className="text-primary font-mono">
                                          {toolCall.toolName}
                                        </span>
                                      </p>
                                      {toolCall.duration !== undefined && (
                                        <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-0.5 rounded">
                                          {toolCall.duration}ms
                                        </span>
                                      )}
                                    </div>
                                    {Object.keys(toolCall.arguments).length >
                                      0 && (
                                      <details className="mt-1 cursor-pointer">
                                        <summary className="text-xs text-muted-foreground hover:text-foreground font-medium">
                                          📥 Parametry
                                        </summary>
                                        <pre className="text-xs bg-background border border-border p-2 rounded mt-1 overflow-auto max-h-32 text-foreground/80">
                                          {JSON.stringify(
                                            toolCall.arguments,
                                            null,
                                            2
                                          )}
                                        </pre>
                                      </details>
                                    )}
                                    {toolCall.result && (
                                      <details
                                        className="mt-2 cursor-pointer"
                                        open
                                      >
                                        <summary className="text-xs text-muted-foreground hover:text-foreground font-medium">
                                          📤 Rezultat
                                        </summary>
                                        <div className="text-xs bg-background border border-border p-2 rounded mt-1 overflow-auto max-h-40">
                                          <pre className="text-foreground/80 whitespace-pre-wrap break-words">
                                            {typeof toolCall.result === 'string'
                                              ? toolCall.result
                                              : JSON.stringify(
                                                  toolCall.result,
                                                  null,
                                                  2
                                                )}
                                          </pre>
                                        </div>
                                      </details>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </div>
                    )}
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex flex-col gap-2">
                    {status && !isGenerating && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground italic">
                        <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
                        {status}
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-4xl mx-auto w-full px-4 pb-2">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm text-destructive">
            {error}
          </div>
        </div>
      )}

      {/* Clear Messages Button */}
      {messages.length > 0 && (
        <div className="max-w-4xl mx-auto w-full px-4 pb-2">
          <div className="flex justify-center">
            <Button
              onClick={clearMessages}
              disabled={isLoading}
              variant="ghost"
              size="sm"
            >
              zapytaj o coś nowego
            </Button>
          </div>
        </div>
      )}

      {/* Input Area - Fixed at bottom */}
      <div className="sticky bottom-0 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 p-3 md:p-4">
        <div className="max-w-4xl mx-auto w-full">
          <ChatInput
            onSend={handleSendMessage}
            isLoading={isLoading}
            placeholder="Zadaj pytanie o sejm... (Shift+Enter dla nowej linii)"
            tools={tools}
          />
        </div>
      </div>
    </div>
  )
}

// Reference Popover Trigger Component
function ReferencePopoverTrigger({
  number,
  title,
  url,
  downloadUrl,
  changeDate,
}: {
  number: number
  title: string
  url?: string
  downloadUrl?: string
  changeDate?: string | null
}) {
  const {
    Popover,
    PopoverTrigger,
    PopoverContent,
  } = require('@/components/ui/popover')
  const { ExternalLink, Download, Calendar } = require('lucide-react')

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="text-primary hover:underline font-semibold inline hover:bg-primary/10 rounded px-1 transition-colors cursor-help">
          [{number}]
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3">
        <div className="space-y-3">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">
              Dokument
            </p>
            <p className="text-sm font-medium text-foreground">{title}</p>
          </div>

          {changeDate && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Data zmian: {changeDate}</span>
            </div>
          )}

          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
              Strona dokumentu
            </a>
          )}

          {downloadUrl && (
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <Download className="h-4 w-4" />
              Pobierz dokument
            </a>
          )}

          {!url && !downloadUrl && (
            <p className="text-xs text-muted-foreground italic">
              Brak dostępnych linków
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
