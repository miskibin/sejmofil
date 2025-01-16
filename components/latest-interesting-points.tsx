import { getProceedingDetails } from "@/lib/supabase/queries";
import { sortPointsByImportance, truncateText } from "@/lib/utils";
import Link from "next/link";
import { CardWrapper } from "./ui/card-wrapper";
import { Sparkles } from "lucide-react";

async function getLatestPoints() {
  const proceeding = await getProceedingDetails(26); // Latest proceeding number
  const points = proceeding.proceeding_day.flatMap((day, dayIndex) =>
    day.proceeding_point_ai.map((point) => ({
      ...point,
      date: day.date,
      dayNumber: dayIndex + 1,
      pointIndex: point.id % 9,
      proceedingNumber: proceeding.number,
    }))
  );
  return sortPointsByImportance(points).slice(0, 2);
}

export default async function LatestInterestingPoints() {
  const points = await getLatestPoints();

  return (
    <>
      {points.map((point) => {
        const imageUrl = `https://db.msulawiak.pl/storage/v1/object/public/${point.proceedingNumber}_${point.dayNumber}/image${point.pointIndex}.jpg`;

        return (
          <Link
            key={point.id}
            href={`/proceedings/${point.proceedingNumber}/${point.date}/${point.id}`}
            className="block group relative w-full"
          >
            <CardWrapper
              className="h-full"
              subtitle={point.topic.split("|")[0]}
              title={point.topic.split("|")[1]}
              showGradient={false}
              headerIcon={
                <Sparkles className="w-4 h-4 m-1 text-white" fill="white" />
              }
              imageSrc={imageUrl}
            >
              <p className="text-sm text-gray-500">
                {truncateText(point.summary_tldr, 200)}
              </p>
            </CardWrapper>
          </Link>
        );
      })}
    </>
  );
}
