"use client";

import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
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
    <ChartContainer
      className="h-[350px] w-full" // Adjusted height for carousel
      config={{
        value: {
          label: "Głosy",
          color: "hsl(var(--chart-1))",
        },
      }}
    >
      <ResponsiveContainer width="90%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{
            top: 5, // Reduced top margin
            right: 30,
            bottom: 5,
          }}
        >
          <XAxis type="number" />
          <YAxis
            type="category"
            dataKey="club"
            width={80}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip cursor={{ fill: "hsl(var(--chart-1))", opacity: 0.1 }} />
          <Bar
            dataKey="yes"
            name="Za"
            fill="hsl(var(--success))"
            stackId="stack"
            radius={[1, 1, 1, 1]}
          />
          <Bar
            dataKey="no"
            name="Przeciw"
            fill="hsl(var(--destructive))"
            stackId="stack"
          />
          <Bar
            dataKey="abstain"
            name="Wstrzymanie się"
            fill="hsl(var(--muted))"
            stackId="stack"
            radius={[1, 1, 1, 1]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
