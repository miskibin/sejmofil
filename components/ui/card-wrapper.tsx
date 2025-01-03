import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SourcePopover } from "./source-popover";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface CardWrapperProps {
  title: string;
  subtitle: string;
  headerIcon?: ReactNode;
  showSource?: boolean;
  showMoreLink?: string; // replaced showDate
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
  showGradient = true,
  showMoreLink,
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
                "text-sm font-semibold",
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

        {(sourceDescription || sourceUrls || showMoreLink) && (
          <div
            className={cn(
              "mt-0 flex items-center justify-between text-sm",
              isInverted
                ? "text-primary-foreground/80"
                : "text-muted-foreground"
            )}
          >
            {showMoreLink ? (
                <Link
                href={showMoreLink}
                prefetch={true}
                className={cn(
                  "border rounded-full px-2 py-1 hover:bg-primary/5 cursor-pointer transition-colors flex items-center",
                  isInverted && "border-primary-foreground/20"
                )}
                >
                Więcej <ArrowRight className="h-4 w-4 ml-1 inline" />
                </Link>
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
