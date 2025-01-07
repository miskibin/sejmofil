import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

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
  speakerInfo: (name: string) => SpeakerInfo | undefined;
  proceedingNumber: number;
  proceedingDate: string;
}

export function DiscussionEntries({ 
  statements, 
  speakerInfo, 
  proceedingNumber,
  proceedingDate 
}: DiscussionEntriesProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      {statements.map((statement) => {
        const speaker = speakerInfo(statement.speaker_name);
        return (
          <div
            key={statement.id}
            className="p-3 sm:p-4 bg-gray-50 rounded-lg space-y-2 sm:space-y-3"
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
                        {statement.speaker_name}
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
                      całość wypowiedzi <ExternalLink className="h-4 w-4 inline" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
