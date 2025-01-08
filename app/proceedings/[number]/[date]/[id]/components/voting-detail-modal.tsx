"use client";

import { VotingResult } from "@/lib/api/sejm";
import { VotingResultsChart } from "../components/voting-results-chart";
import {
  Credenza,
  CredenzaContent,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaBody,
} from "@/components/ui/credenza";
import { Badge } from "@/components/ui/badge";

interface Props {
  voting: VotingResult;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VotingDetailModal({ voting, open, onOpenChange }: Props) {
  const processVotingData = () => {
    const clubVotes = voting.votes.reduce((acc, vote) => {
      if (!acc[vote.club]) {
        acc[vote.club] = { club: vote.club, yes: 0, no: 0, abstain: 0 };
      }
      if (vote.vote === "YES") acc[vote.club].yes++;
      if (vote.vote === "NO") acc[vote.club].no++;
      if (vote.vote === "ABSTAIN") acc[vote.club].abstain++;
      return acc;
    }, {} as Record<string, { club: string; yes: number; no: number; abstain: number }>);

    return Object.values(clubVotes);
  };

  return (
    <Credenza open={open} onOpenChange={onOpenChange}>
      <CredenzaContent className="max-w-[98vw] sm:max-w-2xl  p-4 rounded-lg sm:p-6">
        <CredenzaHeader className="space-y-4 text-wrap">
          <CredenzaTitle className="text-lg sm:text-xltext-start leading-tight">
            {voting.topic}
          </CredenzaTitle>
          <div className="flex flex-wrap max-w-[98vw] gap-2">
            <Badge variant="outline" className="text-xs sm:text-sm">
              Głosowało: {voting.totalVoted}
            </Badge>
            <Badge variant="outline" className="text-xs sm:text-sm">
              Nie głosowało: {voting.notParticipating}
            </Badge>
            <Badge
              variant={voting.yes > voting.no ? "default" : "destructive"}
              className="text-xs sm:text-sm"
            >
              {voting.yes > voting.no ? "Przyjęto" : "Odrzucono"}
            </Badge>
          </div>
        </CredenzaHeader>
        <CredenzaBody>
          <div className="mt-4 min-h-[300px] sm:min-h-[400px]">
            <VotingResultsChart data={processVotingData()} />
          </div>
        </CredenzaBody>
      </CredenzaContent>
    </Credenza>
  );
}
