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

  return (
    <div className="max-h-[600px] overflow-y-auto overflow-x-hidden">
      <div className="space-y-2">
        {votings.map((voting, idx) => (
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
