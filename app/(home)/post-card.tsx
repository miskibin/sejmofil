'use client'
import Image from 'next/image'
import { MessageSquare, Share2, Vote } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { truncateText } from '@/lib/utils'
import { PostVoting } from '@/components/post-voting'
import { useState } from 'react'
import { cn } from "@/lib/utils"
import { toast } from '@/hooks/use-toast'

export default function PostCard({
  category,
  title,
  description,
  comments,
  pointId,
  proceedingNumber,
  date,
  votingNumbers,
  initialVotes = { upvotes: 0, downvotes: 0 },
}: {
  [key: string]: any // We're getting these props from the database anyway
}) {
  const hasVotes = Boolean(votingNumbers && votingNumbers.length > 0)
  const [isSharing, setIsSharing] = useState(false)

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault()
    setIsSharing(true)
    
    const shareUrl = `${window.location.origin}/proceedings/${proceedingNumber}/${date}/${pointId}`
    const shareData = {
      title: title,
      text: truncateText(description, 100),
      url: shareUrl,
    }

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(shareUrl)
        toast({
          title: "Link skopiowany",
          description: "Link został skopiowany do schowka",
        })
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        toast({
          variant: "destructive",
          title: "Błąd",
          description: "Nie udało się udostępnić",
        })
      }
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-3 p-2 sm:p-4">
      {/* Header and Image */}
      <div className="flex flex-col md:flex-row items-start gap-3 sm:gap-6">
        {/* Text content */}
        <div className="flex-1 min-w-0 order-2 md:order-1">
          {/* Category and badges */}
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className="text-primary text-sm font-medium flex items-center gap-2">
              <span className="w-2 h-2 bg-primary rounded-full" />
              {category}
            </span>
            {hasVotes && (
              <Badge variant="secondary" className="gap-1">
                <Vote className="h-3 w-3" />
                {votingNumbers?.length}
              </Badge>
            )}
          </div>
          <Link
            href={`/proceedings/${proceedingNumber}/${date}/${pointId}`}
            className="block hover:opacity-80 transition-opacity"
          >
            <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-2">
              {title}
            </h2>
          </Link>
          <p className="text-muted-foreground text-sm sm:text-base line-clamp-3 md:line-clamp-none">
            {truncateText(description, 240, true)}
          </p>
        </div>
        
        {/* Image */}
        <div className="relative rounded-lg overflow-hidden bg-muted w-full md:w-[200px] lg:w-[300px] order-1 md:order-2">
          <div className="aspect-video">
            <Image
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/proceedings/${proceedingNumber}/${date}/${pointId}.jpg`}
              alt={title}
              className="object-cover"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 200px, 300px"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <PostVoting pointId={pointId} initialVotes={initialVotes} />
        <span className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          {comments} komentarzy
        </span>
        <Button 
          variant="ghost" 
          size="sm" 
          className="sm:ml-auto"
          onClick={handleShare}
          disabled={isSharing}
        >
          <Share2 className={cn("w-4 h-4", isSharing && "animate-pulse")} />
          <span className="hidden sm:inline ml-2">
            {isSharing ? 'Udostępnianie...' : 'Udostępnij'}
          </span>
        </Button>
      </div>
    </div>
  )
}
