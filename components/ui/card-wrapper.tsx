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
  variant?: "default" | "inverted";
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
  variant = "default",
}: CardWrapperProps) {
  const isInverted = variant === "inverted";

  return (
    <Card
      className={cn(
        "w-full flex flex-col",
        isInverted && "bg-primary text-primary-foreground",
        className
      )}
    >
      <CardHeader className="pb-2 lg:px-4 2xl:px-6">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle
              className={cn(
                "text-sm font-normal",
                isInverted ? "text-primary-foreground" : "text-primary"
              )}
            >
              {title}
            </CardTitle>
            <h2 className="text-2xl font-semibold">{subtitle}</h2>
          </div>
          {headerIcon && <div className="p-2 rounded-lg">{headerIcon}</div>}
        </div>
      </CardHeader>

      {/* <hr
        className={cn(
          "mx-6 mb-4",
          isInverted ? "border-primary-foreground/20" : "border-primary/20"
        )}
      /> */}

      <CardContent className="flex-1 flex flex-col min-h-[100px] mt-4">
        <div className="relative flex-1">
          <div className="space-y-4">{children}</div>

          {showGradient && (
            <div
              className={cn(
                "absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t pointer-events-none",
                isInverted
                  ? "from-primary via-primary to-transparent"
                  : "from-white via-white to-transparent"
              )}
            />
          )}
        </div>

        {(sourceDescription || sourceUrls || showDate) && (
          <div
            className={cn(
              "mt-4 flex items-center justify-between text-sm",
              isInverted
                ? "text-primary-foreground/80"
                : "text-muted-foreground"
            )}
          >
            {showDate ? (
              <div
                className={cn(
                  "border rounded-full px-3 py-1",
                  isInverted && "border-primary-foreground/20"
                )}
              >
                <span>20/12/2024</span>
              </div>
            ) : (
              <div></div>
            )}
            {(sourceDescription || sourceUrls) && (
              <SourcePopover
                variant={variant}
                urls={sourceUrls}
                description={sourceDescription}
                aiPrompt={aiPrompt}
              />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
