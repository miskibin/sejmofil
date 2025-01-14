"use client";

import { useEffect, useState } from "react";
import StatCard from "@/components/stat-card";
import { getBreakVotes } from "@/lib/queries/votings";

export default function TotalBreaks() {
  const [days, setDays] = useState(0);

  useEffect(() => {
    getBreakVotes().then(setDays);
  }, []);

  return (
    <StatCard
      title="Wniosków o przerwę"
      value={days}
      sourceDescription="Oficjalne api sejmu RP"
      sourceUrls={[`${process.env.NEXT_PUBLIC_API_BASE_URL}/votings`]}
      category="Od początku kadencji"
    />
  );
}
