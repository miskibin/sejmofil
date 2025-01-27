import RecentPoints from '@/components/recent-points'
import StatCard from '@/components/stat-card'
import TotalBreaks from '@/components/total-breaks'
import SejmCostCounter from '@/components/total-cost'
import TotalProceedingDays from '@/components/total-proceeding-days'
import { JoinUs } from '../join-us/join-us'

export function StatsRow() {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:col-span-2 lg:col-span-6 lg:grid-cols-2">
        <SejmCostCounter />
        <TotalProceedingDays />
        <TotalBreaks />
        <StatCard
          title="Koszty pracy senatu"
          value={'268 mln zł'}
          category="w 2025"
          sourceDescription="Ustawa budżetowa na rok 2025. Strona 45"
          sourceUrls={[
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/685/687-ustawa%20i%20za%C5%82%C4%85czniki%20do%20ustawy.pdf`,
          ]}
        />
        <JoinUs />
      </div>
      <div className="sm:col-span-2 lg:col-span-6">
        {/* Bottom section */}
        <RecentPoints />
      </div>
    </>
  )
}
