"use client";
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

interface TabOption {
  value: string;
  label: string;
}

interface TabItem {
  value: string;
  label: string | ReactNode;
  content: ReactNode;
  options?: TabOption[]; // New: dropdown options for this tab
}

interface CardWrapperProps {
  title: string;
  subtitle?: string;
  tabs?: TabItem[];
  defaultTab?: string;
  className?: string;
  children?: ReactNode;
  onTabOptionSelect?: (tabValue: string, optionValue: string) => void; // New: callback for option selection
  activeTabOption?: string; // New: currently active option
}

export function CardWrapper({
  title,
  subtitle,
  tabs,
  defaultTab,
  className,
  children,
  onTabOptionSelect,
  activeTabOption,
}: CardWrapperProps) {
  const [activeTab, setActiveTab] = useState(
    defaultTab || (tabs && tabs[0]?.value)
  );

  // Find the active tab object
  const currentTab = tabs?.find((tab) => tab.value === activeTab);

  // Get the label for the active option if applicable
  const getActiveOptionLabel = () => {
    if (!currentTab?.options || !activeTabOption) return null;
    const option = currentTab.options.find(
      (opt) => opt.value === activeTabOption
    );
    return option?.label || activeTabOption;
  };

  return (
    <Card className={cn("w-full", className)}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold text-primary">{title}</h1>
            {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
          </div>
          <div className="flex gap-2">
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

            {/* New: Dropdown for tab options if available */}
            {currentTab?.options && currentTab.options.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    {getActiveOptionLabel() || currentTab.options[0].label}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {currentTab.options.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() =>
                        onTabOptionSelect?.(activeTab, option.value)
                      }
                      className={cn(
                        activeTabOption === option.value ? "bg-muted" : ""
                      )}
                    >
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
        {tabs ? (
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
        ) : (
          children
        )}
      </div>
    </Card>
  );
}

export default CardWrapper;
