"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {  Play } from "lucide-react";

const MILESTONES = [
  { value: 30, label: "Minimalna stawka godzinowa" },
  { value: 89, label: "Średnia stawka godzinowa posła" },
  { value: 180, label: "Minimalne wynagrodzenie dzienne" },
];

const THRESHOLD = 4;

const SejmGame = () => {
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [cost, setCost] = useState(0);
  const [score, setScore] = useState(0);
  const [currentMilestone, setCurrentMilestone] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [completedMilestones, setCompletedMilestones] = useState<number[]>([]);
  const [missedMilestones, setMissedMilestones] = useState<number[]>([]);
  const [totalCost, setTotalCost] = useState(0);

  const startGame = () => {
    setIsGameStarted(true);
    setStartTime(new Date());
    setCost(0);
    setScore(0);
    setCurrentMilestone(0);
    setCompletedMilestones([]);
    setMissedMilestones([]);
  };

  useEffect(() => {
    if (!isGameStarted || !startTime) return;

    const dailyBudget = 849600000 / 365;
    const calcCost = () => {
      const now = new Date();
      const elapsedTime = now.getTime() - startTime.getTime();
      const msInDay = 1000 * 60 * 60 * 24;
      const dayFraction = elapsedTime / msInDay;
      return dailyBudget * dayFraction;
    };

    const updateCost = () => {
      const newCost = calcCost();
      setCost(newCost);
      setTotalCost(newCost);
      
      const currentTarget = MILESTONES[currentMilestone].value;
      if (newCost > currentTarget + 5) {
        setMissedMilestones(prev => [...prev, currentMilestone]);
        if (currentMilestone < MILESTONES.length - 1) {
          setCurrentMilestone(prev => prev + 1);
        } else {
          setIsGameStarted(false);
        }
      }
    };

    const interval = setInterval(updateCost, 10);
    return () => clearInterval(interval);
  }, [isGameStarted, startTime, currentMilestone]);

  const handleClick = () => {
    const targetValue = MILESTONES[currentMilestone].value;
    const difference = Math.abs(cost - targetValue);

    if (difference <= THRESHOLD) {
      setScore(prev => prev + 1);
      setCompletedMilestones(prev => [...prev, currentMilestone]);
      
      if (currentMilestone < MILESTONES.length - 1) {
        setCurrentMilestone(prev => prev + 1);
      } else {
        setTimeout(() => setIsGameStarted(false), 500);
      }
    }
  };

  const formatCost = (val: number) =>
    new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
      maximumFractionDigits: 0,
    }).format(val);

  const getMilestoneStatus = (index: number) => {
    if (completedMilestones.includes(index)) return "✅";
    if (missedMilestones.includes(index)) return "❌";
    if (index === currentMilestone) return "👉";
    return "⏳";
  };

  if (!isGameStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              {score > 0 ? `Gra zakończona! Twój wynik: ${score}/${MILESTONES.length}` : 'Gra w koszty Sejmu'}
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Klikaj gdy licznik osiągnie wartość milestone (±4 PLN)
            </p>
            {score > 0 && (
              <p className="text-sm text-muted-foreground mt-4 p-4 bg-muted/50 rounded-lg">
                Podczas tej gry Sejm kosztował podatników{' '}
                <span className="font-bold">{formatCost(totalCost)}</span>
              </p>
            )}
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div className="space-y-2 w-full">
              {MILESTONES.map((milestone, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span>{milestone.label}: {milestone.value} PLN</span>
                  {score > 0 && <span>{completedMilestones.includes(index) ? "✅" : "❌"}</span>}
                </div>
              ))}
            </div>
            <Button size="lg" onClick={startGame} className="mt-4">
              <Play className="mr-2 h-4 w-4" />
              {score > 0 ? 'Zagraj ponownie' : 'Rozpocznij grę'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold text-primary">
                Cel: {MILESTONES[currentMilestone].label}
              </CardTitle>
              <span className="text-lg font-bold">Wynik: {score}</span>
            </div>
            <div className="flex flex-col gap-1">
              {MILESTONES.map((milestone, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className={index === currentMilestone ? "font-bold" : "text-muted-foreground"}>
                    {milestone.label}
                  </span>
                  <span>{getMilestoneStatus(index)}</span>
                </div>
              ))}
            </div>
           
          </div>
        </CardHeader>
        <CardContent
          onClick={handleClick}
          className="flex flex-col gap-4 items-center p-8 cursor-pointer hover:bg-accent/5 transition-colors rounded-lg"
        >
          <p className="text-6xl font-bold tracking-tight">
            {formatCost(cost)}
          </p>
          <p className="text-sm text-muted-foreground">
            Kliknij gdy wartość osiągnie 
            <span className="font-bold text-primary"> {" "}
            {formatCost(MILESTONES[currentMilestone].value)}
            </span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SejmGame;
