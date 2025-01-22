import { Badge } from '@/components/ui/badge'
import { CardWrapper } from '@/components/ui/card-wrapper'
import { EnvoyShort } from '@/lib/types/person'
import { truncateText } from '@/lib/utils'
import {
  Award,
  Ban,
  Medal,
  ThumbsDown,
  ThumbsUp,
  UserX,
  VolumeX,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface EnvoyCardProps {
  envoy: EnvoyShort & { metrics?: Set<string> }
  rankingPosition?: number
  rankingValue?: number | null
  rankingType?: 'votes' | 'absents' | 'statements' | 'interruptions' | null
}

export function EnvoyCard({
  envoy,
  rankingPosition,
  rankingValue,
  rankingType,
}: EnvoyCardProps) {
  const fullName = `${envoy.firstName} ${envoy.lastName}`
  const truncatedName = truncateText(fullName, 25)

  const getRankingStyle = (position: number) => {
    if (!rankingType) return null
    switch (position) {
      case 1:
        return 'bg-yellow-500/10 shadow-yellow-500/20 shadow-inner'
      case 2:
        return 'bg-gray-500/10 shadow-gray-500/20 shadow-inner'
      case 3:
        return 'bg-amber-700/10 shadow-amber-700/20 shadow-inner'
      default:
        return ''
    }
  }

  const getMedalColor = (position: number) => {
    if (!rankingType) return null
    switch (position) {
      case 1:
        return 'text-yellow-500'
      case 2:
        return 'text-gray-400'
      case 3:
        return 'text-amber-700'
      default:
        return null
    }
  }

  const getMetricIcons = (metrics?: Set<string>) => {
    if (!metrics) return null

    const icons = {
      topVotes: {
        icon: <Award className="h-5 w-5 text-success" />,
        title: 'Popularność wśród wyborców',
      },
      lowVotes: {
        icon: <UserX className="h-5 w-5 text-primary" />,
        title: 'Nieznany/a wśród wyborców',
      },
      topAbsents: {
        icon: <ThumbsDown className="h-5 w-5 text-primary" />,
        title: 'Niska frekwencja głosowań',
      },
      lowAbsents: {
        icon: <ThumbsUp className="h-5 w-5 text-success" />,
        title: 'Wysoka frekwencja głosowań',
      },
      topInterruptions: {
        icon: <VolumeX className="h-5 w-5 text-yellow-500" />,
        title: 'Częste okrzyki',
      },
    }

    return (
      <div className="mt-1 flex gap-3">
        {Array.from(metrics).map((metric) => (
          <div key={metric} title={icons[metric as keyof typeof icons]?.title}>
            {icons[metric as keyof typeof icons]?.icon}
          </div>
        ))}
      </div>
    )
  }

  const medalColor = rankingPosition ? getMedalColor(rankingPosition) : null
  const rankingStyle = rankingPosition ? getRankingStyle(rankingPosition) : ''

  const rankingLabel = rankingType
    ? {
        votes: 'Głosy',
        absents: 'Nieobecności',
        statements: 'Wypowiedzi',
        interruptions: 'Okrzyki',
      }[rankingType]
    : null

  return (
    <Link href={`/envoys/${envoy.id}`}>
      <CardWrapper
        title={envoy.club || ''}
        subtitle={truncatedName}
        showSource={false}
        showGradient={false}
        headerElements={getMetricIcons(envoy.metrics)}
        headerIcon={!envoy.active && <Ban className="text-white" />}
        className={`transition-all duration-200 hover:shadow-lg ${rankingStyle}`}
      >
        <div className="flex flex-col">
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-16 flex-shrink-0">
              <Image
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/MP/${envoy.id}.jpeg`}
                alt={fullName}
                width={64}
                height={80}
                className="rounded-lg"
                loading="lazy"
              />
              {medalColor && (
                <div className="absolute -right-1 -top-1 rounded-full bg-background p-0.5 shadow-sm">
                  <Medal className={`h-5 w-5 ${medalColor}`} />{' '}
                  {/* Smaller medal */}
                </div>
              )}
            </div>
            <div className="min-w-0 space-y-0.5">
              {' '}
              {/* Reduced vertical spacing */}
              {envoy.role &&
                envoy.role !== 'Poseł' &&
                envoy.role !== 'envoy' && (
                  <p className="text-xs font-medium text-muted-foreground">
                    {' '}
                    {/* Smaller text */}
                    {truncateText(envoy.role, 66)}
                  </p>
                )}
              <div>
                {rankingType && (
                  <Badge
                    variant={
                      rankingPosition && rankingPosition <= 3
                        ? 'default'
                        : 'secondary'
                    }
                    className="mr-1 text-xs" // Smaller margin and text
                  >
                    #{rankingPosition}
                  </Badge>
                )}
              </div>
              {rankingType && rankingLabel && (
                <p className="text-xs text-muted-foreground">
                  {' '}
                  {/* Smaller text */}
                  {rankingLabel}: {rankingValue}
                </p>
              )}
              {!rankingType && envoy.profession && (
                <p className="text-xs text-muted-foreground">
                  {' '}
                  {/* Smaller text */}
                  {truncateText(envoy.profession, 40)}
                </p>
              )}
            </div>
          </div>
        </div>
      </CardWrapper>
    </Link>
  )
}
