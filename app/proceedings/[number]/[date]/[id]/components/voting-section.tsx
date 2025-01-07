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
import Image from "next/image";

type VotingData = {
  topic: string;
  data: { club: string; yes: number; no: number; abstain: number }[];
  result: { passed: boolean; yes: number; no: number } | null;
};

export const VotingSection = ({ votingData }: { votingData: VotingData[] }) => {
  if (!votingData.length) {
    return (
      <CardWrapper title="Głosowania" subtitle="Brak głosowań">
        <EmptyState image="/street.svg" text="Brak głosowań" />
      </CardWrapper>
    );
  }

  return (
    <CardWrapper
      title="Głosowania"
      subtitle={`Głosowań: ${votingData.length}`}
      className="h-full"
    >
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

const EmptyState = ({ image, text }: { image: string; text: string }) => (
  <div className="text-center pb-6">
    <div className="flex justify-center mb-4">
      <Image src={image} width={350} height={350} alt="Empty state" />
    </div>
    <p className="text-gray-500">{text}</p>
  </div>
);
