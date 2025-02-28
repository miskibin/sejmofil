"use client";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { Button } from "./ui/button";

interface TabItem {
  value: string;
  label: string | ReactNode;
  content: ReactNode;
}

interface CardWrapperProps {
  title: string;
  subtitle?: string;
  tabs?: TabItem[];
  defaultTab?: string;
  className?: string;
  children?: ReactNode;
}

export function CardWrapper({
  title,
  subtitle,
  tabs,
  defaultTab,
  className,
}: CardWrapperProps) {
  const [activeTab, setActiveTab] = React.useState(
    defaultTab || (tabs && tabs[0]?.value)
  );

  return (
    <Card className={cn("w-full", className)}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold text-primary">{title}</h1>
            {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
          </div>
          {tabs && (
            <div className="flex gap-2">
              {tabs.map((tab) => (
                <Button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  size={"sm"}
                  variant={activeTab === tab.value ? "default" : "outline"}
                >
                  {tab.label}
                </Button>
              ))}
            </div>
          )}
        </div>
        {tabs && (
          <CardContent className="px-0 pb-0">
            {tabs.map((tab) => (
              <div
                key={tab.value}
                className={cn(activeTab === tab.value ? "block" : "hidden")}
              >
                {tab.content}
              </div>
            ))}
          </CardContent>
        )}
      </div>
    </Card>
  );
}

export default CardWrapper;
