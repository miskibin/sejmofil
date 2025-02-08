'use client'
import Image from 'next/image'
import { MessageSquare, Share2, Vote } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { truncateText } from '@/lib/utils'
import { useSupabaseSession } from '@/lib/hooks/use-supabase-session'
import { PostVoting } from '@/components/post-voting'

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
  const { user } = useSupabaseSession()
  const hasVotes = Boolean(votingNumbers && votingNumbers.length > 0)

  return (
    <Link
      href={`/proceedings/${proceedingNumber}/${date}/${pointId}`}
      className="block hover:opacity-90 transition-opacity"
    >
      <div className="flex flex-col gap-2 sm:gap-3 p-2 sm:p-4">
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
            <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-2">
              {title}
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base line-clamp-3 md:line-clamp-none">
              {truncateText(description, 200)}
            </p>
          </div>
          
          {/* Image */}
          <div className="relative rounded-lg overflow-hidden bg-muted w-full md:w-[200px] lg:w-[300px] order-1 md:order-2">
            <div className="aspect-video">
              <Image
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/proceedings/${proceedingNumber}/${pointId % 3 + 1}/image${pointId % 9 + 1}.jpg`}
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
          <Button variant="ghost" size="sm" className="rounded-full sm:ml-auto">
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline ml-2">Udostępnij</span>
          </Button>
        </div>
      </div>
    </Link>
  )
}
