"use client";

import Link from "next/link";
import { Vote, MessageSquare } from "lucide-react";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";

interface PointCardProps {
  point: {
    id: number;
    topic: string;
    summary_tldr?: string;
    voting_numbers?: number[];
    statements: Array<unknown>;
  };
  proceedingNumber: number;
  date: string;
  dayNumber: number;
  pointIndex: number;
  size?: "small" | "medium" | "large";
}

export const PointCard = ({
  point,
  proceedingNumber,
  date,
  dayNumber,
  pointIndex,
  size = "medium",
}: PointCardProps) => {
  const imageIndex = pointIndex % 9;
  const imageUrl = `https://db.msulawiak.pl/storage/v1/object/public/${proceedingNumber}_${dayNumber}/image${imageIndex}.jpg`;
  const hasVotes = point.voting_numbers && point.voting_numbers.length > 0;

  return (
    <Link
      href={`/proceedings/${proceedingNumber}/${date}/${point.id}`}
      className="block group relative w-full"
    >
      <div
        className={`relative rounded-xl overflow-hidden shadow-lg transition-all duration-300 group-hover:shadow-xl
      ${
        size === "large"
          ? "h-[590px]"
          : size === "medium"
          ? "h-[280px]"
          : "h-[200px]"
      }
    `}
      >
        <ImageWithFallback
          src={imageUrl}
          alt={point.topic}
          fallbackSrc="/default.jpg"
          fill
          className="object-cover   blur-[2px] group-hover:blur-0 transition-all duration-500 group-hover:scale-110"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent 
      
      transition-all duration-300"
        />

        <div className="absolute inset-0 p-5 flex flex-col justify-end">
          <div className="space-y-3">
            <div className="flex gap-2 items-center">
              <span className="bg-white/10 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs flex items-center gap-1.5 transition-colors group-hover:bg-primary/30">
                <MessageSquare className="h-3.5 w-3.5" />
                {point.statements.length}
              </span>
              {hasVotes && (
                <span className="bg-white/10 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs flex items-center gap-1.5 transition-colors group-hover:bg-primary/30">
                  <Vote className="h-3.5 w-3.5" />
                  {point.voting_numbers?.length}
                </span>
              )}
            </div>

            <h3
              className={`text-white font-semibold leading-tight tracking-tight group-hover:text-primary-foreground transition-colors
          ${
            size === "large"
              ? "text-2xl"
              : size === "medium"
              ? "text-lg"
              : "text-base"
          }
        `}
            >
              {point.topic.split(" | ")[1] || point.topic}
            </h3>

            {point.summary_tldr && (
              <div className="space-y-2">
                <p
                  className={`text-white/80 line-clamp-2 group-hover:text-white/90 transition-colors
            ${size === "large" ? "text-base" : "text-sm"}
            `}
                >
                  {point.summary_tldr}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};
