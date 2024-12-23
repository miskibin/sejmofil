"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
      ? "Dzisiaj"
      : `od ${date.getHours()}:${String(date.getMinutes()).padStart(
          2,
          "0"
        )}:${String(date.getSeconds()).padStart(2, "0")}`;
  };

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-sm text-primary">
            {formatTimeString(startTime)}
          </CardTitle>
          <h2 className="text-2xl font-semibold">Koszty pracy sejmu</h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleReset}
          className="h-8 w-8"
        >
          <Watch className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between md:px-3 xl:px-4">
        <p className="text-3xl font-bold transition-all duration-300 ease-out">
          {formatCost(cost)}
        </p>
      </CardContent>
    </Card>
  );
};

export default SejmCostCounter;
