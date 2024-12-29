import StatCard from "@/components/stat-card";
import RecentPoints from "@/components/recent-points";
import UpcomingElections from "@/components/upcoming-elections";
import CommissionSessions from "@/components/commission-sessions";
import PoliticianQuotes from "@/components/politician-quotes";
import DidYouKnow from "@/components/did-you-know";
import SessionCalendar from "@/components/calendar";
import HotTopics from "@/components/hot-topics";
import TotalProceedingDays from "@/components/total-proceeding-days";
import SejmCostCounter from "@/components/total-cost";
import { getProceedingDates } from "@/lib/queries";
import { getNextProceedingDate, getTimeUntilNextProceeding } from "@/lib/utils";

export const dynamic = "force-dynamic";
export default async function Home() {
  const proceedings = await getProceedingDates();
  const nextDate = getNextProceedingDate(proceedings);
  const timeUntil = getTimeUntilNextProceeding(nextDate);

  return (
    <>
      <div className="mb-4 sm:mb-8 mt-16">
        <h1 className="text-2xl font-semibold">
          {nextDate ? (
            <>
              Do następnych Obrad zostało{" "}
              <span className="text-primary">{timeUntil}</span>
            </>
          ) : (
            <span>Brak zaplanowanych obrad</span>
          )}
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-6 lg:grid-cols-12 gap-4">
        {/* First row */}
        <div
          className="sm:col-span-3 lg:col-span-3 lg:row-span-2"
          data-umami-event="did-you-know-view"
        >
          <DidYouKnow />
        </div>
        <div
          className="sm:col-span-3 lg:col-span-4 lg:row-span-2"
          data-umami-event="calendar-view"
        >
          <SessionCalendar />
        </div>
        <div
          className="sm:col-span-6 lg:col-span-5 lg:row-span-2"
          data-umami-event="hot-topics-view"
        >
          <HotTopics />
        </div>

        {/* Stats row */}
        <div
          className="sm:col-span-2 lg:col-span-3"
          data-umami-event="all-votes-stat"
        >
          <SejmCostCounter />
        </div>
        <div className="sm:col-span-2 lg:col-span-3">
          <TotalProceedingDays />
        </div>
        <div className="sm:col-span-2 lg:col-span-3">
          <StatCard
            title="Koszty pracy senatu"
            value={"268M PLN"}
            category="w 2025"
            sourceDescription="Ustawa budżetowa na rok 2025. Strona 45"
            sourceUrls={[`${process.env.NEXT_PUBLIC_API_BASE_URL}/685/687-ustawa%20i%20za%C5%82%C4%85czniki%20do%20ustawy.pdf`]}
          />
        </div>

        {/* Bottom section */}
        <div
          className="sm:col-span-3 lg:col-span-3 lg:row-span-3"
          data-umami-event="quotes-view"
        >
          <PoliticianQuotes />
        </div>
        <div
          className="sm:col-span-3 lg:col-span-5 lg:row-span-2"
          data-umami-event="recent-votes-view"
        >
          <RecentPoints />
        </div>
        <div className="sm:col-span-3 lg:col-span-4 row-span-auto">
          <UpcomingElections />
        </div>
        <div className="sm:col-span-3 lg:col-span-4 row-span-2">
          <CommissionSessions />
        </div>
      </div>
    </>
  );
}
