"use client";

import { Bar, BarChart, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface SpeakerRating {
  facts: number;
  logic: number;
  emotions: number;
  manipulation: number;
}

interface SpeakerRatingChartProps {
  speakerRatings: SpeakerRating[];
}

export function SpeakerRatingChart({
  speakerRatings,
}: SpeakerRatingChartProps) {
  // Calculate average ratings
  const averageRatings = speakerRatings.reduce(
    (acc: Record<keyof SpeakerRating, number>, rating) => {
      acc.facts += rating.facts;
      acc.logic += rating.logic;
      acc.emotions += rating.emotions;
      acc.manipulation += rating.manipulation;
      return acc;
    },
    { facts: 0, logic: 0, emotions: 0, manipulation: 0 }
  );

  const totalStatements = speakerRatings.length;
  Object.keys(averageRatings).forEach((key) => {
    averageRatings[key as keyof SpeakerRating] = parseFloat(
      (averageRatings[key as keyof SpeakerRating] / totalStatements).toFixed(2)
    );
  });

  const data = [
    { name: "Fakty", value: averageRatings.facts },
    { name: "Logika", value: averageRatings.logic },
    { name: "Emocje", value: averageRatings.emotions },
    { name: "Manipulacja", value: averageRatings.manipulation },
  ];

  return (
    <ChartContainer
      config={{
        value: {
          label: "Rating",
          color: "hsl(var(--chart-1))",
        },
      }}
      className="min-h-128 min-w-full p-0 m-0"
    >
      <BarChart
        data={data}
        width={500}
        height={300}
        margin={{
          top: 20,
          right: 20,
          left: 0,
          bottom: 5,
        }}
      >
        <XAxis dataKey="name" />
        <YAxis />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="value" fill="var(--color-value)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
