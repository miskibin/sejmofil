"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// ...existing code...
const SejmCostCounter = () => {
  const yearlyBudget = 849600000; // 849.6 million PLN
  const [cost, setCost] = useState(0);

  useEffect(() => {
    const startOfYear = new Date("2025-01-01T00:00:00");
    const calcCost = () => {
      const now = new Date();
      const msInYear = 1000 * 60 * 60 * 24 * 365;
      const elapsedTime = now.getTime() - startOfYear.getTime();
      const yearFraction = elapsedTime / msInYear;
      return yearlyBudget * yearFraction;
    };

    const updateCost = () => setCost(calcCost());
    updateCost();

    const interval = setInterval(updateCost, 60);
    return () => clearInterval(interval);
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
        <CardTitle className="text-sm text-primary">W roku 2025</CardTitle>
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
