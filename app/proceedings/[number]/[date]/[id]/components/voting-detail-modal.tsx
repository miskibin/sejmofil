'use client'

import { Badge } from '@/components/ui/badge'
import {
  Credenza,
  CredenzaBody,
  CredenzaContent,
  CredenzaHeader,
  CredenzaTitle,
} from '@/components/ui/credenza'
import { VotingResult } from '@/lib/api/sejm'
import { VotingResultsChart } from '../components/voting-results-chart'

interface Props {
  voting: VotingResult
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function VotingDetailModal({ voting, open, onOpenChange }: Props) {
  const processVotingData = () => {
    const clubVotes = voting.votes.reduce(
      (acc, vote) => {
        if (!acc[vote.club]) {
          acc[vote.club] = { club: vote.club, yes: 0, no: 0, abstain: 0 }
        }
        if (vote.vote === 'YES') acc[vote.club].yes++
        if (vote.vote === 'NO') acc[vote.club].no++
        if (vote.vote === 'ABSTAIN') acc[vote.club].abstain++
        return acc
      },
      {} as Record<
        string,
        { club: string; yes: number; no: number; abstain: number }
      >
    )

    return Object.values(clubVotes)
  }

  return (
    <Credenza open={open} onOpenChange={onOpenChange}>
      <CredenzaContent className="max-w-[98vw] rounded-lg p-4 sm:max-w-2xl sm:p-6">
        <CredenzaHeader className="space-y-4 text-wrap">
          <CredenzaTitle className="sm:text-xltext-start text-lg leading-tight">
            {voting.topic}
          </CredenzaTitle>
          {voting.title && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {voting.title}
            </p>
          )}
          <div className="flex max-w-[98vw] flex-wrap gap-2">
            <Badge variant="outline" className="text-xs sm:text-sm">
              Głosowało: {voting.totalVoted}
            </Badge>
            <Badge variant="outline" className="text-xs sm:text-sm">
              Nie głosowało: {voting.notParticipating}
            </Badge>
            <Badge
              variant={voting.yes > voting.no ? 'default' : 'destructive'}
              className="text-xs sm:text-sm"
            >
              {voting.yes > voting.no ? 'Przyjęto' : 'Odrzucono'}
            </Badge>
          </div>
        </CredenzaHeader>
        <CredenzaBody>
          <div className="mt-4 min-h-[300px] sm:min-h-[400px]">
            <VotingResultsChart data={processVotingData()} />
          </div>
        </CredenzaBody>
      </CredenzaContent>
    </Credenza>
  )
}
