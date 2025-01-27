import {
  getPersonWithMostAbsents,
  getPersonWithMostInterruptions,
  getPersonWithMostStatements,
} from '@/lib/queries/person'

export const getPoliticians = async () => {
  const mostAbsents = await getPersonWithMostAbsents()
  const mostStatements = await getPersonWithMostStatements()
  const leastAbsents = await getPersonWithMostAbsents(true)
  const mostInterruptions = (await getPersonWithMostInterruptions()) || 0

  const politicians = [
    {
      ...mostAbsents,
      mainStat: {
        value: mostAbsents.count,
        url: `/envoys?ranking=statements`,
        displayText: `Nieobecności: ${mostAbsents.count}`,
      },
      image: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/MP/${mostAbsents.id}.jpeg`,
    },
    {
      ...mostStatements,
      mainStat: {
        value: mostStatements.count,
        url: `/envoys?ranking=statements`,
        displayText: `Wypowiedzi: ${mostStatements.count}`,
      },
      image: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/MP/${mostStatements.id}.jpeg`,
    },
    {
      ...leastAbsents,
      mainStat: {
        url: `/envoys?ranking=absents`,
        value: leastAbsents.count,
        displayText: `Nieobecności: ${leastAbsents.count}`,
      },
      image: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/MP/${leastAbsents.id}.jpeg`,
    },

    {
      ...mostInterruptions,
      mainStat: {
        value: 0,
        url: `/envoys?ranking=interruptions`,
        displayText: `Przerwał/a: ${mostInterruptions.count} razy`,
      },
      image: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/MP/${mostInterruptions.id}.jpeg`,
    },
    {
      name: 'Donald Tusk',
      id: '400',
      count: 42,
      mainStat: {
        value: 42,
        url: `/envoys?ranking=votes`,
        displayText: 'Wypowiedzi: 42',
      },
      image: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/MP/400.jpeg`,
    },
  ]

  return { politicians }
}
