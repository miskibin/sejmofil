'use client'
import { StatementReactions } from '@/components/statement-reactions'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { TooltipProvider } from '@radix-ui/react-tooltip'
import { AlertTriangle, Brain, ExternalLink, Heart, Scale, Sparkles } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

// Add club to FilterMode type
type FilterMode = 'featured' | 'all' | 'normal' | string // string for club names

interface Statement {
  id: number
  speaker_name: string
  number_source: number
  number_sequence: number
  statement_ai: {
    summary_tldr: string
    citations?: string[]
    speaker_rating: Record<string, number>
  }
}

interface SpeakerInfo {
  name: string
  club: string
  id: number
}

interface DiscussionEntriesProps {
  statements: Statement[]
  speakerClubs: SpeakerInfo[]
  proceedingNumber: number
  proceedingDate: string
  initialMode?: FilterMode
}

// Add this mapping near the top of the file, before the component
const metricIcons: Record<string, { icon: React.ReactNode; tooltip: string }> =
  {
    emotions: {
      icon: <Heart className="h-4 w-4 text-primary" />,
      tooltip: 'Emocjonalność',
    },
    manipulation: {
      icon: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
      tooltip: 'Manipulacja',
    },
    logic: {
      icon: <Brain className="h-4 w-4 text-blue-500" />,
      tooltip: 'Logika',
    },
    facts: {
      icon: <Scale className="h-4 w-4 text-success" />,
      tooltip: 'Fakty',
    },
  }

