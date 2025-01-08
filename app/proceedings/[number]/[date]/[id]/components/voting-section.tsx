import { CardWrapper } from "@/components/ui/card-wrapper";
import { Check, XCircle } from "lucide-react";
import { VotingResultsChart } from "./voting-results-chart";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { EmptyState } from "@/components/empty-state";

type VotingData = {
  topic: string;
  data: { club: string; yes: number; no: number; abstain: number }[];
  result: { passed: boolean; yes: number; no: number } | null;
};

export const VotingSection = ({ votingData }: { votingData: VotingData[] }) => {
  return (
    <CardWrapper
      title="Głosowania"
      subtitle={
        votingData.length ? `Głosowań: ${votingData.length}` : "Brak głosowań"
      }
      className="h-full"
    >
      {votingData.length === 0 ? (
        <EmptyState image="/empty.svg" />
      ) : (
        <Carousel className="w-[90%] mx-auto">
          <CarouselContent>
            {votingData.map((voting, index) => (
              <CarouselItem key={index}>
                <VotingItem voting={voting} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex justify-center gap-4 mt-4">
            <CarouselPrevious />
            <CarouselNext />
          </div>
        </Carousel>
      )}
    </CardWrapper>
  );
};

const VotingItem = ({ voting }: { voting: VotingData }) => (
  <div className="p-1">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        {voting.result?.passed ? (
          <Check className="h-5 w-5 text-success" />
        ) : (
          <XCircle className="h-5 w-5 text-destructive" />
        )}
        <h3 className="font-medium text-sm">{voting.topic}</h3>
      </div>
      <div className="text-sm text-muted-foreground">
        Za: {voting.result?.yes} Przeciw: {voting.result?.no}
      </div>
    </div>
    <VotingResultsChart data={voting.data} />
  </div>
);
