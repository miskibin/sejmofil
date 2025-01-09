"use client";

import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  ReferenceLine,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChartContainer } from "@/components/ui/chart";

interface TopicAttitudeChartProps {
  data: Array<{
    club: string;
    attitude: number;
    count: number;
  }>;
}

const valueToRating = (value: number) => {
  if (value <= -2) return "Negatywny";
  if (value <= -1) return "Krytyczny";
  if (value <= 1) return "Neutralny";
  if (value <= 4) return "Pozytywny";
  return "B. pozytywny";
};

// input data range is between -2.5 and 2.5
export function TopicAttitudeChart({ data }: TopicAttitudeChartProps) {
  // Transform data to split into positive and negative values
  const transformedData = data.map((item) => ({
    ...item,
    positive: item.attitude > 0 ? item.attitude : 0,
    negative: item.attitude < 0 ? item.attitude : 0,
    originalValue: item.attitude,
  }));

  return (
    <ChartContainer
      config={{
        value: {
          label: "ocena",
          color: "hsl(var(--chart-1))",
        },
      }}
      className="h-[400px] w-11/12"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={transformedData}
          layout="vertical"
          margin={{
            top: 20,
            right: 20,
            left: 15,
            bottom: 5,
          }}
        >
          <XAxis
            type="number"
            domain={[-2.5, 2.5]}
            tickFormatter={valueToRating}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12 }} // Smaller font size for better mobile display
          />
          <YAxis
            type="category"
            dataKey="club"
            tickLine={false}
            axisLine={false}
            width={75} // Slightly reduced for mobile
            tick={{ fontSize: 12 }} // Smaller font size for better mobile display
          />
          <ReferenceLine
            x={0}
            stroke="#666"
            strokeWidth={1} // Thinner line for mobile
            label={{
              value: "Neutralny",
              position: "top",
              fill: "#666",
              fontSize: 10, // Smaller font for mobile
            }}
          />
          <Bar
            dataKey="negative"
            fill="hsl(var(--destructive))"
            stackId="stack"
            radius={[4, 4, 4, 4]}
          />
          <Bar
            dataKey="positive"
            fill="hsl(var(--success))"
            stackId="stack"
            radius={[4, 4, 4, 4]}
          />
          <Tooltip
            cursor={false}
            content={({ payload, label }) => {
              if (payload && payload[0]) {
                const originalValue = payload[0].payload.originalValue;
                return (
                  <div className="rounded-lg bg-white p-2 shadow-md border max-w-[200px] break-words">
                    <p className="font-medium text-sm">{label}</p>
                    <p className="text-xs">
                      Ocena: {originalValue.toFixed(2)} (
                      {valueToRating(originalValue)})
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
      </ResponsiveContainer>
    </ChartContainer>
  );
}