export function DiscussionEntries({
  statements,
  speakerClubs,
  proceedingNumber,
  proceedingDate,
  initialMode = 'featured',
}: DiscussionEntriesProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [filterMode, setFilterMode] = useState<FilterMode>(initialMode)
  const [showAll, setShowAll] = useState(false)
  const getSpeakerInfo = (name: string) => {
    return speakerClubs.find((s) => s.name === name)
  }

  const handleModeChange = (mode: FilterMode) => {
    setFilterMode(mode)
    const params = new URLSearchParams(searchParams.toString())
    if (mode === 'all') {
      params.set('showAll', 'true')
    } else {
      params.delete('showAll')
    }
    router.push(`?${params.toString()}`, { scroll: false })
  }

  // Get unique clubs from speakerClubs
  const uniqueClubs = Array.from(
    new Set(speakerClubs.map((s) => s.club))
  ).filter(Boolean)

  const filteredStatements = statements.filter((statement) => {
    if (filterMode === 'normal') return true
    if (filterMode === 'all') return true
    if (filterMode === 'featured') {
      // Featured mode - show statements with high emotion or manipulation scores
      const emotions = statement.statement_ai?.speaker_rating?.emotions ?? 0
      const manipulation =
        statement.statement_ai?.speaker_rating?.manipulation ?? 0
      return emotions >= 4 || manipulation >= 4
    }
    // Club filtering
    const speaker = getSpeakerInfo(statement.speaker_name)
    return speaker?.club === filterMode
  })

  // Sort statements based on mode
  const sortedStatements = [...filteredStatements].sort((a, b) => {
    if (filterMode === 'featured') {
      const getMaxScore = (s: (typeof statements)[0]) => {
        const emotions = s.statement_ai?.speaker_rating?.emotions ?? 0
        const manipulation = s.statement_ai?.speaker_rating?.manipulation ?? 0
        return Math.max(emotions, manipulation)
      }
      return getMaxScore(b) - getMaxScore(a)
    }
    return a.number_sequence - b.number_sequence
  })

  const displayedStatements = showAll
    ? sortedStatements
    : sortedStatements.slice(0, 2)

  return (
    <div className="mb-4 space-y-4">
      <div className="flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {filterMode === 'featured' ? (
            <div className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="font-medium text-primary">Wyróżnione</span>
              <span className="text-muted-foreground">
                ({filteredStatements.length} z {statements.length})
              </span>
            </div>
          ) : (
            uniqueClubs.includes(filterMode) && (
              <div className="flex gap-2">
                <span className="font-medium">{filterMode}</span>
                <span className="text-muted-foreground">
                  ({filteredStatements.length})
                </span>
              </div>
            )
          )}
        </div>

        <Select
          value={filterMode}
          onValueChange={(value: FilterMode) => handleModeChange(value)}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="featured">Najciekawsze</SelectItem>
            <SelectItem value="normal">Chronologicznie</SelectItem>
            <SelectItem value="all">Wszystkie</SelectItem>
            {uniqueClubs.map((club) => (
              <SelectItem key={club} value={club}>
                Tylko {club}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mb-4 space-y-6">
        {displayedStatements.map((statement) => {
          const speaker = getSpeakerInfo(statement.speaker_name)
          const isHighlighted =
            (statement.statement_ai?.speaker_rating?.emotions ?? 0) >= 4 ||
            (statement.statement_ai?.speaker_rating?.manipulation ?? 0) >= 4

          return (
            <div
              key={statement.id}
              className={cn(
                'rounded-lg border p-4 transition-all hover:shadow-md',
                isHighlighted && filterMode === 'featured'
                  ? 'border-primary/30 bg-primary/5'
                  : 'bg-card'
              )}
            >
              {/* Header */}
              <div className="mb-3 flex items-center gap-3">
                <Link
                  href={speaker?.id ? `/envoys/${speaker.id}` : '#'}
                  className="flex-shrink-0"
                >
                  <Image
                    src={
                      speaker?.id
                        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/MP/${speaker.id}/photo`
                        : '/placeholder.svg'
                    }
                    alt={statement.speaker_name}
                    width={48}
                    height={48}
                    className="rounded-full ring-2 ring-border"
                    loading="lazy"
                  />
                </Link>

                <div className="flex flex-1 flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={speaker?.id ? `/envoys/${speaker.id}` : '#'}
                      className="text-sm font-semibold hover:underline"
                    >
                      {statement.speaker_name}
                    </Link>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      {speaker?.club || 'Brak klubu'}
                    </span>
                  </div>
                  <TooltipProvider>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(statement.statement_ai.speaker_rating)
                        .filter(([, value]) => value >= 4)
                        .map(([key, value]) => (
                          <Tooltip key={key}>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5">
                                {metricIcons[key]?.icon}
                                <span className="text-xs font-medium">
                                  {value}/5
                                </span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              {metricIcons[key]?.tooltip}
                            </TooltipContent>
                          </Tooltip>
                        ))}
                    </div>
                  </TooltipProvider>
                </div>
              </div>

              {/* Content section */}
              <div className="space-y-3">
                {statement.statement_ai?.summary_tldr && (
                  <p className="text-sm leading-relaxed text-foreground">
                    {statement.statement_ai.summary_tldr}
                  </p>
                )}

                {/* Citations */}
                {Array.isArray(statement.statement_ai?.citations) &&
                  statement.statement_ai.citations.length > 0 && (
                    <div className="space-y-2">
                      {statement.statement_ai.citations.map(
                        (citation, index) => (
                          <blockquote
                            key={index}
                            className="border-l-2 border-primary pl-4 text-sm italic text-muted-foreground"
                          >
                            {citation}
                          </blockquote>
                        )
                      )}
                    </div>
                  )}

                {/* Footer with reactions */}
                <div className="flex items-center justify-between border-t pt-3">
                  <StatementReactions statementId={statement.id} />

                  <Link
                    href={`${process.env.NEXT_PUBLIC_API_BASE_URL}/proceedings/${proceedingNumber}/${proceedingDate}/transcripts/${statement.number_source}`}
                    target="_blank"
                    className="flex items-center gap-1 text-xs text-primary transition-colors hover:text-primary/80 hover:underline"
                  >
                    Pełna transkrypcja <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Add load all button */}
      {!showAll && sortedStatements.length > 2 && (
        <div className="flex justify-center pt-4">
          <Button
            variant="ghost"
            onClick={() => setShowAll(true)}
            className="w-full max-w-sm"
          >
            Załaduj wszystkie ({sortedStatements.length - 2} pozostało)
          </Button>
        </div>
      )}
    </div>
  )
}
