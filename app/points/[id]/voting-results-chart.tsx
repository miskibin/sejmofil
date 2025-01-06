"use client";

import { Bar, BarChart, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { ChartContainer } from "@/components/ui/chart";

interface VotingResultsChartProps {
  data: Array<{
    club: string;
    yes: number;
    no: number;
    abstain: number;
  }>;
}

export function VotingResultsChart({ data }: VotingResultsChartProps) {
  return (
    <ChartContainer className="min-h-[300px]"
        config={{
            value: {
            label: "Głosy",
            color: "hsl(var(--chart-1))",
            },
        }}
    >
      <BarChart
        data={data}
        width={500}
        height={300}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <XAxis dataKey="club" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="yes" name="Za" fill="hsl(var(--success))" stackId="stack" />
        <Bar dataKey="no" name="Przeciw" fill="hsl(var(--destructive))" stackId="stack" />
        <Bar dataKey="abstain" name="Wstrzymanie się" fill="hsl(var(--muted))" stackId="stack" />
      </BarChart>
    </ChartContainer>
  );
}
