"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

type FilterMode = "featured" | "all" | "normal";

interface Statement {
  id: number;
  speaker_name: string;
  number_source: number;
  statement_ai?: {
    summary_tldr?: string;
    citations?: string[];
    speaker_rating?: Record<string, number>;
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

  return (
    <div className="space-y-4 mb-4">
      <div className="flex justify-between items-center pb-4 border-b">
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <span className="font-medium">
            {filterMode === "featured"
              ? "Wyróżnione wypowiedzi"
              : "Wszystkie wypowiedzi"}
          </span>
          <span className="text-muted-foreground">
            ({filteredStatements.length} z {statements.length})
          </span>
        </div>
        <select
          value={filterMode}
          onChange={(e) => handleModeChange(e.target.value as FilterMode)}
          className="text-sm border rounded-md px-2 py-1 bg-transparent transition-colors"
        >
          <option value="featured">Najciekawsze</option>
          <option value="normal">Chronologicznie</option>
          <option value="all">Wszystkie</option>
        </select>
      </div>

      <div className="space-y-6 mb-4">
        {sortedStatements.map((statement) => {
          const speaker = getSpeakerInfo(statement.speaker_name);
          const isFeatured =
            (statement.statement_ai?.speaker_rating?.emotions ?? 0) >= 4 ||
            (statement.statement_ai?.speaker_rating?.manipulation ?? 0) >= 4;

          return (
            <div
              key={statement.id}
              className={cn(
                "flex gap-3 p-3 rounded-lg transition-colors",
                isFeatured &&
                  filterMode === "featured" &&
                  "bg-primary/5 border border-primary/20",
                !isFeatured && filterMode === "featured" && "opacity-75"
              )}
            >
              {/* Avatar */}
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

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Header */}
                <div className="flex flex-wrap items-start gap-x-2 gap-y-1 mb-1">
                  <Link
                    href={speaker?.id ? `/envoys/${speaker.id}` : "#"}
                    className="text-sm font-medium hover:underline"
                  >
                    {statement.speaker_name}
                  </Link>
                  <span className="text-xs text-muted-foreground">
                    ({speaker?.club || "Brak klubu"})
                  </span>
                </div>

                {/* Main content */}
                {statement.statement_ai?.summary_tldr && (
                  <p className="text-sm text-foreground/90 mb-2">
                    {statement.statement_ai.summary_tldr}
                  </p>
                )}

                {/* Metrics */}
                {statement.statement_ai?.speaker_rating && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {Object.entries(statement.statement_ai.speaker_rating)
                      .filter(([, value]) => value >= 4)
                      .map(([key, value]) => (
                        <Badge
                          key={key}
                          variant="secondary"
                          className="text-xs px-2"
                        >
                          {key === "manipulation" && "Manipulacja"}
                          {key === "facts" && "Fakty"}
                          {key === "logic" && "Logika"}
                          {key === "emotions" && "Emocje"} {value}/5
                        </Badge>
                      ))}
                  </div>
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
    </div>
  );
}
