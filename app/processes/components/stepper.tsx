'use client'

import { ProcessDetailData } from '@/lib/queries/process'
import { PrintShort } from '@/lib/types/print'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'
import { motion } from 'framer-motion'
import * as Icons from 'lucide-react'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'

const stageConfig = {
  icons: {
    czytanie: 'BookOpen',
    komisj: 'Users2',
    głosowanie: 'Vote',
    senat: 'Building2',
    prezydent: 'Crown',
    zamknięcie: 'CheckCircle2',
    '0': 'Send',
    publikacja: 'FileText',
    default: 'CircleDot',
  },
  colors: {
    czytanie: 'from-blue-500 to-blue-600',
    komisj: 'from-emerald-500 to-emerald-600',
    głosowanie: 'from-violet-500 to-violet-600',
    senat: 'from-amber-500 to-amber-600',
    prezydent: 'from-yellow-500 to-yellow-600',
    zamknięcie: 'bg-success',
    publikacja: 'from-green-500 to-green-600',
    default: 'from-gray-500 to-gray-600',
  },
}

const StageIcon = ({
  stageName,
  stageNumber,
}: {
  stageName: string
  stageNumber: string
}) => {
  const getIconName = () => {
    const match = Object.entries(stageConfig.icons).find(
      ([key]) => key === stageNumber || stageName.toLowerCase().includes(key)
    )
    return match ? match[1] : stageConfig.icons.default
  }

  const IconComponent = Icons[
    getIconName() as keyof typeof Icons
  ] as React.ComponentType<{ className?: string }>
  return <IconComponent className="h-5 w-5 text-white sm:h-6 sm:w-6" />
}

