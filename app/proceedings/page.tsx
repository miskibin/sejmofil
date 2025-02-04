import { VotingResult } from '@/lib/api/sejm'
import { getVotingResultsByNumbrs } from '@/lib/queries/proceeding'
import { getProceedings } from '@/lib/supabase/getProceedings'
import { Metadata } from 'next'
import { ProceedingsList } from './proceedings-list'
import { ProceedingPoint } from './types'

export const metadata: Metadata = {
  title: 'Posiedzenia Sejmu | Sejmofil',
  description: 'Lista posiedzeń Sejmu X kadencji',
}

// export const revalidate = 3600; // Revalidate every hour
export default async function ProceedingsPage() {
  // Add artificial delay in development to test loading states

  const proceedings = await getProceedings()

  // Fetch voting data for all proceedings
  const proceedingsWithVotings = await Promise.all(
    proceedings.map(async (proceeding) => {
      const days = await Promise.all(
        proceeding.proceeding_day.map(async (day) => {
          const points = await Promise.all(
            day.proceeding_point_ai.map(async (point) => {
              if (!point.voting_numbers?.length) {
                return {
                  ...point,
                  votingResults: [] as VotingResult[],
                  breakVotingsCount: 0,
                } as ProceedingPoint
              }

              const votings = await getVotingResultsByNumbrs(
                proceeding.number,
                point.voting_numbers
              )

              return {
                ...point,
                votingResults: votings.filter(
                  (v) => v.topic !== 'Wniosek o przerwę'
                ),
                breakVotingsCount: votings.filter(
                  (v) => v.topic === 'Wniosek o przerwę'
                ).length,
              } as unknown as ProceedingPoint
            })
          )
          return { ...day, proceeding_point_ai: points }
        })
      )
      return { ...proceeding, proceeding_day: days }
    })
  )

  return <ProceedingsList proceedings={proceedingsWithVotings} />
}
