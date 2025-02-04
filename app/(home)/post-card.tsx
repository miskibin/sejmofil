import Image from 'next/image'
import { MessageSquare, ArrowUp, Share2, Vote } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { truncateText } from '@/lib/utils'

interface PostCardProps {
  category: string
  title: string
  description: string
  likes: string
  comments: string
  interested: string
  imageUrl: string
  pointId: number
  proceedingNumber: string
  date: string
  votingNumbers?: number[]
}

export default function PostCard({
  category,
  title,
  description,
  likes,
  comments,
  interested,
  imageUrl,
  pointId,
  proceedingNumber,
  date,
  votingNumbers,
}: PostCardProps) {
  const hasVotes = votingNumbers && votingNumbers.length > 0

  return (
    <Link
      href={`/proceedings/${proceedingNumber}/${date}/${pointId}`}
      className="block hover:opacity-90 transition-opacity"
    >
      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-start gap-6">
          <div className="flex-1">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
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
              <h2 className="text-3xl font-semibold">{title}</h2>
              <p className=" text-muted-foreground">
                {truncateText(description, 200)}
              </p>
            </div>
          </div>
          <div className="relative rounded-lg overflow-hidden bg-muted">
            <Image
              src={imageUrl || '/images/placeholder.jpg'} // Add fallback image
              alt={title}
              className="object-cover"
              width={300}
              height={(300 * 16) / 9}
              priority={false}
              loading="lazy"
            />
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full bg-primary/10"
          >
            <ArrowUp className="w-4 h-4 mr-2" />
            {likes}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full bg-muted/10"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            {comments}
          </Button>
          <span className="ml-4">{interested} zainteresowanych</span>
          <Button variant="ghost" size="sm" className="rounded-full ml-auto">
            <Share2 className="w-4 h-4" />
            Udostępnij
          </Button>
        </div>
      </div>
    </Link>
  )
}
