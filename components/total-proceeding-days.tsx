"use client";

import { useEffect, useState } from "react";
import { getTotalProceedingDays } from "@/lib/queries";
import StatCard from "@/components/stat-card";

export default function TotalProceedingDays() {
  const [days, setDays] = useState(0);

  useEffect(() => {
    getTotalProceedingDays().then(setDays);
  }, []);

  return (
    <StatCard title="Dni posiedzeń sejmu" value={days} category="Statystyki" />
  );
}
