import { Vote, ThumbsUp, ThumbsDown } from "lucide-react";
import { VotingResult } from "../types";

export function VotingDisplay({ voting }: { voting: VotingResult }) {
  const yesVotes = voting.votes.filter((v) => v.vote === "YES").length;
  const noVotes = voting.votes.filter((v) => v.vote === "NO").length;

  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      <Vote className="h-3 w-3 flex-shrink-0" />
      <span className="mr-1 truncate">{voting.topic}:</span>
      <span className="flex items-center gap-1 flex-shrink-0">
        <span>{yesVotes}</span>
        <ThumbsUp className="h-3 w-3 text-success" />
        <span>-</span>
        <span>{noVotes}</span>
        <ThumbsDown className="h-3 w-3 text-destructive" />
      </span>
    </div>
  );
}
