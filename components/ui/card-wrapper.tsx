import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { ReactNode } from 'react'
import { SourcePopover } from './source-popover'
interface CardWrapperProps {
  title?: string
  subtitle?: string
  headerIcon?: ReactNode
  showSource?: boolean
  showMoreLink?: string // replaced showDate
  showGradient?: boolean
  children: ReactNode
  sourceUrls?: string[]
  sourceDescription?: string
  aiPrompt?: string
  className?: string
  variant?: 'default' | 'inverted'
  imageSrc?: string
  headerElements?: ReactNode // Add this new prop
}

export function CardWrapper({
  title,
  subtitle,
  headerIcon,
  showGradient = false,
  showMoreLink,
  children,
  sourceUrls,
  sourceDescription,
  aiPrompt,
  className,
  variant = 'default',
  headerElements,
  imageSrc,
}: CardWrapperProps) {
  const isInverted = variant === 'inverted'

  return (
    <Card
      className={cn(
        'flex w-full flex-col',
        isInverted && 'bg-primary text-primary-foreground',
        className
      )}
    >
      {imageSrc && (
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-t-lg p-2">
          <Image
            src={imageSrc}
            alt=""
            className="h-full w-full rounded-t-lg object-cover"
            objectFit="cover"
            width={500}
            height={300}
          />
        </div>
      )}
      <CardHeader className="pb-2 lg:px-4 2xl:px-6">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            {title && (
              <CardTitle
                className={cn(
                  'truncate text-sm font-semibold',
                  isInverted ? 'text-primary-foreground' : 'text-primary'
                )}
              >
                {title}
              </CardTitle>
            )}
            {subtitle && (
              <h2 className="truncate text-2xl font-semibold">{subtitle}</h2>
            )}
          </div>
          <div className="flex flex-shrink-0 items-center gap-2">
            {headerElements}
            {headerIcon && <div className="">{headerIcon}</div>}
          </div>
        </div>
      </CardHeader>

      <CardContent className="mb-0 mt-4 flex min-h-12 flex-1 flex-col">
        <div className="relative flex-1">
          <div className="space-y-4">{children}</div>

          {showGradient && (
            <div
              className={cn(
                'pointer-events-none absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t',
                isInverted
                  ? 'from-primary via-primary to-transparent'
                  : 'from-white via-white/80 to-transparent'
              )}
            />
          )}
        </div>

        {(sourceDescription || sourceUrls || showMoreLink) && (
          <div
            className={cn(
              'mb-0 mt-1 flex items-center justify-between text-sm',
              isInverted
                ? 'text-primary-foreground/80'
                : 'text-muted-foreground'
            )}
          >
            {showMoreLink ? (
              <Link
                href={showMoreLink}
                prefetch={true}
                className={cn(
                  'flex cursor-pointer items-center rounded-full border px-2 py-1 transition-colors hover:bg-primary/5',
                  isInverted && 'border-primary-foreground/20'
                )}
              >
                Więcej <ArrowRight className="ml-1 inline h-4 w-4" />
              </Link>
            ) : (
              <div></div>
            )}
            {(sourceDescription || sourceUrls) && (
              <SourcePopover
                variant={variant}
                urls={sourceUrls}
                description={sourceDescription}
                aiPrompt={aiPrompt}
              />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
