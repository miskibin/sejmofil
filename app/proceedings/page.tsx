import { Metadata } from "next";
import { getProceedings } from "@/lib/supabase/queries";
import { CardWrapper } from "@/components/ui/card-wrapper";
import Link from "next/link";
import { CalendarDays, Vote, ThumbsUp, ThumbsDown, Timer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SearchBox } from "./search";
import { getVotingDetails } from "@/lib/api/sejm";

export const metadata: Metadata = {
  title: "Posiedzenia Sejmu | Sejmofil",
  description: "Lista posiedzeń Sejmu X kadencji",
};
export default async function ProceedingsPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}) {
  const { query } = (await searchParams) || {};
  const proceedings = await getProceedings();

  // Process voting results for each point
  const proceedingsWithVotings = await Promise.all(
    proceedings.map(async (proceeding) => ({
      ...proceeding,
      proceeding_day: await Promise.all(
        proceeding.proceeding_day.map(async (day) => {
          const points = await Promise.all(
            day.proceeding_point_ai
              .filter(
                (point) => !query || point.topic.toLowerCase().includes(query)
              )
              .map(async (point) => {
                if (!point.voting_numbers?.length) {
                  return { ...point, votingResults: [], breakVotingsCount: 0 };
                }

                const votingResults = await Promise.all(
                  point.voting_numbers.map((num) =>
                    getVotingDetails(proceeding.number, num)
                      .then((result) => ({
                        ...result,
                        passed:
                          result.votes.filter((v) => v.vote === "YES").length >
                            result.votes.filter((v) => v.vote === "NO")
                              .length && result.totalVoted > 230,
                      }))
                      .catch(() => null)
                  )
                );

                const filtered = votingResults.filter(Boolean);
                const breakVotings = filtered.filter(
                  (v): v is NonNullable<typeof v> =>
                    v?.topic === "Wniosek o przerwę"
                );
                const regularVotings = filtered.filter(
                  (v): v is NonNullable<typeof v> =>
                    v?.topic !== "Wniosek o przerwę"
                );

                return {
                  ...point,
                  votingResults: regularVotings,
                  breakVotingsCount: breakVotings.length,
                };
              })
          );
          return { ...day, proceeding_point_ai: points };
        })
      ),
    }))
  );

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="mb-6">
        <SearchBox />
      </div>

      {proceedingsWithVotings.map((proceeding) => (
        <CardWrapper
          title={proceeding.dates
            .map((date) => new Date(date).toLocaleDateString("pl-PL"))
            .join(", ")}
          subtitle={`Posiedzenie ${proceeding.number}`}
          showGradient={false}
          key={proceeding.number}
        >
          <Accordion type="single" collapsible>
            {proceeding.proceeding_day.map((day) => (
              <AccordionItem key={day.id} value={`day-${day.id}`}>
                <AccordionTrigger className="px-4 hover:no-underline">
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {new Date(day.date).toLocaleDateString("pl-PL")}
                    </span>
                    {day.proceeding_point_ai.some(
                      (p) => p.votingResults?.length > 0
                    ) && (
                      <Badge variant="outline" className="ml-2">
                        Głosowania (
                        {day.proceeding_point_ai.reduce(
                          (acc, p) => acc + (p.votingResults?.length || 0),
                          0
                        )}
                        )
                      </Badge>
                    )}
                    {day.proceeding_point_ai.some(
                      (p) => p.breakVotingsCount > 0
                    ) && (
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        <Timer className="h-3 w-3" />
                        Wnioski o przerwę (
                        {day.proceeding_point_ai.reduce(
                          (acc, p) => acc + (p.breakVotingsCount || 0),
                          0
                        )}
                        )
                      </Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pt-2 pb-4">
                  <div className="space-y-3 ml-6 border-l">
                    {day.proceeding_point_ai?.map((point) => (
                      <div
                        key={point.id}
                        className="relative pl-4 -ml-px border-l hover:border-primary"
                      >
                        <Link
                          href={`/proceedings/${proceeding.number}/${day.date}/${point.id}`}
                          className="block hover:text-primary"
                        >
                          <div className="text-sm">
                            {point.topic.split(" | ")[1] || point.topic}
                          </div>

                          {(point.breakVotingsCount > 0 ||
                            point.votingResults?.length > 0) && (
                            <div className="flex flex-col gap-2 mt-1">
                              {point.votingResults?.map((voting, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-1 text-xs text-muted-foreground"
                                >
                                  <Vote className="h-3 w-3" />
                                  <span className="mr-1">{voting.topic}:</span>
                                  <span className=" flex items-center gap-1">
                                    <span>
                                      {
                                        voting.votes.filter(
                                          (v) => v.vote === "YES"
                                        ).length
                                      }
                                    </span>
                                    <ThumbsUp className="h-3 w-3 text-success" />
                                    <span>-</span>
                                    <span className="text-primary">
                                      {
                                        voting.votes.filter(
                                          (v) => v.vote === "NO"
                                        ).length
                                      }
                                    </span>
                                    <ThumbsDown className="h-3 w-3 text-primary" />
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </Link>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardWrapper>
      ))}
    </div>
  );
}
