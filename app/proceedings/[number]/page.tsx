import { notFound } from "next/navigation";
import { getProceedingDetails } from "@/lib/supabase/queries";
import { Badge } from "@/components/ui/badge";
import { PointCard } from "./components/point-card";

export const dynamic = "force-dynamic";
export const revalidate = 3600; // Revalidate every hour

export default async function ProceedingPage({
  params,
}: {
  params: Promise<{ number: string }>;
}) {
  const { number } = await params;
  const proceeding = await getProceedingDetails(parseInt(number));
  if (!proceeding) notFound();

  // Calculate importance score for each point
  const points = proceeding.proceeding_day
    .flatMap((day, dayIndex) =>
      day.proceeding_point_ai.map((point, pointIndex) => ({
        ...point,
        date: day.date,
        dayNumber: dayIndex + 1,
        pointIndex,
        importance:
          (point.statements?.length || 0) +
          (point.voting_numbers?.length || 0) * 5,
      }))
    )
    .sort((a, b) => b.importance - a.importance);

  // Create sections of 7 cards each (1 large + 2 medium + 4 small)
  const sections = [];
  for (let i = 0; i < points.length; i += 7) {
    const section = {
      large: points[i],
      medium: points.slice(i + 1, i + 3),
      small: points.slice(i + 3, i + 7),
    };
    // Only add section if it has at least a large card
    if (section.large) {
      // Ensure medium and small arrays are always of correct length
      section.medium = section.medium.concat(
        Array(2 - section.medium.length).fill(null)
      );
      section.small = section.small.concat(
        Array(4 - section.small.length).fill(null)
      );
      sections.push(section);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{proceeding.title}</h1>
        <div className="flex flex-wrap gap-2">
          {proceeding.dates.map((date) => (
            <Badge key={date} variant="outline">
              {new Date(date).toLocaleDateString("pl-PL")}
            </Badge>
          ))}
        </div>
      </div>

      {/* Sections Grid */}
      <div className="space-y-12">
        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="space-y-6">
            {/* Large Featured Card */}
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 lg:col-span-8 h-full">
                <PointCard
                  point={section.large}
                  proceedingNumber={proceeding.number}
                  date={section.large.date}
                  dayNumber={section.large.dayNumber}
                  pointIndex={section.large.pointIndex}
                  size="large"
                />
              </div>

              {/* Medium Cards */}
              <div className="col-span-12 lg:col-span-4 grid grid-cols-1 gap-6">
                {section.medium.map(
                  (point, idx) =>
                    point && (
                      <div key={point?.id || `medium-${idx}`}>
                        <PointCard
                          point={point}
                          proceedingNumber={proceeding.number}
                          date={point?.date}
                          dayNumber={point?.dayNumber}
                          pointIndex={point?.pointIndex}
                          size="medium"
                        />
                      </div>
                    )
                )}
              </div>
            </div>

            {/* Small Cards */}
            <div className="grid grid-cols-12 gap-6">
              {section.small.map((point, idx) => (
                <div
                  key={point?.id || `small-${idx}`}
                  className="col-span-12 sm:col-span-6 lg:col-span-3"
                >
                  {point && (
                    <PointCard
                      point={point}
                      proceedingNumber={proceeding.number}
                      date={point.date}
                      dayNumber={point.dayNumber}
                      pointIndex={point.pointIndex}
                      size="small"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
