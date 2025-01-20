import { MessageSquare, Vote } from 'lucide-react'
import { SearchResultCard } from './search-result-card'

interface PointCardProps {
  point: {
    id: number
    topic: string
    summary_tldr?: string
    voting_numbers?: number[]
  }
  proceedingNumber: number
  date: string
  searchQuery?: string
}

export function PointCard({
  point,
  proceedingNumber,
  date,
  searchQuery,
}: PointCardProps) {
  const hasVotes = point.voting_numbers && point.voting_numbers.length > 0

  const metadataText = `Posiedzenie ${proceedingNumber}${
    hasVotes ? ` • ${point.voting_numbers?.length} głosowań` : ''
  }`

  return (
    <SearchResultCard
      href={`/proceedings/${proceedingNumber}/${date}/${point.id}`}
      title={point.topic.split(' | ')[1] || point.topic}
      content={point.summary_tldr}
      date={date}
      metadata={{
        icon: hasVotes ? (
          <Vote className="h-4 w-4" />
        ) : (
          <MessageSquare className="h-4 w-4" />
        ),
        text: metadataText,
      }}
      searchQuery={searchQuery}
    />
  )
}
