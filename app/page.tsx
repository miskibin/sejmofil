"use cache";
import StatCard from "@/components/stat-card";
import RecentVotes from "@/components/recent-votes";
import UpcomingElections from "@/components/upcoming-elections";
import CommissionSessions from "@/components/commission-sessions";
import PoliticianQuotes from "@/components/politician-quotes";
import DidYouKnow from "@/components/did-you-know";
import SessionCalendar from "@/components/calendar";
import HotTopics from "@/components/hot-topics";
import { getTotalProceedingDays } from "@/lib/queries";

export default async function Home() {
  const totalDays = await getTotalProceedingDays();

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-4 sm:mb-8">
          <h1 className="text-lg sm:text-xl font-semibold text-gray-700">
            Do następnych Obrad zostało{" "}
            <span className="text-gray-400">12:31:00</span>
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
            <StatCard
              title="Wszystkie Głosowania"
              value={1002}
              category="Statystyki"
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <StatCard
              title="Dni posiedzeń sejmu"
              value={totalDays}
              category="Statystyki"
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <StatCard
              title="Oczekujące Projekty"
              value={47}
              category="Statystyki"
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
            <RecentVotes />
          </div>
          <div className="sm:col-span-3 lg:col-span-4 row-span-auto">
            <UpcomingElections />
          </div>
          <div className="sm:col-span-3 lg:col-span-4 row-span-2">
            <CommissionSessions />
          </div>
        </div>
      </main>
    </div>
  );
}
