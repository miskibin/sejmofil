"use client";

import { Bar, BarChart, XAxis, YAxis, ReferenceLine, Tooltip } from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

interface TopicAttitudeChartProps {
  data: Array<{
    club: string;
    attitude: number;
    count: number;
  }>;
}

const valueToRating = (value: number) => {
  if (value <= 1) return "Negatywny";
  if (value <= 2) return "Krytyczny";
  if (value <= 3) return "Neutralny";
  if (value <= 4) return "Pozytywny";
  return "pozytywny";
};

export function TopicAttitudeChart({ data }: TopicAttitudeChartProps) {
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
        accessibilityLayer
        data={data}
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
          tickMargin={10}
          axisLine={false}
        />
        <YAxis
          dataKey="Nastawienie"
          tickLine={false}
          axisLine={false}
          domain={[0, 5]}
          tickFormatter={valueToRating}
        />
        <ReferenceLine
          y={3}
          stroke="#666"
          strokeDasharray="3 3"
          label={{
            value: "Neutralny",
            position: "left",
            fill: "#666",
            fontSize: 12,
          }}
        />
        <Bar
          dataKey="attitude"
          fill="var(--color-value)"
          radius={[4, 4, 0, 0]}
          maxBarSize={50}
        />
        <Tooltip content={<ChartTooltipContent />} cursor={false} />
      </BarChart>
    </ChartContainer>
  );
}
