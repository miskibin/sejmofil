import { Alert } from '@/components/ui/alert'
import { DeliberationsRemain } from '@/components/ui/deliberations-remain'
import { Headings } from '@/components/views/home/headings/headings'
import { LatestInterestingPoints } from '@/components/views/home/latest-interesting-points/latest-interesting-points'
import { StatsRow } from '@/components/views/home/stats-row/stats-row'

export const dynamic = 'force-dynamic'
export const revalidate = 3600 // 1 hour
export default async function Home() {
  return (
    <>
      <Alert>Strona w rozwoju. wróć za 2 tygodnie</Alert>
      <DeliberationsRemain />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-6 lg:grid-cols-12">
        <Headings />
        <LatestInterestingPoints
          className="grid grid-cols-1 gap-4 sm:col-span-3 lg:col-span-9 lg:grid-cols-2"
          dataUmamiEvent="recent-votes-view"
        />
        <StatsRow />
      </div>
    </>
  )
}
