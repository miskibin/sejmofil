import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SourcePopover } from "./source-popover";

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
}

export function CardWrapper({
  title,
  subtitle,
  headerIcon,
  showSource = true,
  showDate = true,
  showGradient = true,
  children,
  sourceUrls,
  sourceDescription,
  aiPrompt,
}: CardWrapperProps) {
  return (
    <Card className="w-full h-full flex flex-col relative overflow-hidden">
      <CardHeader className="py-4 flex flex-row justify-between items-start">
        <div>
          <CardTitle className="text-sm text-primary">{title}</CardTitle>
          <h2 className="text-2xl font-semibold">{subtitle}</h2>
        </div>
        {headerIcon && <div className="p-2 rounded-lg">{headerIcon}</div>}
      </CardHeader>

      <hr className="border-t border-[1px] mx-4 sm:mx-8 mb-6" />

      <CardContent className="flex-1 flex flex-col justify-between px-2 sm:px-3 xl:px-4">
        {children}

        {showGradient && (
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white via-white to-transparent" />
        )}

        {(showSource || showDate) && (
          <div className="relative flex items-center justify-between pt-4 text-sm text-muted-foreground z-10">
            {showSource && (
              <SourcePopover
                urls={sourceUrls}
                description={sourceDescription}
                aiPrompt={aiPrompt}
              />
            )}
            {showDate && (
              <div className="border rounded-full p-1 px-3">
                <span>20/12/2024</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
