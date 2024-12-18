import StatCard from "@/components/stat-card";
import RecentVotes from "@/components/recent-votes";
import UpcomingElections from "@/components/upcoming-elections";
import CommissionSessions from "@/components/commission-sessions";
import PoliticianQuotes from "@/components/politician-quotes";
import DidYouKnow from "@/components/did-you-know";
import SessionCalendar from "@/components/calendar";
import HotTopics from "@/components/hot-topics";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-gray-700">
            Do następnych Obrad zostało{" "}
            <span className="text-gray-400">12:31:00</span>
          </h1>
        </div>

        <div className="grid grid-cols-12 grid-rows-7 gap-4 ">
          {/* First row */}
          <div className="col-span-3 row-span-2">
            <DidYouKnow />
          </div>
          <div className="col-span-4 row-span-2">
            <SessionCalendar />
          </div>
          <div className="col-span-5 row-span-2 ">
            <HotTopics />
          </div>
          {/* Stats row */}
          <div className="col-span-3">
            <StatCard
              title="Wszystkie Głosowania"
              value={1002}
              category="Statystyki"
            />
          </div>
          <div className="col-span-3">
            <StatCard
              title="Wszystkie Projekty"
              value={215}
              category="Statystyki"
            />
          </div>
          <div className="col-span-3">
            <StatCard
              title="Oczekujące Projekty"
              value={47}
              category="Statystyki"
            />
          </div>
          <div className="col-span-3 row-span-3">
            <PoliticianQuotes />
          </div>
          {/* Left bottom */}
          {/* Middle bottom */}
          <div className="col-span-5 row-span-2">
            <RecentVotes />
          </div>
          <div className="col-span-4 row-span-1">
            <UpcomingElections />
          </div>
          <div className="col-span-4 row-span-2">
            <CommissionSessions />
          </div>
        </div>
      </main>
    </div>
  );
}
