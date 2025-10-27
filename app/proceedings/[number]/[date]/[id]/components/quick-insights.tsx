'use client'

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { AlertTriangle, Heart } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface Statement {
  id: number
  speaker_name: string
  statement_ai: {
    summary_tldr: string
    speaker_rating: Record<string, number>
  }
}

interface SpeakerInfo {
  name: string
  club: string
  id: number
}

interface QuickInsightsProps {
  statements: Statement[]
  speakerClubs: SpeakerInfo[]
}

export function QuickInsights({
  statements,
  speakerClubs,
}: QuickInsightsProps) {
  // Find most emotional statement
  const mostEmotional = statements.reduce((max, current) => {
    const currentScore = current.statement_ai?.speaker_rating?.emotions || 0
    const maxScore = max.statement_ai?.speaker_rating?.emotions || 0
    return currentScore > maxScore ? current : max
  }, statements[0])

  // Find most manipulative statement
  const mostControversial = statements.reduce((max, current) => {
    const currentScore = current.statement_ai?.speaker_rating?.manipulation || 0
    const maxScore = max.statement_ai?.speaker_rating?.manipulation || 0
    return currentScore > maxScore ? current : max
  }, statements[0])

  const getSpeakerInfo = (name: string) => {
    return speakerClubs.find((s) => s.name === name)
  }

  const emotionalSpeaker = getSpeakerInfo(mostEmotional?.speaker_name)
  const controversialSpeaker = getSpeakerInfo(mostControversial?.speaker_name)

  // Check if scores are high enough to show cards
  const emotionalScore =
    mostEmotional?.statement_ai?.speaker_rating?.emotions || 0
  const controversialScore =
    mostControversial?.statement_ai?.speaker_rating?.manipulation || 0

  // Only render if we have at least one card to show
  if (emotionalScore < 3 && controversialScore < 3) {
    return null
  }

  return (
    <>
      {/* Most Emotional Statement - only show if score >= 3 */}
      {emotionalScore >= 3 && (
        <Card className="flex flex-col p-4">
          <div className="mb-3 flex items-center gap-2">
            <div className="rounded-full bg-primary/10 p-2">
              <Heart className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-sm font-semibold">Najbardziej emocjonalne</h3>
          </div>
          <div className="flex flex-1 flex-col gap-2">
            <div className="flex items-center gap-2">
              <Link
                href={
                  emotionalSpeaker?.id ? `/envoys/${emotionalSpeaker.id}` : '#'
                }
                className="flex items-center gap-2"
              >
                <Image
                  src={
                    emotionalSpeaker?.id
                      ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/MP/${emotionalSpeaker.id}/photo`
                      : '/placeholder.svg'
                  }
                  alt={mostEmotional?.speaker_name || ''}
                  width={32}
                  height={32}
                  className="rounded-full"
                  loading="lazy"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium hover:underline">
                    {mostEmotional?.speaker_name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {emotionalSpeaker?.club}
                  </span>
                </div>
              </Link>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {mostEmotional?.statement_ai?.summary_tldr}
            </p>
            <div className="mt-auto flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={
                    star <=
                    (mostEmotional?.statement_ai?.speaker_rating?.emotions || 0)
                      ? 'text-primary text-lg'
                      : 'text-muted-foreground/30 text-lg'
                  }
                >
                  ★
                </span>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Most Controversial - only show if score >= 3 */}
      {controversialScore >= 3 && (
        <Card className="flex flex-col p-4">
          <div className="mb-3 flex items-center gap-2">
            <div className="rounded-full bg-yellow-500/10 p-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            </div>
            <h3 className="text-sm font-semibold">
              Najbardziej kontrowersyjne
            </h3>
          </div>
          <div className="flex flex-1 flex-col gap-2">
            <div className="flex items-center gap-2">
              <Link
                href={
                  controversialSpeaker?.id
                    ? `/envoys/${controversialSpeaker.id}`
                    : '#'
                }
                className="flex items-center gap-2"
              >
                <Image
                  src={
                    controversialSpeaker?.id
                      ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/MP/${controversialSpeaker.id}/photo`
                      : '/placeholder.svg'
                  }
                  alt={mostControversial?.speaker_name || ''}
                  width={32}
                  height={32}
                  className="rounded-full"
                  loading="lazy"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium hover:underline">
                    {mostControversial?.speaker_name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {controversialSpeaker?.club}
                  </span>
                </div>
              </Link>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {mostControversial?.statement_ai?.summary_tldr}
            </p>
            <div className="mt-auto flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={
                    star <=
                    (mostControversial?.statement_ai?.speaker_rating
                      ?.manipulation || 0)
                      ? 'text-yellow-600 text-lg'
                      : 'text-muted-foreground/30 text-lg'
                  }
                >
                  ★
                </span>
              ))}
            </div>
          </div>
        </Card>
      )}
    </>
  )
}
