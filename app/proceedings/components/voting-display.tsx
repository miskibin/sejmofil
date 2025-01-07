import { Vote, ThumbsUp, ThumbsDown } from "lucide-react";
import { VotingResult } from "../types";

export function VotingDisplay({ voting }: { voting: VotingResult }) {
  const yesVotes = voting.votes.filter(
    (v: { vote: string }) => v.vote === "YES"
  ).length;
  const noVotes = voting.votes.filter(
    (v: { vote: string }) => v.vote === "NO"
  ).length;

  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      <Vote className="h-3 w-3 flex-shrink-0" />
      <span className="mr-1 truncate">{voting.topic}:</span>
      <span className="flex items-center gap-1 flex-shrink-0">
        {yesVotes} <ThumbsUp className="h-3 w-3 text-success" />- {noVotes}{" "}
        <ThumbsDown className="h-3 w-3 text-destructive" />
      </span>
    </div>
  );
}
