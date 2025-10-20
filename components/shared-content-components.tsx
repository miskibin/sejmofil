'use client'

import { EmptyState } from '@/components/empty-state'
import { CardWrapper } from '@/components/ui/card-wrapper'
import { Sparkles } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

interface ContentProps {
  content: string | null | undefined
}

interface SummaryProps extends ContentProps {
  title: string
  subtitle: string
  emptyText: string
  headerIcon?: React.ReactNode
}

interface InfoItemProps {
  label: string
  value: string
}

/**
 * Renders markdown content with empty state fallback
 */
export const MarkdownContent = ({ content }: ContentProps) => {
  if (!content || content === 'null') return null
  return (
    <div className="prose prose-sm max-w-none">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  )
}

/**
 * Summary card with markdown content and sparkle icon
 */
export const SummaryCard = ({
  content,
  title,
  subtitle,
  emptyText,
  headerIcon = <Sparkles className="h-5 w-5 text-primary" fill="#76052a" />,
}: SummaryProps) => (
  <CardWrapper
    title={title}
    subtitle={subtitle}
    className="h-full"
    headerIcon={headerIcon}
  >
    {content && content !== 'null' ? (
      <div className="prose prose-sm max-w-none">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    ) : (
      <EmptyState text={emptyText} image="empty.svg" />
    )}
  </CardWrapper>
)

/**
 * Renders a single info item with label and value
 */
export const InfoItem = ({ label, value }: InfoItemProps) => (
  <div className="space-y-2">
    <h3 className="text-sm font-medium text-muted-foreground">{label}</h3>
    <p className="text-sm">{value || `Brak ${label.toLowerCase()}`}</p>
  </div>
)

/**
 * Generic info display component for multiple items
 */
export const InfoDisplay = ({
  items,
}: {
  items: Array<{ label: string; value: string }>
}) => (
  <div className="space-y-4">
    {items.map((item) => (
      <InfoItem key={item.label} {...item} />
    ))}
  </div>
)