const PrintDetails = ({ prints }: { prints: PrintShort[] }) => (
  <div className="space-y-2">
    <h4 className="flex items-center gap-2 font-medium">
      <Icons.FileText className="h-4 w-4" />
      Dokumenty:
    </h4>
    {prints.map((print, idx) => (
      <motion.div
        key={idx}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="ml-4 space-y-1 text-sm"
      >
        <div className="flex items-center gap-2 font-medium">
          {print.number} - {print.title}
        </div>
        {print.documentDate && (
          <div className="text-muted-foreground">
            {format(new Date(print.documentDate), 'd MMM yyyy', { locale: pl })}
          </div>
        )}
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown>{print.summary}</ReactMarkdown>
        </div>
        {print.attachments.length > 0 && (
          <div className="space-y-1">
            {print.attachments.map((attachment) => (
              <a
                key={attachment}
                href={`${process.env.NEXT_PUBLIC_API_BASE_URL}/prints/${print.number}/${attachment}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-primary hover:underline"
              >
                <Icons.Paperclip className="h-4 w-4" />
                {attachment}
              </a>
            ))}
          </div>
        )}
      </motion.div>
    ))}
  </div>
)

const StageDetails = ({ stage }: { stage: ProcessDetailData['stages'][0] }) => (
  <motion.div
    initial={{ opacity: 0, height: 0 }}
    animate={{ opacity: 1, height: 'auto' }}
    exit={{ opacity: 0, height: 0 }}
    className="mt-4 space-y-4 text-sm"
  >
    {stage.childStages.length > 0 && (
      <div className="space-y-2">
        <h4 className="font-medium">Etapy podrzędne:</h4>
        {stage.childStages.map((childStage) => (
          <div key={childStage.number} className="ml-4 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary/30" />
            <span>{childStage.name}</span>
            {childStage.date && (
              <span className="text-muted-foreground">
                (
                {format(new Date(childStage.date), 'd MMM yyyy', {
                  locale: pl,
                })}
                )
              </span>
            )}
          </div>
        ))}
      </div>
    )}

    {stage.childCommittees.length > 0 && (
      <div className="space-y-2">
        <h4 className="flex items-center gap-2 font-medium">
          <Icons.Users2 className="h-4 w-4" />
          Komisje:
        </h4>
        {stage.childCommittees.map((committee) => (
          <div key={committee.name} className="ml-4">
            {committee.name} {committee.code && `(${committee.code})`}
          </div>
        ))}
      </div>
    )}

    {stage.votings.length > 0 && (
      <div className="space-y-2">
        <h4 className="flex items-center gap-2 font-medium">
          <Icons.Vote className="h-4 w-4" />
          Wyniki głosowania:
        </h4>
        {stage.votings.map((voting, idx) => (
          <div key={idx} className="ml-4 grid grid-cols-2 gap-2">
            <div>
              Za: <span className="text-green-600">{voting.yes}</span>
            </div>
            <div>
              Przeciw: <span className="text-red-600">{voting.no}</span>
            </div>
            <div className="col-span-2 text-muted-foreground">
              Posiedzenie {voting.sitting}, głosowanie nr {voting.votingNumber}
            </div>
          </div>
        ))}
      </div>
    )}

    {[...stage.prints, ...stage.childPrints].length > 0 && (
      <PrintDetails prints={[...stage.prints, ...stage.childPrints]} />
    )}
  </motion.div>
)

export default function LegislativeTimeline({
  data,
}: {
  data: ProcessDetailData
}) {
  const [expandedStages, setExpandedStages] = useState<string[]>([])
  const sortedStages = [...data.stages].sort(
    (a, b) => Number(a.number) - Number(b.number)
  )

  return (
    <div className="relative mx-auto max-w-4xl px-4 sm:px-6">
      {sortedStages.map((stage, index) => {
        const isExpanded = expandedStages.includes(stage.number)
        const hasDetails =
          stage.childStages.length > 0 ||
          stage.childCommittees.length > 0 ||
          stage.votings.length > 0 ||
          stage.prints.length > 0 ||
          stage.childPrints.length > 0
        const stageColor =
          Object.entries(stageConfig.colors).find(
            ([key]) =>
              key === stage.number || stage.name.toLowerCase().includes(key)
          )?.[1] || stageConfig.colors.default
        const firstPrint = [...stage.prints, ...stage.childPrints][0]

        return (
          <div
            key={stage.number}
            className="group relative flex gap-3 pb-8 sm:gap-4"
          >
            {index !== sortedStages.length - 1 && (
              <div
                className={`absolute left-5 top-12 h-[calc(100%-24px)] w-[2px] bg-gradient-to-b sm:left-6 ${stageColor} opacity-20`}
              />
            )}

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`relative z-10 h-10 w-10 rounded-full bg-gradient-to-br sm:h-12 sm:w-12 ${stageColor} flex items-center justify-center shadow-lg shadow-primary/20 transition-shadow group-hover:shadow-primary/30`}
            >
              <StageIcon stageName={stage.name} stageNumber={stage.number} />
            </motion.div>

            <div className="flex-1">
              <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-base font-semibold">
                    {stage.name}
                    {stage.act && (
                      <a
                        href={`https://api.sejm.gov.pl/eli/acts/${stage.act}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        (Ustawa {stage.act})
                      </a>
                    )}
                    {firstPrint && firstPrint.attachments.length > 0 && (
                      <a
                        href={`${process.env.NEXT_PUBLIC_API_BASE_URL}/prints/${firstPrint.number}/${firstPrint.attachments[0]}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        ({firstPrint.number})
                      </a>
                    )}
                    {stage.votings.length > 0 && (
                      <Icons.Vote className="h-4 w-4 text-primary" />
                    )}
                    {hasDetails && (
                      <button
                        onClick={() =>
                          setExpandedStages((prev) =>
                            prev.includes(stage.number)
                              ? prev.filter((n) => n !== stage.number)
                              : [...prev, stage.number]
                          )
                        }
                        className="text-muted-foreground transition-colors hover:text-primary"
                      >
                        <Icons.ChevronDown
                          className={`h-5 w-5 transition-transform ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                    )}
                  </div>
                  {stage.comment && (
                    <div className="mt-1 text-sm text-muted-foreground">
                      {stage.comment}
                    </div>
                  )}
                </div>
                {stage.date && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Icons.Calendar className="h-4 w-4" />
                    {format(new Date(stage.date), 'd MMM yyyy', { locale: pl })}
                  </div>
                )}
              </div>

              {isExpanded && <StageDetails stage={stage} />}
            </div>
          </div>
        )
      })}
      {data.comments && <div className="mt-8 text-sm">{data.comments}</div>}
    </div>
  )
}
