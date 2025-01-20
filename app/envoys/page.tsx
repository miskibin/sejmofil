import {
  getAllEnvoys,
  getPersonInterruptionsCount,
  getPersonStatementCounts,
} from '@/lib/queries/person'
import { cache, Suspense } from 'react'
import { EnvoysListClient } from './components/envoys-list-client'
export const dynamic = 'force-dynamic'
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
