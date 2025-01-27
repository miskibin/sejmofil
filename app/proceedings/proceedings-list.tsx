'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { CardWrapper } from '@/components/ui/card-wrapper'
import { Input } from '@/components/ui/input'
import { CalendarDays, Search, Timer, Vote } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useMemo, useState } from 'react'
import { PointRenderProps, Proceeding, ProceedingPoint } from './types'

export function ProceedingsList({
  proceedings,
}: {
  proceedings: Proceeding[]
}) {
  const router = useRouter()
  const [isNavigating, setIsNavigating] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [openSections, setOpenSections] = useState<string[]>([])

  const filteredProceedings = useMemo(
    () =>
      searchTerm.length < 2
        ? proceedings
        : proceedings
            .map((proc) => ({
              ...proc,
              proceeding_day: proc.proceeding_day
                .map((day) => ({
                  ...day,
                  proceeding_point_ai: day.proceeding_point_ai.filter((point) =>
                    point.topic.toLowerCase().includes(searchTerm.toLowerCase())
                  ),
                }))
                .filter((day) => day.proceeding_point_ai.length > 0),
            }))
            .filter((proc) => proc.proceeding_day.length > 0),
    [proceedings, searchTerm]
  )

  const handleSearch = useCallback(
    (value: string) => {
      setSearchTerm(value)
      setOpenSections(
        value.length >= 2
          ? filteredProceedings.flatMap((proc) =>
              proc.proceeding_day.map((day) => `day-${day.id}`)
            )
          : []
      )
    },
    [filteredProceedings]
  )

  const handlePointClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    e.preventDefault()
    setIsNavigating(true)
    router.push(href)
  }

  const renderPoint = ({
    point,
    pointsByNumber,
    proceeding,
    day,
  }: PointRenderProps) => {
    const pointNumbers = point.official_point
      ? point.official_point.split(' i ').map((num) => num.split('.')[0].trim())
      : []
    const points =
      pointNumbers.length > 0
        ? pointNumbers.flatMap((num) => pointsByNumber[num] || [])
        : []
    const lastIndex = points.length - 1
    const currentIndex = points.findIndex((p) => p.id === point.id)
    const isInterrupted = points.length > 1 && currentIndex < lastIndex
    const isContinuation = points.length > 1 && currentIndex === lastIndex

    return (
      <div
        key={point.id}
        className="relative border-l pl-2 hover:border-primary sm:pl-6"
      >
        <Link
          href={`/proceedings/${proceeding.number}/${day.date}/${point.id}`}
          className={`hover:text-primary ${
            isNavigating ? 'pointer-events-none opacity-50' : ''
          }`}
          onClick={(e) =>
            handlePointClick(
              e,
              `/proceedings/${proceeding.number}/${day.date}/${point.id}`
            )
          }
          prefetch={false}
        >
          <div className="break-words text-sm">
            <span className="text-muted-foreground">
              {point.official_point ? (
                pointNumbers.join(' i ') + '.'
              ) : (
                <i>(Bez numeru)</i>
              )}
            </span>{' '}
            <span>{point.topic.split(' | ')[1] || point.topic}</span>{' '}
            {isInterrupted && (
              <span className="italic text-destructive">(przerwano)</span>
            )}
            {isContinuation && (
              <span className="italic text-primary">(kontynuacja)</span>
            )}{' '}
            {(point.votingResults?.length ?? 0) > 0 && (
              <Badge
                variant="outline"
                className="inline-flex items-center gap-1"
              >
                <Vote className="h-3 w-3" />
                {point.votingResults?.length}
              </Badge>
            )}
          </div>
        </Link>
      </div>
    )
  }

  const getPointsByNumber = (
    proceeding: Proceeding
  ): Record<string, ProceedingPoint[]> =>
    proceeding.proceeding_day.reduce(
      (acc, day) => {
        day.proceeding_point_ai.forEach((point) => {
          if (point.official_point) {
            const numbers = point.official_point
              .split(' i ')
              .map((num) => num.split('.')[0].trim())
            numbers.forEach((number) => {
              if (!acc[number]) acc[number] = []
              acc[number].push({ ...point, date: day.date })
            })
          }
        })
        return acc
      },
      {} as Record<string, ProceedingPoint[]>
    )

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-8"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {searchTerm.length < 2
            ? 'Wpisz minimum 2 znaki aby wyszukać'
            : !filteredProceedings.length && 'Brak wyników'}
        </p>
      </div>

      {(searchTerm.length < 2 ? proceedings : filteredProceedings).map(
        (proceeding) => {
          const pointsByNumber = getPointsByNumber(proceeding)
          Object.values(pointsByNumber).forEach((points) =>
            points.sort(
              (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
            )
          )

          return (
            <CardWrapper
              key={proceeding.number}
              title={`${new Date(proceeding.dates[0]).toLocaleDateString(
                'pl-PL'
              )} - ${new Date(
                proceeding.dates[proceeding.dates.length - 1]
              ).toLocaleDateString('pl-PL')}`}
              subtitle={`Posiedzenie ${proceeding.number}`}
              showGradient={false}
            >
              <Accordion
                type="multiple"
                value={openSections}
                onValueChange={setOpenSections}
              >
                {proceeding.proceeding_day.map((day) => (
                  <AccordionItem key={day.id} value={`day-${day.id}`}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {`${new Date(day.date).toLocaleDateString(
                            'pl-PL'
                          )} - ${new Date(
                            proceeding.dates[proceeding.dates.length - 1]
                          ).toLocaleDateString('pl-PL')}`}
                        </span>
                        {!day.proceeding_point_ai?.length && (
                          <Badge variant={'destructive'}>brak danych</Badge>
                        )}
                        {day.proceeding_point_ai.some(
                          (p) => p.votingResults?.length
                        ) && (
                          <Badge
                            variant="outline"
                            className="flex items-center gap-1"
                          >
                            <Vote className="ms-1 h-3 w-3" /> Głosowań:{' '}
                            <span>
                              {day.proceeding_point_ai.reduce(
                                (acc, p) =>
                                  acc + (p.votingResults?.length || 0),
                                0
                              )}
                            </span>
                          </Badge>
                        )}
                        {day.proceeding_point_ai.some(
                          (p) => p.breakVotingsCount
                        ) && (
                          <Badge
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            <Timer className="h-3 w-3" />
                            <span>
                              Wnioski o przerwę (
                              {day.proceeding_point_ai.reduce(
                                (acc, p) => acc + (p.breakVotingsCount || 0),
                                0
                              )}
                              )
                            </span>
                          </Badge>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4 pt-2">
                      <div className="ml-2 space-y-3 border-l sm:ml-6">
                        {day.proceeding_point_ai?.map((point) =>
                          renderPoint({
                            point,
                            pointsByNumber,
                            proceeding,
                            day,
                          })
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardWrapper>
          )
        }
      )}
    </div>
  )
}
