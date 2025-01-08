"use client";

import { VotingResult } from "@/lib/api/sejm";
import { VotingResultsChart } from "../components/voting-results-chart";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-2xl max-h-[90vh] p-4 rounded-lg sm:p-6">
        <ScrollArea className="h-full">
          <DialogHeader className="space-y-4">
            <DialogTitle className="text-lg sm:text-xl text-start leading-tight">
              {voting.topic}
            </DialogTitle>
            <div className="flex flex-wrap gap-2">
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
          </DialogHeader>
          <div className="mt-4 min-h-[300px] sm:min-h-[400px]">
            <VotingResultsChart data={processVotingData()} />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
