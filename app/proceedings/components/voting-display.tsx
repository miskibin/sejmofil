import { Vote, ThumbsUp, ThumbsDown } from "lucide-react";
import { VotingResult as SimpleVoting } from "@/lib/queries/proceeding";
import { VotingResult as DetailedVoting } from "@/lib/api/sejm";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { VotingDetailModal } from "../[number]/[date]/[id]/components/voting-detail-modal";

type VotingProps = {
  voting: SimpleVoting | DetailedVoting;
  isDetailed?: boolean;
  onLoadDetails?: () => void;
};

type VotingImportance = "high" | "low" | "normal";

export function VotingDisplay({
  voting,
  isDetailed,
  onLoadDetails,
}: VotingProps) {
  const [showModal, setShowModal] = useState(false);

  const getImportance = (topic: string): VotingImportance => {
    if (topic.toLowerCase().includes("całością projektu")) return "high";
    if (
      topic.toLowerCase().includes("poprawk") ||
      topic.toLowerCase().includes("wniosek mniejszości") ||
      topic.toLowerCase().includes("wnioski mniejszości")
    )
      return "low";
    return "normal";
  };

  const importance = getImportance(voting.topic);

  const yesVotes = isDetailed
    ? (voting as DetailedVoting).votes.filter((v) => v.vote === "YES").length
    : (voting as SimpleVoting).yes;

  const noVotes = isDetailed
    ? (voting as DetailedVoting).votes.filter((v) => v.vote === "NO").length
    : (voting as SimpleVoting).no;

  const buttonStyles = {
    high: "bg-blue-50 hover:bg-blue-100 font-medium",
    low: "opacity-60",
    normal: "",
  };

  const handleClick = async () => {
    await onLoadDetails?.();
    setShowModal(true);
  };

  return (
    <>
      <Button
        variant="ghost"
        className={`w-full justify-start ${buttonStyles[importance]}`}
        onClick={handleClick}
      >
        <div className="flex w-full items-center gap-1 text-xs text-muted-foreground">
          <Vote
            className={`h-3 w-3 flex-shrink-0 ${
              importance === "high" ? "text-blue-500" : ""
            }`}
          />
          <span className="truncate mr-1">{voting.topic}</span>
          <span className="flex items-center gap-1 flex-shrink-0 ml-auto">
            <ThumbsUp className="h-3 w-3 text-success" />
            {yesVotes} - {noVotes}{" "}
            <ThumbsDown className="h-3 w-3 text-destructive" />
          </span>
        </div>
      </Button>

      {isDetailed && (
        <VotingDetailModal
          voting={voting as DetailedVoting}
          open={showModal}
          onOpenChange={setShowModal}
        />
      )}
    </>
  );
}
