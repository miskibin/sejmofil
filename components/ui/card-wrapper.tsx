// CardWrapper.tsx
import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SourcePopover } from "./source-popover";
import { cn } from "@/lib/utils";

interface CardWrapperProps {
  title: string;
  subtitle: string;
  headerIcon?: ReactNode;
  showSource?: boolean;
  showDate?: boolean;
  showGradient?: boolean;
  children: ReactNode;
  sourceUrls?: string[];
  sourceDescription?: string;
  aiPrompt?: string;
  className?: string;
}

export function CardWrapper({
  title,
  subtitle,
  headerIcon,
  showDate = true,
  showGradient = true,
  children,
  sourceUrls,
  sourceDescription,
  aiPrompt,
  className,
}: CardWrapperProps) {
  return (
    <Card className={cn("w-full flex flex-col", className)}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-sm text-primary">{title}</CardTitle>
            <h2 className="text-2xl font-semibold">{subtitle}</h2>
          </div>
          {headerIcon && <div className="p-2 rounded-lg">{headerIcon}</div>}
        </div>
      </CardHeader>

      <hr className="mx-6 mb-4" />

      <CardContent className="flex-1 flex flex-col min-h-[100px]">
        <div className="relative flex-1">
          <div className="space-y-4">{children}</div>

          {showGradient && (
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white via-white to-transparent pointer-events-none" />
          )}
        </div>

        {(sourceDescription || sourceUrls || showDate) && (
          <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
            {(sourceDescription || sourceUrls) && (
              <SourcePopover
                urls={sourceUrls}
                description={sourceDescription}
                aiPrompt={aiPrompt}
              />
            )}
            {showDate && (
              <div className="border rounded-full px-3 py-1">
                <span>20/12/2024</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
