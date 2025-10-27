'use client'

import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/empty-state'
import { VotingResult as SimpleVoting } from '@/lib/queries/proceeding'
import {
  VotingResult as DetailedVoting,
  getVotingDetails,
} from '@/lib/api/sejm'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp, ThumbsDown, ThumbsUp } from 'lucide-react'
import { VotingDetailModal } from './voting-detail-modal'
import { ChartContainer } from '@/components/ui/chart'
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface Props {
  votings: SimpleVoting[]
}

export function VotingCardEnhanced({ votings }: Props) {
  const [primaryVoting, setPrimaryVoting] = useState<SimpleVoting | null>(null)
  const [detailedVoting, setDetailedVoting] = useState<DetailedVoting | null>(
    null
  )
  const [modalVoting, setModalVoting] = useState<DetailedVoting | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showAllVotings, setShowAllVotings] = useState(false)

  useEffect(() => {
    // Find the most important voting (całością projektu)
    const important = votings.find((v) =>
      v.topic.toLowerCase().includes('całością projektu')
    )
    setPrimaryVoting(important || votings[0])
  }, [votings])

  useEffect(() => {
    // Load detailed voting data for the primary voting
    if (primaryVoting) {
      getVotingDetails(primaryVoting.sitting, primaryVoting.votingNumber).then(
        setDetailedVoting
      )
    }
  }, [primaryVoting])

  const handleOtherVotingClick = async (voting: SimpleVoting) => {
    const details = await getVotingDetails(voting.sitting, voting.votingNumber)
    setModalVoting(details)
    setShowModal(true)
  }

  if (votings.length === 0) {
    return (
      <Card className="p-5">
        <h2 className="mb-4 text-xl font-semibold">Głosowania</h2>
        <EmptyState image="/empty.svg" text="Brak głosowań" />
      </Card>
    )
  }

  const otherVotings = votings.filter((v) => v !== primaryVoting)

  // Calculate percentages from detailed voting
  const totalVotes = detailedVoting?.totalVoted || 0
  const yesPercent =
    totalVotes > 0 ? ((detailedVoting?.yes || 0) / totalVotes) * 100 : 0
  const noPercent =
    totalVotes > 0 ? ((detailedVoting?.no || 0) / totalVotes) * 100 : 0
  const abstainPercent =
    totalVotes > 0 ? ((detailedVoting?.abstain || 0) / totalVotes) * 100 : 0

  // Get club votes from detailed voting
  const clubVotes = detailedVoting?.votes?.reduce(
    (acc, vote) => {
      if (!vote.club) return acc
      if (!acc[vote.club]) {
        acc[vote.club] = { yes: 0, no: 0, abstain: 0, absent: 0 }
      }
      if (vote.vote === 'YES') acc[vote.club].yes++
      else if (vote.vote === 'NO') acc[vote.club].no++
      else if (vote.vote === 'ABSTAIN') acc[vote.club].abstain++
      else acc[vote.club].absent++
      return acc
    },
    {} as Record<
      string,
      { yes: number; no: number; abstain: number; absent: number }
    >
  )

  // Transform club votes to chart data format (using percentages for stacked bars)
  const chartData = clubVotes
    ? Object.entries(clubVotes)
        .map(([club, votes]) => {
          const total = votes.yes + votes.no + votes.abstain
          return {
            club,
            yes: votes.yes,
            no: votes.no,
            abstain: votes.abstain,
            total,
            yesPercent: total > 0 ? (votes.yes / total) * 100 : 0,
            noPercent: total > 0 ? (votes.no / total) * 100 : 0,
            abstainPercent: total > 0 ? (votes.abstain / total) * 100 : 0,
          }
        })
        .sort((a, b) => b.total - a.total)
    : []

  return (
    <>
      <Card className="p-5">
        <h2 className="mb-4 text-xl font-semibold">
          {detailedVoting?.topic || primaryVoting?.topic || 'Brak tematu'}
        </h2>

        {primaryVoting && (
          <div className="space-y-4">
            <div>
              {detailedVoting?.title && (
                <p className="text-sm text-muted-foreground mb-2 leading-relaxed">
                  {detailedVoting.title}
                </p>
              )}

              {/* Overall Results */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-success">
                  <ThumbsUp className="h-4 w-4" />
                  <span className="font-semibold">
                    {detailedVoting?.yes || primaryVoting.yes}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-destructive">
                  <ThumbsDown className="h-4 w-4" />
                  <span className="font-semibold">
                    {detailedVoting?.no || primaryVoting.no}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <span className="text-xs">Wstrzymało:</span>
                  <span className="font-semibold">
                    {detailedVoting?.abstain || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Club Votes Chart */}
            {chartData.length > 0 && (
              <div className="space-y-3 border-t pt-4">
                <div className="w-full overflow-hidden">
                  <ChartContainer
                    config={{
                      yes: { label: 'Za', color: 'hsl(var(--success))' },
                      no: {
                        label: 'Przeciw',
                        color: 'hsl(var(--destructive))',
                      },
                      abstain: {
                        label: 'Wstrzymało się',
                        color: 'hsl(var(--muted))',
                      },
                    }}
                    className="h-[380px] w-full min-w-0"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        layout="vertical"
                        margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                      >
                        <XAxis type="number" hide />
                        <YAxis
                          type="category"
                          dataKey="club"
                          tickLine={false}
                          axisLine={false}
                          width={60}
                          tick={{ fontSize: 11 }}
                        />
                        <Bar
                          dataKey="yes"
                          fill="hsl(var(--success))"
                          stackId="stack"
                          radius={[0, 4, 4, 0]}
                        />
                        <Bar
                          dataKey="no"
                          fill="hsl(var(--destructive))"
                          stackId="stack"
                        />
                        <Bar
                          dataKey="abstain"
                          fill="hsl(var(--muted-foreground))"
                          stackId="stack"
                        />
                        <Tooltip
                          cursor={false}
                          content={({ payload, label }) => {
                            if (payload?.[0]) {
                              const data = payload[0].payload
                              return (
                                <div className="rounded-lg border bg-background p-2.5 shadow-lg">
                                  <p className="font-medium mb-1">{label}</p>
                                  <p className="text-xs text-success">
                                    Za: {data.yes} ({data.yesPercent.toFixed(1)}
                                    %)
                                  </p>
                                  <p className="text-xs text-destructive">
                                    Przeciw: {data.no} (
                                    {data.noPercent.toFixed(1)}%)
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Wstrzymało się: {data.abstain} (
                                    {data.abstainPercent.toFixed(1)}%)
                                  </p>
                                </div>
                              )
                            }
                            return null
                          }}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </div>
            )}

            {/* Other Votings */}
            {otherVotings.length > 0 && (
              <div className="border-t pt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllVotings(!showAllVotings)}
                  className="w-full justify-between"
                >
                  <span className="text-sm">
                    Inne głosowania ({otherVotings.length})
                  </span>
                  {showAllVotings ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>

                {showAllVotings && (
                  <div className="mt-2 space-y-1">
                    {otherVotings.map((voting, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleOtherVotingClick(voting)}
                        className="flex w-full items-center justify-between rounded p-2 text-xs hover:bg-muted transition-colors cursor-pointer"
                      >
                        <span className="flex-1 truncate text-left">
                          {voting.topic}
                        </span>
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <span className="flex items-center gap-1 text-success">
                            <ThumbsUp className="h-3 w-3" />
                            {voting.yes}
                          </span>
                          <span className="flex items-center gap-1 text-destructive">
                            <ThumbsDown className="h-3 w-3" />
                            {voting.no}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Card>

      {modalVoting && (
        <VotingDetailModal
          voting={modalVoting}
          open={showModal}
          onOpenChange={setShowModal}
        />
      )}
    </>
  )
}
