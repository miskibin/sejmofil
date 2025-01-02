"use client";
import React, { useEffect, useState } from "react";
import { CardWrapper } from "@/components/ui/card-wrapper";
import { Watch } from "lucide-react";

const SejmCostCounter = () => {
  const dailyBudget = 849600000 / 365;
  const [cost, setCost] = useState(0);
  const [startTime, setStartTime] = useState(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  });

  useEffect(() => {
    const calcCost = () => {
      const now = new Date();
      const elapsedTime = now.getTime() - startTime.getTime();
      const msInDay = 1000 * 60 * 60 * 24;
      const dayFraction = elapsedTime / msInDay;
      return dailyBudget * dayFraction;
    };

    const updateCost = () => setCost(calcCost());
    updateCost();
    const interval = setInterval(updateCost, 100);
    return () => clearInterval(interval);
  }, [startTime]);

  const formatCost = (val: number) =>
    new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
      maximumFractionDigits: 0,
    }).format(val);

  const handleReset = () => {
    const now = new Date();
    setStartTime(now);
    setCost(0);
  };

  const formatTimeString = (date: Date) => {
    return date.getHours() === 0 &&
      date.getMinutes() === 0 &&
      date.getSeconds() === 0
      ? "Od początku dnia"
      : `od ${date.getHours()}:${String(date.getMinutes()).padStart(
          2,
          "0"
        )}:${String(date.getSeconds()).padStart(2, "0")}`;
  };

  return (
    <CardWrapper
      title={formatTimeString(startTime)}
      subtitle="Koszty pracy sejmu"
      variant="inverted"
      sourceDescription="Ustawa budżetowa. Strona 45"
      sourceUrls={[
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/685/687-ustawa%20i%20za%C5%82%C4%85czniki%20do%20ustawy.pdf`,
      ]}
      headerIcon={
        <button
          onClick={handleReset}
          className="hover:opacity-80 transition-opacity"
        >
          <Watch className="h-5 w-5 " />
        </button>
      }
      showSource={true}
      showDate={false}
      showGradient={false}
    >
      <p className="text-3xl font-bold transition-all duration-300 ease-out">
        {formatCost(cost)}
      </p>
    </CardWrapper>
  );
};

export default SejmCostCounter;
