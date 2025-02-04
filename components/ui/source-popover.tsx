import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { HelpCircle, MessagesSquare } from 'lucide-react'
import Link from 'next/link'

interface SourcePopoverProps {
  description?: string
  urls?: string[]
  aiPrompt?: string
  variant?: 'default' | 'inverted'
}

export function SourcePopover({
  description,
  urls,
  aiPrompt,
  variant = 'default',
}: SourcePopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            'text-primary',
            variant === 'inverted' && 'text-primary-foreground'
          )}
        >
          <HelpCircle className="h-5 w-5" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-96 border-2 border-primary p-4">
        <div className="max-h-[60vh] overflow-y-auto">
          {description && (
            <p className="mb-3 break-words text-sm text-muted-foreground">
              {description}
            </p>
          )}

          {urls && urls.length > 0 && (
            <div className="space-y-2">
              {urls.map((url, index) => (
                <Link
                  key={index}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block break-all text-sm text-primary hover:underline"
                >
                  {url}
                </Link>
              ))}
            </div>
          )}

          {aiPrompt && (
            <div className="mt-3 border-t pt-3">
              <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                <MessagesSquare className="h-3 w-3" />
                <span>Prompt AI</span>
              </div>
              <p className="break-words text-sm italic">{aiPrompt}</p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
