"use client";

import { Bar, BarChart, XAxis, YAxis, ReferenceLine, Tooltip } from "recharts";
import { ChartContainer } from "@/components/ui/chart";

interface TopicAttitudeChartProps {
  data: Array<{
    club: string;
    attitude: number;
    count: number;
  }>;
}

const NEUTRAL_POINT = 2.5;

const valueToRating = (value: number) => {
  if (value <= 1) return "Negatywny";
  if (value <= 2) return "Krytyczny";
  if (value <= 3) return "Neutralny";
  if (value <= 4) return "Pozytywny";
  return "B. pozytywny";
};

export function TopicAttitudeChart({ data }: TopicAttitudeChartProps) {
  // Transform data to split into positive and negative components
  const transformedData = data.map(item => ({
    club: item.club,
    negative: item.attitude <= NEUTRAL_POINT 
      ? -(NEUTRAL_POINT - item.attitude) // Make negative values for the chart
      : 0,
    positive: item.attitude > NEUTRAL_POINT 
      ? item.attitude - NEUTRAL_POINT
      : 0,
    originalValue: item.attitude,
    count: item.count,
  }));

  return (
    <ChartContainer
      config={{
        value: {
          label: "ocena",
          color: "hsl(var(--chart-1))",
        },
      }}
      className="min-h-128 min-w-full p-0 m-0"
    >
    <BarChart
      data={transformedData}
      width={500}
      height={300}
      margin={{
        top: 20,
        right: 20,
        left: 10,
        bottom: 5,
      }}
    >
      <XAxis
        dataKey="club"
        tickLine={false}
        axisLine={false}
      />
      <YAxis
        tickLine={false}
        axisLine={false}
        domain={[-2.5, 2.5]}
        tickFormatter={valueToRating}
        ticks={[-2.5, 2.5]} // Only show bottom and top labels
      />
      <ReferenceLine 
        y={0}
        stroke="#666"
        strokeWidth={2}
        label={{
        value: "Neutralny",
        position: "left",
        fill: "#666",
        fontSize: 12,
        }}
      />
      <Bar
        dataKey="negative"
        fill="hsl(var(--destructive))"
        stackId="stack"
        radius={[4,4, 0, 0]}
      />
      <Bar
        dataKey="positive"
        fill="hsl(var(--success))"
        stackId="stack"
        radius={[4, 4, 0, 0]}
      />
      <Tooltip
                cursor={false}
        content={({ payload, label }) => {
        if (payload && payload[0]) {
          const originalValue = payload[0].payload.originalValue;
          return (
            <div className="rounded-lg bg-white p-2 shadow-md border">
            <p className="font-medium">{label}</p>
            <p className="text-sm">
              Ocena: {originalValue.toFixed(2)} ({valueToRating(originalValue)})
            </p>
            <p className="text-xs text-muted-foreground">
              Liczba wypowiedzi: {payload[0].payload.count}
            </p>
            </div>
          );
        }
        return null;
        }}
      />
    </BarChart>
    </ChartContainer>
  );
}
