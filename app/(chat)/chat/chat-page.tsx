'use client'

import React, { useState } from 'react'
import { useChat } from '@/hooks/useChat'
import type { ChatMessage as ChatMessageType } from '@/hooks/useChat'
import { 
  Message, 
  MessageContent
} from '@/components/ui/shadcn-io/ai/message'
import { Response } from '@/components/ui/shadcn-io/ai/response'
import { 
  Conversation,
  ConversationContent,
  ConversationScrollButton
} from '@/components/ui/shadcn-io/ai/conversation'
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
  PromptInputButton,
  PromptInputSubmit,
  PromptInputModelSelect,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectValue,
} from '@/components/ui/shadcn-io/ai/prompt-input'
import { ShimmeringText } from '@/components/ui/schimmering-text'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Zap, User, Bot } from 'lucide-react'

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

export default function ChatPage() {
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    stopGeneration,
    clearMessages,
    status,
    isGenerating,
  } = useChat()

  const [selectedModel, setSelectedModel] = useState<string>('gpt-5-nano')

  const handleSendMessage = async (content: string) => {
    await sendMessage(content, selectedModel)
  }

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-background">
      {/* Messages Container with Conversation component */}
      <Conversation className="pt-20 pb-4">
        <ConversationContent className="max-w-4xl mx-auto w-full px-4">
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
            <div className="space-y-6 py-4">
              {messages.map((message: ChatMessageType) => (
                <div key={message.id}>
                  <Message 
                    from={message.role} 
                    className={cn(
                      message.role === 'user' 
                        ? 'justify-end' 
                        : 'justify-start flex-row'
                    )}
                  >
                    <MessageContent 
                      className={cn(
                        message.role === 'user' && 'max-w-[80%]'
                      )}
                    >
                      {message.role === 'user' ? (
                        <div className="text-sm">{message.content}</div>
                      ) : (
                        <Response>{message.content}</Response>
                      )}
                      
                      {/* Show references if available */}
                      {message.references && message.references.length > 0 && (
                        <div className="mt-3 pt-3">
                          <p className="text-xs font-semibold text-muted-foreground mb-2">
                            Źródła:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {message.references.map((ref, idx) => (
                              <a
                                key={idx}
                                href={ref.url || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs px-2 py-1 bg-muted rounded hover:bg-muted/80 transition-colors"
                              >
                                [{idx + 1}] {ref.title}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </MessageContent>
                  </Message>

                  {/* Show tool calls in accordion after assistant message - only when not loading */}
                  {message.role === 'assistant' &&
                    message.toolCalls &&
                    message.toolCalls.length > 0 &&
                    !isLoading && (
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
              
              {/* Loading state with status and real-time agent steps */}
              {isLoading && (
                <div className="w-full">
                  {/* Status message */}
                  {status && !isGenerating && (
                    <div className="flex items-center gap-2 text-sm text-foreground mb-3">
                      <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
                      <ShimmeringText
                        text={status}
                        duration={1.5}
                        className="text-sm text-foreground"
                      />
                    </div>
                  )}
                  
                  {/* Generating message */}
                  {isGenerating && (
                    <div className="flex items-center gap-2 text-sm text-foreground mb-3">
                      <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
                      <ShimmeringText
                        text="Generowanie odpowiedzi..."
                        duration={1.5}
                        className="text-sm text-foreground"
                      />
                    </div>
                  )}
                  
                  {/* Show real-time tool calls during loading */}
                  {messages.length > 0 &&
                   messages[messages.length - 1]?.role === 'assistant' && 
                   messages[messages.length - 1]?.toolCalls && 
                   messages[messages.length - 1].toolCalls!.length > 0 && (
                    <div className="mt-3">
                      <Accordion type="single" collapsible defaultValue="tool-calls">
                        <AccordionItem value="tool-calls">
                          <AccordionTrigger className="text-xs font-semibold text-muted-foreground hover:text-foreground py-2">
                            Kroki agenta ({messages[messages.length - 1].toolCalls!.length})
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="flex flex-col gap-2 pt-2">
                              {messages[messages.length - 1].toolCalls!.map((toolCall, idx) => (
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
                                  {Object.keys(toolCall.arguments).length > 0 && (
                                    <details className="mt-1 cursor-pointer">
                                      <summary className="text-xs text-muted-foreground hover:text-foreground font-medium">
                                        📥 Parametry
                                      </summary>
                                      <pre className="text-xs bg-background border border-border p-2 rounded mt-1 overflow-auto max-h-32 text-foreground/80">
                                        {JSON.stringify(toolCall.arguments, null, 2)}
                                      </pre>
                                    </details>
                                  )}
                                  {toolCall.result && (
                                    <details className="mt-2 cursor-pointer" open>
                                      <summary className="text-xs text-muted-foreground hover:text-foreground font-medium">
                                        📤 Rezultat
                                      </summary>
                                      <div className="text-xs bg-background border border-border p-2 rounded mt-1 overflow-auto max-h-40">
                                        <pre className="text-foreground/80 whitespace-pre-wrap break-words">
                                          {typeof toolCall.result === 'string'
                                            ? toolCall.result
                                            : JSON.stringify(toolCall.result, null, 2)}
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
              )}
            </div>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

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
      <div className="sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 p-3 md:p-4">
        <div className="max-w-4xl mx-auto w-full">
          <PromptInput 
            onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              const message = formData.get('message') as string
              if (message?.trim()) {
                handleSendMessage(message.trim())
                e.currentTarget.reset()
              }
            }}
          >
            <PromptInputTextarea 
              placeholder="Zadaj pytanie o sejm..."
              disabled={isLoading}
            />
            <PromptInputToolbar>
              <PromptInputTools>
                <PromptInputModelSelect 
                  value={selectedModel} 
                  onValueChange={setSelectedModel}
                  disabled={isLoading}
                >
                  <PromptInputModelSelectTrigger className="h-8 gap-1 px-2">
                    <Zap size={14} />
                    <PromptInputModelSelectValue />
                  </PromptInputModelSelectTrigger>
                  <PromptInputModelSelectContent>
                    <PromptInputModelSelectItem value="gpt-5-nano">
                      GPT-5 Nano
                    </PromptInputModelSelectItem>
                    <PromptInputModelSelectItem value="gpt-5-mini-2025-08-07">
                      GPT-5 Mini
                    </PromptInputModelSelectItem>
                  </PromptInputModelSelectContent>
                </PromptInputModelSelect>
              </PromptInputTools>
              <PromptInputSubmit 
                status={isLoading ? (isGenerating ? 'streaming' : 'submitted') : undefined}
                onClick={(e) => {
                  if (isLoading) {
                    e.preventDefault()
                    stopGeneration()
                  }
                }}
              />
            </PromptInputToolbar>
          </PromptInput>
        </div>
      </div>
    </div>
  )
}