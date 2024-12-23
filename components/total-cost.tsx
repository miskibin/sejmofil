"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SejmCostCounter = () => {
  const dailyBudget = 849600000 / 365; // Convert yearly budget to daily
  const [cost, setCost] = useState(0);

  useEffect(() => {
    const calcCost = () => {
      const now = new Date();
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);
      
      const msInDay = 1000 * 60 * 60 * 24;
      const elapsedTime = now.getTime() - startOfDay.getTime();
      const dayFraction = elapsedTime / msInDay;
      
      return dailyBudget * dayFraction;
    };

    const updateCost = () => setCost(calcCost());
    updateCost(); // Initial calculation

    // Update every second
    const interval = setInterval(updateCost, 100);

    // Check for midnight reset
    const checkMidnight = () => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0 && now.getSeconds() === 0) {
        setCost(0);
      }
    };
    const midnightCheck = setInterval(checkMidnight, 10000);

    return () => {
      clearInterval(interval);
      clearInterval(midnightCheck);
    };
  }, []);

  const formatCost = (val: number) =>
    new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-sm text-primary">Dzisiaj</CardTitle>
        <h2 className="text-2xl font-semibold">Koszty pracy sejmu</h2>
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
