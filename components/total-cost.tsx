"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SejmCostCounter = () => {
  const yearlyBudget = 849600000; // 849.6 million PLN
  const startOfYear = new Date("2025-01-01T00:00:00");

  const calculateCost = () => {
    const now = new Date();
    const millisecondsInYear = 1000 * 60 * 60 * 24 * 365;
    const elapsedTime = now.getTime() - startOfYear.getTime();
    const yearFraction = elapsedTime / millisecondsInYear;

    return yearlyBudget * yearFraction;
  };

  const formatCost = (cost: string | number | bigint) => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
      maximumFractionDigits: 0,
    }).format(cost);
  };

  // Force re-render every frame for real-time updates
  const [_, forceUpdate] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => forceUpdate((prev) => prev + 1), 60); // ~60 fps
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-sm text-primary">Koszty pracy</CardTitle>
        <h2 className="text-2xl font-semibold">Sejmu w 2025</h2>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between md:px-3 xl:px-4">
        <p className="text-3xl font-bold transition-all duration-300 ease-out">
          {formatCost(calculateCost())}
        </p>
      </CardContent>
    </Card>
  );
};

export default SejmCostCounter;
