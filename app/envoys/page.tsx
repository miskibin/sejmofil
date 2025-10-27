import {
  getAllEnvoys,
  getPersonInterruptionsCount,
  getPersonStatementCounts,
} from '@/lib/queries/person'
import { cache, Suspense } from 'react'
import { EnvoysListClient } from './components/envoys-list-client'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Posłowie | Sejmofil',
  description: 'Przeglądaj listę posłów X kadencji Sejmu RP. Zobacz ich aktywność, wypowiedzi, przerwania i dane biograficzne.',
}

// Use ISR instead of force-dynamic for better performance
export const revalidate = 3600 // 1 hour

const getEnvoysData = cache(async () => {
  const [envoys, statements, interruptions] = await Promise.all([
    getAllEnvoys(),
    getPersonStatementCounts(),
    getPersonInterruptionsCount(),
  ])

  return {
    initialEnvoys: envoys,
    initialStatementCounts: statements.reduce(
      (acc, { id, numberOfStatements }) => ({
        ...acc,
        [id]: numberOfStatements,
      }),
      {}
    ),
    initialInterruptionCounts: interruptions.reduce(
      (acc, { id, numberOfInterruptions }) => ({
        ...acc,
        [id]: numberOfInterruptions,
      }),
      {}
    ),
  }
})

export default async function EnvoysPage() {
  const data = await getEnvoysData()

  return (
    <Suspense fallback={<div>Ładowanie...</div>}>
      <EnvoysListClient {...data} />
    </Suspense>
  )
}
