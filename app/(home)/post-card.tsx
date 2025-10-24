'use client'
import { ImageWithFallback } from '@/components/ui/image-with-fallback'
import { MessageSquare, Share2, Vote, Calendar, Hash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import Link from 'next/link'
import { truncateText, cn } from '@/lib/utils'
import { PostVoting } from '@/components/post-voting'
import { useState } from 'react'
import { toast } from '@/hooks/use-toast'

export default function PostCard({
  category,
  title,
  description,
  comments = 0,
  pointId,
  proceedingNumber,
  date,
  votingNumbers,
  officialPoint,
  maxProceedingNumber,
  initialVotes = { upvotes: 0, downvotes: 0 },
  statementsCount = 0,
}: {
  category: string
  title: string
  description: string
  comments?: number
  pointId: number
  proceedingNumber: string
  date: string
  votingNumbers?: any[]
  officialPoint?: string | null
  maxProceedingNumber: number
  initialVotes?: { upvotes: number; downvotes: number }
  statementsCount?: number
}) {
  const hasVotes = Boolean(votingNumbers?.length)
  const [isSharing, setIsSharing] = useState(false)

  const postUrl = `/proceedings/${proceedingNumber}/${date}/${pointId}`
  const formattedDate = new Date(date).toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // Get proceeding label
  const proceedingNum = parseInt(proceedingNumber)
  let proceedingLabel = proceedingNumber
  if (proceedingNum === maxProceedingNumber) {
    proceedingLabel = `${proceedingNumber} (ostatnie)`
  } else if (proceedingNum === maxProceedingNumber - 1) {
    proceedingLabel = `${proceedingNumber} (przedostatnie)`
  }

  // Clean official point text - display only first 2 words
  const cleanOfficialPoint = officialPoint?.split(' ').slice(0, 2).join(' ')

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault()
    setIsSharing(true)

    const shareUrl = `${window.location.origin}${postUrl}`
    const shareData = {
      title,
      text: truncateText(description, 200, true),
      url: shareUrl,
    }

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(shareUrl)
        toast({
          title: 'Link skopiowany',
          description: 'Link został skopiowany do schowka',
        })
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        toast({
          variant: 'destructive',
          title: 'Błąd',
          description: 'Nie udało się udostępnić',
        })
      }
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden border-0 shadow-md">
      {/* Header with Category Badge */}
      <CardHeader className="pb-3 px-4 sm:px-6 space-y-3">
        <div className="flex items-start justify-between gap-3">
          {/* Category Badge - now more prominent */}
          <Badge
            variant="default"
            className="shrink-0 gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-full"
          >
            <span className="w-1.5 h-1.5 bg-primary-foreground rounded-full animate-pulse" />
            {category.split(' ').slice(0, 2).join(' ')}
          </Badge>

          {/* All Meta Badges - responsive display */}
          <div className="flex items-center gap-2 flex-wrap justify-end text-xs">
            {/* Desktop only: Proceeding number */}
            <Badge
              variant="outline"
              className="gap-1.5 h-7 px-2.5 rounded-full border-border/50 hidden sm:flex"
            >
              <Calendar className="h-3.5 w-3.5" />
              <span className="font-medium">{proceedingLabel}</span>
            </Badge>

            {/* Desktop only: Official point */}
            {cleanOfficialPoint && (
              <Badge
                variant="outline"
                className="gap-1.5 h-7 px-2.5 rounded-full border-border/50 hidden sm:flex"
              >
                <Hash className="h-3.5 w-3.5" />
                <span className="font-medium">{cleanOfficialPoint}</span>
              </Badge>
            )}

            {/* Show votings count on all screens */}
            {hasVotes && (
              <Badge
                variant="secondary"
                className="gap-1.5 h-7 px-2.5 rounded-full"
              >
                <Vote className="h-3.5 w-3.5" />
                <span className="font-medium">{votingNumbers!.length}</span>
              </Badge>
            )}

            {/* Show statements count on all screens - outline style */}
            {statementsCount > 0 && (
              <Badge
                variant="outline"
                className="gap-1.5 h-7 px-2.5 rounded-full border-border/50"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span className="font-medium">{statementsCount}</span>
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-4 px-4 sm:px-6 space-y-4">
        {/* Main Content Area */}
        <div className="flex flex-col md:flex-row items-start gap-4">
          {/* Text content */}
          <div className="flex-1 min-w-0 order-2 md:order-1 space-y-3">
            <Link href={postUrl} className="block group/title">
              <h2 className="text-xl sm:text-2xl font-bold leading-tight group-hover/title:text-primary transition-colors">
                {title}
              </h2>
            </Link>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed line-clamp-3">
              {truncateText(description, 400, true)}
            </p>
          </div>

          {/* Image */}
          <Link
            href={postUrl}
            className="block w-full md:w-72 lg:w-96 order-1 md:order-2"
          >
            <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-muted to-muted/50 aspect-video shrink-0 shadow-sm group-hover:shadow-lg transition-shadow duration-300">
              <ImageWithFallback
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/proceedings/${proceedingNumber}/${date}/${pointId}.jpg`}
                alt={title}
                fallbackSrc="/default.jpg"
                className="object-cover object-center group-hover:scale-110 transition-transform duration-500 ease-out"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 288px, 384px"
              />
            </div>
          </Link>
        </div>
      </CardContent>

      {/* Footer - Actions */}
      <CardFooter className="flex flex-wrap items-center gap-3 pt-3 pb-4 px-4 sm:px-6 border-t">
        <PostVoting pointId={pointId} initialVotes={initialVotes} />

        <Button
          variant="ghost"
          size="sm"
          className="gap-2 h-9 px-3 rounded-full"
          asChild
        >
          <Link href={`${postUrl}#comments`}>
            <MessageSquare className="w-4 h-4" />
            <span className="text-sm font-medium">{comments}</span>
          </Link>
        </Button>

        <span className="text-sm text-muted-foreground hidden sm:inline">
          {formattedDate}
        </span>

        <Button
          variant="ghost"
          size="sm"
          className="sm:ml-auto gap-2 h-9 px-3 rounded-full hover:bg-muted"
          onClick={handleShare}
          disabled={isSharing}
        >
          <Share2 className={cn('w-4 h-4', isSharing && 'animate-pulse')} />
          <span className="text-sm font-medium hidden xl:block">
            {isSharing ? 'Udostępnianie...' : 'Udostępnij'}
          </span>
        </Button>
      </CardFooter>
    </Card>
  )
}
