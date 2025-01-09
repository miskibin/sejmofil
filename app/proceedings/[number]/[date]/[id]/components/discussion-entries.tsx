"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Heart, Brain, Scale, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type FilterMode = "featured" | "all" | "normal";

interface Statement {
  id: number;
  speaker_name: string;
  number_source: number;
  statement_ai: {
    summary_tldr: string;
    citations?: string[];
    speaker_rating: Record<string, number>;
  };
}

interface SpeakerInfo {
  name: string;
  club: string;
  id: number;
}

interface DiscussionEntriesProps {
  statements: Statement[];
  speakerClubs: SpeakerInfo[];
  proceedingNumber: number;
  proceedingDate: string;
  initialMode?: FilterMode;
}

// Add this mapping near the top of the file, before the component
const metricIcons: Record<string, { icon: React.ReactNode; tooltip: string }> =
  {
    emotions: {
      icon: <Heart className="w-4 h-4 text-primary" />,
      tooltip: "Emocjonalność",
    },
    manipulation: {
      icon: <AlertTriangle className="w-4 h-4 text-yellow-500" />,
      tooltip: "Manipulacja",
    },
    logic: {
      icon: <Brain className="w-4 h-4 text-blue-500" />,
      tooltip: "Logika",
    },
    facts: {
      icon: <Scale className="w-4 h-4 text-success" />,
      tooltip: "Fakty",
    },
  };

export function DiscussionEntries({
  statements,
  speakerClubs,
  proceedingNumber,
  proceedingDate,
  initialMode = "featured",
}: DiscussionEntriesProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filterMode, setFilterMode] = useState<FilterMode>(initialMode);
  const [showAll, setShowAll] = useState(false);
  const getSpeakerInfo = (name: string) => {
    return speakerClubs.find((s) => s.name === name);
  };

  const handleModeChange = (mode: FilterMode) => {
    setFilterMode(mode);
    const params = new URLSearchParams(searchParams.toString());
    if (mode === "all") {
      params.set("showAll", "true");
    } else {
      params.delete("showAll");
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const filteredStatements = statements.filter((statement) => {
    if (filterMode === "normal") return true;
    if (filterMode === "all") return true;

    // Featured mode - show statements with high emotion or manipulation scores
    const emotions = statement.statement_ai?.speaker_rating?.emotions ?? 0;
    const manipulation =
      statement.statement_ai?.speaker_rating?.manipulation ?? 0;
    return emotions >= 4 || manipulation >= 4;
  });

  // Sort statements based on mode
  const sortedStatements = [...filteredStatements].sort((a, b) => {
    if (filterMode === "featured") {
      const getMaxScore = (s: (typeof statements)[0]) => {
        const emotions = s.statement_ai?.speaker_rating?.emotions ?? 0;
        const manipulation = s.statement_ai?.speaker_rating?.manipulation ?? 0;
        return Math.max(emotions, manipulation);
      };
      return getMaxScore(b) - getMaxScore(a);
    }
    return a.number_source - b.number_source;
  });

  const displayedStatements = showAll
    ? sortedStatements
    : sortedStatements.slice(0, 2);

  return (
    <div className="space-y-4 mb-4">
      <div className="flex justify-between items-center pb-4 border-b">
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          {filterMode === "featured" && (
            <div className="flex gap-2">
              <span className="font-medium">Wyróżnione</span>
              <span className="text-muted-foreground">
                ({filteredStatements.length} z {statements.length})
              </span>
            </div>
          )}
        </div>

        <Select
          value={filterMode}
          onValueChange={(value: FilterMode) => handleModeChange(value)}
        >
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="featured">Najciekawsze</SelectItem>
            <SelectItem value="normal">Chronologicznie</SelectItem>
            <SelectItem value="all">Wszystkie</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-6 mb-4">
        {displayedStatements.map((statement) => {
          const speaker = getSpeakerInfo(statement.speaker_name);

          return (
            <div key={statement.id} className={cn("flex flex-col  ")}>
              {/* Header - Now top section on mobile */}
              <div className="flex items-center gap-3 mb-4">
                <Link
                  href={speaker?.id ? `/envoys/${speaker.id}` : "#"}
                  className="flex-shrink-0"
                >
                  <Image
                    src={
                      speaker?.id
                        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/MP/${speaker.id}/photo`
                        : "/placeholder.svg"
                    }
                    alt={statement.speaker_name}
                    width={40}
                    height={40}
                    className="rounded-full"
                    loading="lazy"
                  />
                </Link>

                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <Link
                    href={speaker?.id ? `/envoys/${speaker.id}` : "#"}
                    className="text-sm font-medium hover:underline"
                  >
                    {statement.speaker_name}
                  </Link>
                  <span className="text-xs text-muted-foreground">
                    ({speaker?.club || "Brak klubu"})
                  </span>
                  <TooltipProvider>
                    <div className="flex gap-1">
                      {Object.entries(statement.statement_ai.speaker_rating)
                        .filter(([, value]) => value >= 4)
                        .map(([key, value]) => (
                          <Tooltip key={key}>
                            <TooltipTrigger>
                              <div className="flex items-center">
                                {metricIcons[key]?.icon}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              {metricIcons[key]?.tooltip}: {value}/5
                            </TooltipContent>
                          </Tooltip>
                        ))}
                    </div>
                  </TooltipProvider>
                </div>
              </div>

              {/* Content section */}
              <div className="w-full">
                {statement.statement_ai?.summary_tldr && (
                  <p className="text-sm text-foreground/90 mb-2">
                    {statement.statement_ai.summary_tldr}
                  </p>
                )}

                {/* Citations */}
                {Array.isArray(statement.statement_ai?.citations) &&
                  statement.statement_ai.citations.length > 0 && (
                    <div className="space-y-2 mt-2">
                      {statement.statement_ai.citations.map(
                        (citation, index) => (
                          <blockquote
                            key={index}
                            className="text-sm text-muted-foreground border-l-2 border-primary/30 pl-3 italic"
                          >
                            {citation}
                          </blockquote>
                        )
                      )}
                    </div>
                  )}

                {/* Footer */}
                <div className="mt-2 flex items-center gap-2">
                  <Link
                    href={`${process.env.NEXT_PUBLIC_API_BASE_URL}/proceedings/${proceedingNumber}/${proceedingDate}/transcripts/${statement.number_source}`}
                    target="_blank"
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    całość wypowiedzi
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add load all button */}
      {!showAll && sortedStatements.length > 2 && (
        <div className="flex justify-center pt-4">
          <Button
            variant="ghost"
            onClick={() => setShowAll(true)}
            className="w-full max-w-sm"
          >
            Załaduj wszystkie ({sortedStatements.length - 2} pozostało)
          </Button>
        </div>
      )}
    </div>
  );
}