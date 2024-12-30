"use client";

import { useEffect, useState } from "react";
import StatCard from "@/components/stat-card";
import { getTotalProceedingDays } from "@/lib/queries/proceeding";

export default function TotalProceedingDays() {
  const [days, setDays] = useState(0);

  useEffect(() => {
    getTotalProceedingDays().then(setDays);
  }, []);

  return (
    <StatCard
      title="Dni posiedzeń sejmu"
      value={days}
      sourceDescription="Oficjalne api sejmu RP"
      sourceUrls={[
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/proceedings`,
      ]}
      category="Od początku kadencji"
    />
  );
}
