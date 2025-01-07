import { Metadata } from "next";
import { getProceedings } from "@/lib/supabase/queries";
import { ProceedingsList } from "./proceedings-list";
import { getVotingDetails, VotingResult } from "@/lib/api/sejm";
import { ProceedingPoint } from "./types";

export const metadata: Metadata = {
  title: "Posiedzenia Sejmu | Sejmofil",
  description: "Lista posiedzeń Sejmu X kadencji",
};

export default async function ProceedingsPage() {
  const proceedings = await getProceedings();

  // Fetch voting data for all proceedings
  const proceedingsWithVotings = await Promise.all(
    proceedings.map(async (proceeding) => {
      const days = await Promise.all(
        proceeding.proceeding_day.map(async (day) => {
          const points = await Promise.all(
            day.proceeding_point_ai.map(async (point) => {
              if (!point.voting_numbers?.length) {
                return {
                  ...point,
                  votingResults: [] as VotingResult[],
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

  return <ProceedingsList proceedings={proceedingsWithVotings} />;
}
