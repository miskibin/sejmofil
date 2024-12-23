import { getTotalProceedingDays } from "@/lib/queries";
import StatCard from "@/components/stat-card";

export default async function TotalProceedingDays() {
  const totalDays = await getTotalProceedingDays();

  return (
    <StatCard
      title="Dni posiedzeń sejmu"
      value={totalDays}
      category="Statystyki"
    />
  );
}

