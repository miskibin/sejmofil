import { SearchResultItem } from '@/lib/types/search'
import { cn } from '@/lib/utils'
import { highlightText } from '@/lib/utils/highlight-text'
import { CalendarDays } from 'lucide-react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'

interface SearchResultCardProps extends SearchResultItem {
  className?: string
  searchQuery?: string
}

export function SearchResultCard({
  title,
  date,
  metadata,
  content,
  href,
  className,
  searchQuery,
}: SearchResultCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        'group block space-y-2 rounded-lg border-b px-0 py-4 transition-colors hover:bg-primary/10 sm:px-2',
        className
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {metadata.icon}
          <span>{metadata.text}</span>
        </div>
        {date && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            <time>{new Date(date).toLocaleDateString('pl-PL')}</time>
          </div>
        )}
      </div>

      <h3
        className="font-medium transition-colors group-hover:text-primary"
        dangerouslySetInnerHTML={{
          __html: searchQuery ? highlightText(title, searchQuery) : title,
        }}
      />

      {content && (
        <div className="prose prose-sm line-clamp-2 max-w-none dark:prose-invert">
          <ReactMarkdown rehypePlugins={[rehypeRaw]}>
            {searchQuery ? highlightText(content, searchQuery) : content}
          </ReactMarkdown>
        </div>
      )}
    </Link>
  )
}
