import SessionCalendar from '@/components/calendar'
import DidYouKnow from '@/components/did-you-know'
import HotTopics from '@/components/hot-topics'
import LatestInterestingPoints from '@/components/latest-interesting-points'
import RecentPoints from '@/components/recent-points'
import StatCard from '@/components/stat-card'
import TotalBreaks from '@/components/total-breaks'
import SejmCostCounter from '@/components/total-cost'
import TotalProceedingDays from '@/components/total-proceeding-days'
import { Alert } from '@/components/ui/alert'
import { CardWrapper } from '@/components/ui/card-wrapper'
import { getProceedingDates } from '@/lib/queries/proceeding'
import { getNextProceedingDate, getTimeUntilNextProceeding } from '@/lib/utils'
import { Code, Paintbrush, ScrollText } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 3600 // 1 hour
export default async function Home() {
  const proceedings = await getProceedingDates()
  const nextDate = getNextProceedingDate(proceedings)
  const timeUntil = getTimeUntilNextProceeding(nextDate)
  return (
    <>
      <Alert>Strona w rozwoju. wróć za 2 tygodnie</Alert>

      <div className="mb-4 mt-16 sm:mb-8">
        <h1 className="px-2 text-2xl font-semibold">
          {nextDate ? (
            <>
              {timeUntil === '0' ? (
                'Obrady trwają'
              ) : (
                <>
                  Do następnych Obrad zostało{' '}
                  <span className="text-primary">{timeUntil}</span>
                </>
              )}
            </>
          ) : (
            <span>Brak zaplanowanych obrad</span>
          )}
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-6 lg:grid-cols-12">
        {/* First row */}
        <div
          className="grid grid-cols-1 gap-4 sm:col-span-6 lg:col-span-9 lg:grid-cols-2"
          data-umami-event="hot-topics-view"
        >
          <HotTopics />
          <SessionCalendar />
        </div>

        <div
          className="sm:col-span-3 lg:col-span-3 lg:row-span-2"
          data-umami-event="did-you-know-view"
        >
          <DidYouKnow />
        </div>
        <div
          className="grid grid-cols-1 gap-4 sm:col-span-3 lg:col-span-9 lg:grid-cols-2"
          data-umami-event="recent-votes-view"
        >
          <LatestInterestingPoints />
        </div>

        {/* Stats row */}
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
          <CardWrapper
            title="Podoba Ci się nasza praca?"
            subtitle="Dołącz do nas"
            showMoreLink="/about"
            className="col-span-1 lg:col-span-2"
          >
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="flex items-center gap-2 rounded-lg p-2">
                  <Paintbrush className="text-prrimary h-4 w-4" />
                  <span className="text-sm">UI/UX</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg p-2">
                  <Code className="text-prrimary h-4 w-4" />
                  <span className="text-sm">Frontend</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg p-2">
                  <ScrollText className="text-prrimary h-4 w-4" />
                  <span className="text-sm">Legislacja</span>
                </div>
              </div>
            </div>
          </CardWrapper>
        </div>
        <div className="sm:col-span-2 lg:col-span-6">
          {/* Bottom section */}
          <RecentPoints />
        </div>
      </div>
    </>
  )
}
