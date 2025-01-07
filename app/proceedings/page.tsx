import { Metadata } from "next";
import { getProceedings } from "@/lib/supabase/queries";
import { CardWrapper } from "@/components/ui/card-wrapper";
import Link from "next/link";
import { CalendarDays, Timer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SearchBox } from "./search";
import { getVotingDetails } from "@/lib/api/sejm";
import { VotingDisplay } from "./components/voting-display";
import { ProceedingPoint, VotingResult } from "./types";

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

  const proceedingsWithVotings = await Promise.all(
    proceedings.map(async (proceeding) => {
      const days = await Promise.all(
        proceeding.proceeding_day.map(async (day) => {
          const points = await Promise.all(
            day.proceeding_point_ai
              .filter(
                (point) => !query || point.topic.toLowerCase().includes(query)
              )
              .map(async (point: ProceedingPoint) => {
                if (!point.voting_numbers?.length) {
                  return {
                    ...point,
                    votingResults: [],
                    breakVotingsCount: 0,
                  } as ProceedingPoint;
                }

                const votings = await Promise.all(
                  point.voting_numbers.map((num) =>
                    getVotingDetails(proceeding.number, num).catch(() => null)
                  )
                );

                const validVotings = votings.filter(
                  (v): v is NonNullable<typeof v> => v !== null
                );
                return {
                  ...point,
                  votingResults: validVotings.filter(
                    (v) => v.topic !== "Wniosek o przerwę"
                  ),
                  breakVotingsCount: validVotings.filter(
                    (v) => v.topic === "Wniosek o przerwę"
                  ).length,
                } as ProceedingPoint;
              })
          );
          return { ...day, proceeding_point_ai: points };
        })
      );
      return { ...proceeding, proceeding_day: days };
    })
  );

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <div className="mb-6">
        <SearchBox />
      </div>

      {proceedingsWithVotings.map((proceeding) => (
        <CardWrapper
          key={proceeding.number}
          title={proceeding.dates
            .map((date) => new Date(date).toLocaleDateString("pl-PL"))
            .join(", ")}
          subtitle={`Posiedzenie ${proceeding.number}`}
          showGradient={false}
        >
          <Accordion type="single" collapsible>
            {proceeding.proceeding_day.map((day) => (
              <AccordionItem key={day.id} value={`day-${day.id}`}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {new Date(day.date).toLocaleDateString("pl-PL")}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {day.proceeding_point_ai.some(
                        (p) => (p.votingResults?.length ?? 0) > 0
                      ) && (
                        <Badge variant="outline">
                          Głosowania (
                          {day.proceeding_point_ai.reduce(
                            (acc, p) => acc + (p.votingResults?.length || 0),
                            0
                          )}
                          )
                        </Badge>
                      )}
                      {day.proceeding_point_ai.some(
                        (p) => (p.breakVotingsCount ?? 0) > 0
                      ) && (
                        <Badge
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          <Timer className="h-3 w-3" />
                          <span>
                            Przerwy (
                            {day.proceeding_point_ai.reduce(
                              (acc, p) => acc + (p.breakVotingsCount || 0),
                              0
                            )}
                            )
                          </span>
                        </Badge>
                      )}
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className=" pt-2 pb-4">
                  <div className="space-y-3 ml-2 sm:ml-6 border-l">
                    {day.proceeding_point_ai?.map((point) => (
                      <div
                        key={point.id}
                        className="relative pl-2 sm:pl-6 border-l hover:border-primary"
                      >
                        <Link
                          href={`/proceedings/${proceeding.number}/${day.date}/${point.id}`}
                          className="block hover:text-primary"
                        >
                          <div className="text-sm font-medium break-words">
                            {point.topic.split(" | ")[1] || point.topic}
                          </div>
                          {(point.votingResults?.length ?? 0) > 0 && (
                            <div className="flex flex-col gap-2 mt-1">
                              {point.votingResults
                                ?.filter((v): v is VotingResult => v !== null)
                                .map((voting, idx) => (
                                  <VotingDisplay key={idx} voting={voting} />
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
