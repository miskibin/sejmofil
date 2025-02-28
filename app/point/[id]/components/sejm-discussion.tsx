"use client";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  ExternalLink,
  Heart,
  AlertTriangle,
  Brain,
  Scale,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

// Add club to FilterMode type
type FilterMode = "featured" | "all" | "normal" | string; // string for club names

interface Statement {
  id: number;
  speaker_name: string;
  number_source: number;
  number_sequence: number;
  text: string;
  statement_ai?: {
    summary_tldr?: string;
    citations?: string[];
    topic_attitude?: {
      score: number;
    };
    speaker_rating?: Record<string, number>;
    yt_sec?: number;
  };
}

interface SpeakerInfo {
  name: string;
  club: string;
  id: number;
}

interface SejmDiscussionProps {
  statements: Statement[];
  speakerClubs: SpeakerInfo[];
  proceedingNumber: number;
  proceedingDate: string;
  filterMode: FilterMode;
  onFilterChange: (mode: FilterMode) => void;
}

// Metric icons mapping
const metricIcons: Record<string, { icon: React.ReactNode; tooltip: string }> =
  {
    emotions: {
      icon: <Heart className="h-4 w-4 text-primary" />,
      tooltip: "Emocjonalność",
    },
    manipulation: {
      icon: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
      tooltip: "Manipulacja",
    },
    logic: {
      icon: <Brain className="h-4 w-4 text-blue-500" />,
      tooltip: "Logika",
    },
    facts: {
      icon: <Scale className="h-4 w-4 text-success" />,
      tooltip: "Fakty",
    },
  };

export function SejmDiscussion({
  statements,
  speakerClubs,
  proceedingNumber,
  proceedingDate,
  filterMode = "featured",
  onFilterChange,
}: SejmDiscussionProps) {
  const [showAll, setShowAll] = useState(false);

  const getSpeakerInfo = (name: string) => {
    return speakerClubs.find((s) => s.name === name);
  };

  // Get unique clubs
  const uniqueClubs = Array.from(
    new Set(speakerClubs.map((s) => s.club))
  ).filter(Boolean);

  const filteredStatements = statements.filter((statement) => {
    if (filterMode === "normal") return true;
    if (filterMode === "all") return true;
    if (filterMode === "featured") {
      // Featured mode - show statements with high emotion or manipulation scores
      const emotions = statement.statement_ai?.speaker_rating?.emotions ?? 0;
      const manipulation =
        statement.statement_ai?.speaker_rating?.manipulation ?? 0;
      return emotions >= 4 || manipulation >= 4;
    }
    // Club filtering
    const speaker = getSpeakerInfo(statement.speaker_name);
    return speaker?.club === filterMode;
  });

  // Sort statements based on mode
  const sortedStatements = [...filteredStatements].sort((a, b) => {
    if (filterMode === "featured") {
      const getMaxScore = (s: Statement) => {
        const emotions = s.statement_ai?.speaker_rating?.emotions ?? 0;
        const manipulation = s.statement_ai?.speaker_rating?.manipulation ?? 0;
        return Math.max(emotions, manipulation);
      };
      return getMaxScore(b) - getMaxScore(a);
    }
    return a.number_sequence - b.number_sequence;
  });

  const displayedStatements = showAll
    ? sortedStatements
    : sortedStatements.slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {filterMode === "featured" ? (
            <div className="flex gap-2">
              <span className="font-medium">Wyróżnione</span>
              <span className="text-muted-foreground">
                ({filteredStatements.length} z {statements.length})
              </span>
            </div>
          ) : (
            uniqueClubs.includes(filterMode) && (
              <div className="flex gap-2">
                <span className="font-medium">{filterMode}</span>
                <span className="text-muted-foreground">
                  ({filteredStatements.length})
                </span>
              </div>
            )
          )}
        </div>
      </div>

      <div className="space-y-6">
        {displayedStatements.map((statement) => {
          const speaker = getSpeakerInfo(statement.speaker_name);

          return (
            <div key={statement.id} className="flex gap-3">
              <Avatar className="w-8 h-8">
                {speaker?.id && (
                  <Image
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/MP/${speaker.id}.jpeg`}
                    width={32}
                    height={32}
                    alt={statement.speaker_name}
                    className="object-cover"
                  />
                )}
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{statement.speaker_name}</span>
                  <span className="text-gray-500 text-sm">
                    ({speaker?.club || "Brak klubu"})
                  </span>

                  <TooltipProvider>
                    <div className="flex gap-1">
                      {Object.entries(
                        statement.statement_ai?.speaker_rating || {}
                      )
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

                {statement.statement_ai?.summary_tldr && (
                  <p className="mt-1">{statement.statement_ai.summary_tldr}</p>
                )}

                {/* Citations */}
                {Array.isArray(statement.statement_ai?.citations) &&
                  statement.statement_ai.citations.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {statement.statement_ai.citations.map(
                        (citation, index) => (
                          <blockquote
                            key={index}
                            className="border-l-2 border-primary/30 pl-3 text-sm italic text-muted-foreground"
                          >
                            {citation}
                          </blockquote>
                        )
                      )}
                    </div>
                  )}

                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-1 text-gray-500 hover:text-gray-700">
                      <MessageSquare className="w-4 h-4" />
                      <span>Odpowiedz</span>
                    </button>
                  </div>
                  <Link
                    href={`https://sejm.gov.pl/proceedings/${proceedingNumber}/${proceedingDate}/transcripts/${statement.number_source}`}
                    target="_blank"
                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    całość <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>

                {statement.statement_ai?.yt_sec && (
                  <div className="mt-2">
                    <Button variant="outline" size="sm">
                      Zobacz wideo
                    </Button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add load all button */}
      {!showAll && sortedStatements.length > 3 && (
        <div className="flex justify-center pt-4">
          <Button
            variant="ghost"
            onClick={() => setShowAll(true)}
            className="w-full"
          >
            Pokaż wszystkie ({sortedStatements.length - 3} pozostało)
          </Button>
        </div>
      )}
    </div>
  );
}
