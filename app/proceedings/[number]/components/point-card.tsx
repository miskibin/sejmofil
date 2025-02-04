'use client'

import { ImageWithFallback } from '@/components/ui/image-with-fallback'
import { MessageSquare, Vote } from 'lucide-react'
import Link from 'next/link'

interface PointCardProps {
  point: {
    id: number
    topic: string
    summary_tldr?: string
    voting_numbers?: number[]
    statements: Array<unknown>
  }
  proceedingNumber: number
  date: string
  dayNumber: number
  pointIndex: number
  size?: 'small' | 'medium' | 'large'
}

export const PointCard = ({
  point,
  proceedingNumber,
  date,
  dayNumber,
  pointIndex,
  size = 'medium',
}: PointCardProps) => {
  const imageIndex = pointIndex % 9
  const imageUrl = `https://db.msulawiak.pl/storage/v1/object/public/${proceedingNumber}_${dayNumber}/image${imageIndex}.jpg`
  const hasVotes = point.voting_numbers && point.voting_numbers.length > 0

  return (
    <Link
      href={`/proceedings/${proceedingNumber}/${date}/${point.id}`}
      className="group relative block w-full"
    >
      <div
        className={`relative overflow-hidden rounded-xl shadow-lg transition-all duration-300 group-hover:shadow-xl ${
          size === 'large'
            ? 'h-[590px]'
            : size === 'medium'
              ? 'h-[280px]'
              : 'h-[200px]'
        } `}
      >
        <ImageWithFallback
          src={imageUrl}
          alt={point.topic}
          fallbackSrc="/default.jpg"
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="blur-[2px] transition-all duration-500 group-hover:scale-110 group-hover:blur-0"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent transition-all duration-300" />

        <div className="absolute inset-0 flex flex-col justify-end p-5">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs text-white backdrop-blur-md transition-colors group-hover:bg-primary/30">
                <MessageSquare className="h-3.5 w-3.5" />
                {point.statements.length}
              </span>
              {hasVotes && (
                <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs text-white backdrop-blur-md transition-colors group-hover:bg-primary/30">
                  <Vote className="h-3.5 w-3.5" />
                  {point.voting_numbers?.length}
                </span>
              )}
            </div>

            <h3
              className={`font-semibold leading-tight tracking-tight text-white transition-colors group-hover:text-primary-foreground ${
                size === 'large'
                  ? 'text-2xl'
                  : size === 'medium'
                    ? 'text-lg'
                    : 'text-base'
              } `}
            >
              {point.topic.split(' | ')[1] || point.topic}
            </h3>

            {point.summary_tldr && (
              <div className="space-y-2">
                <p
                  className={`line-clamp-2 text-white/80 transition-colors group-hover:text-white/90 ${size === 'large' ? 'text-base' : 'text-sm'} `}
                >
                  {point.summary_tldr}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
