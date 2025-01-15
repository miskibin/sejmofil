"use client";

import { useState } from "react";
import { VotingDisplay } from "@/app/proceedings/components/voting-display";
import { VotingResult as SimpleVoting } from "@/lib/queries/proceeding";
import { VotingResult as DetailedVoting } from "@/lib/api/sejm";
import { getVotingDetails } from "@/lib/api/sejm";
import { EmptyState } from "@/components/empty-state";

interface Props {
  votings: SimpleVoting[];
}

export function VotingList({ votings }: Props) {
  const [detailedVotings, setDetailedVotings] = useState<
    Record<number, DetailedVoting>
  >({});

  const sortVotings = (votings: SimpleVoting[]) => {
    return [...votings].sort((a, b) => {
      const getWeight = (topic: string) => {
        if (topic.toLowerCase().includes("całością projektu")) return 2;
        if (
          topic.toLowerCase().includes("poprawk") ||
          topic.toLowerCase().includes("wniosek mniejszości") ||
          topic.toLowerCase().includes("wnioski mniejszości")
        )
          return 0;
        return 1;
      };
      return getWeight(b.topic) - getWeight(a.topic);
    });
  };

  const handleVotingClick = async (
    votingNumber: number,
    proceedingNumber: number
  ) => {
    if (!detailedVotings[votingNumber]) {
      const details = await getVotingDetails(proceedingNumber, votingNumber);
      setDetailedVotings((prev) => ({
        ...prev,
        [votingNumber]: details,
      }));
    }
  };

  if (votings.length === 0) return <EmptyState image="/empty.svg" />;

  const sortedVotings = sortVotings(votings);

  return (
    <div className="max-h-[600px] overflow-y-auto overflow-x-hidden">
      <div className="space-y-2">
        {sortedVotings.map((voting, idx) => (
          <VotingDisplay
            key={`${voting.votingNumber}-${idx}`}
            voting={detailedVotings[voting.votingNumber] || voting}
            isDetailed={!!detailedVotings[voting.votingNumber]}
            onLoadDetails={() =>
              handleVotingClick(voting.votingNumber, voting.sitting)
            }
          />
        ))}
      </div>
    </div>
  );
}
