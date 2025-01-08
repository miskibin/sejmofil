"use client";

import { useState } from "react";
import { VotingDisplay } from "@/app/proceedings/components/voting-display";
import { VotingResult as SimpleVoting } from "@/lib/queries/proceeding";
import { VotingResult as DetailedVoting } from "@/lib/api/sejm";
import { getVotingDetails } from "@/lib/api/sejm";
import { CardWrapper } from "@/components/ui/card-wrapper";
import { EmptyState } from "@/components/empty-state";

interface Props {
  votings: SimpleVoting[];
  proceedingNumber: number;
}

export function VotingList({ votings, proceedingNumber }: Props) {
  const [detailedVotings, setDetailedVotings] = useState<
    Record<number, DetailedVoting>
  >({});

  const handleVotingClick = async (votingNumber: number) => {
    if (!detailedVotings[votingNumber]) {
      const details = await getVotingDetails(proceedingNumber, votingNumber);
      setDetailedVotings((prev) => ({
        ...prev,
        [votingNumber]: details,
      }));
    }
  };

  return (
    <CardWrapper
      title="Głosowania"
      className="h-full"
      subtitle="Wyniki głosowań"
    >
      {votings.length === 0 ? (
      <EmptyState image="/empty.svg" />
      ) : (
      <div className="max-h-96 overflow-y-auto overflow-x-hidden">
        <div className="space-y-2">
        {votings.map((voting) => (
          <VotingDisplay
          key={voting.votingNumber}
          voting={detailedVotings[voting.votingNumber] || voting}
          isDetailed={!!detailedVotings[voting.votingNumber]}
          onLoadDetails={() => handleVotingClick(voting.votingNumber)}
          />
        ))}
        </div>
      </div>
      )}
    </CardWrapper>
  );
}
