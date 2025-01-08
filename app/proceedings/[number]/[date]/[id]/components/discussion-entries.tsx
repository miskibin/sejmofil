"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

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
  initialMode = "normal",
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
    <div className="space-y-6">
      <div className="flex justify-end gap-2">
        <select
          value={filterMode}
          onChange={(e) => handleModeChange(e.target.value as FilterMode)}
          className="px-3 py-1 border rounded-md text-sm"
        >
          <option value="normal">Chronologicznie</option>
          <option value="featured">Wyróżnione wypowiedzi</option>
          <option value="all">Wszystkie wypowiedzi</option>
        </select>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {sortedStatements.map((statement) => {
          const speaker = getSpeakerInfo(statement.speaker_name);
          const isFeatured =
            (statement.statement_ai?.speaker_rating?.emotions ?? 0) >= 4 ||
            (statement.statement_ai?.speaker_rating?.manipulation ?? 0) >= 4;

          return (
            <div
              key={statement.id}
              className={`p-3 sm:p-4 rounded-lg space-y-2 sm:space-y-3 ${
                isFeatured && filterMode === "featured"
                  ? "bg-primary/5 border border-primary/20"
                  : "bg-gray-50"
              }`}
            >
              <div className="flex gap-4">
                <div className="w-12 h-16 relative flex-shrink-0">
                  <Image
                    src={
                      speaker?.id
                        ? `${
                            process.env.NEXT_PUBLIC_API_BASE_URL ||
                            "https://api.sejm.gov.pl/sejm/term10"
                          }/MP/${speaker.id}/photo`
                        : "/placeholder.svg"
                    }
                    alt={statement.speaker_name}
                    fill
                    sizes="40px"
                    className="rounded-lg object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <h3 className="font-semibold text-primary">
                      {speaker?.id ? (
                        <Link
                          href={`/envoys/${speaker.id}`}
                          className="hover:underline"
                        >
                          {statement.speaker_name} ({speaker.club})
                        </Link>
                      ) : (
                        statement.speaker_name
                      )}
                    </h3>
                    {statement.statement_ai?.speaker_rating && (
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        {["manipulation", "facts", "logic", "emotions"].map(
                          (key) =>
                            statement.statement_ai?.speaker_rating?.[key] && (
                              <Badge
                                key={key}
                                variant="secondary"
                                className="text-xs"
                                title={key}
                              >
                                {key === "manipulation" && "Manipulacja"}
                                {key === "facts" && "Fakty"}
                                {key === "logic" && "Logika"}
                                {key === "emotions" && "Emocje"}:{" "}
                                {statement.statement_ai.speaker_rating[key]} / 5
                              </Badge>
                            )
                        )}
                      </div>
                    )}
                  </div>

                  {statement.statement_ai?.summary_tldr && (
                    <p className="text-sm text-gray-600">
                      {statement.statement_ai.summary_tldr}
                    </p>
                  )}

                  {statement.statement_ai?.citations && (
                    <div className="space-y-2">
                      {statement.statement_ai.citations.map((citation, idx) => (
                        <blockquote
                          key={idx}
                          className="border-l-2 border-primary/30 pl-3 italic text-sm text-gray-600"
                        >
                          {citation}
                        </blockquote>
                      ))}
                      <Link
                        className="text-sm text-primary hover:underline my-2"
                        href={`${process.env.NEXT_PUBLIC_API_BASE_URL}/proceedings/${proceedingNumber}/${proceedingDate}/transcripts/${statement.number_source}`}
                        target="_blank"
                      >
                        całość wypowiedzi{" "}
                        <ExternalLink className="h-4 w-4 inline" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
