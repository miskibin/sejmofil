import { CardWrapper } from "@/components/ui/card-wrapper";
import { Check, Vote } from "lucide-react";

interface Vote {
  title: string;
  amendment: string;
  status: "positive" | "negative";
}

export default function RecentVotes() {
  const votes: Vote[] = [
    {
      title:
        "Ustawa o zadość uczynieniu poszkodowanym w wyniku wypadku samochodowego",
      amendment: "Poprawka 4",
      status: "positive",
    },
    {
      title: "Ustawa o dostępnej pigułce na ból głowy na życzenie",
      amendment: "Poprawka 4",
      status: "negative",
    },
    {
      title: "Ustawa o ochronie praw zwierząt w schroniskach",
      amendment: "Poprawka 7",
      status: "positive",
    },
    {
      title: "Ustawa o zwiększeniu dostępności opieki zdrowotnej",
      amendment: "Poprawka 7",
      status: "negative",
    },
    {
      title: "Ustawa o wsparciu edukacji publicznej",
      amendment: "Poprawka 7",
      status: "positive",
    },
  ];

  return (
    <CardWrapper
      title="Newsy"
      subtitle="Ostatnie głosowania"
    >
      <div className="space-y-5 py-4">
        {votes.map((vote, index) => (
          <div key={index} className="space-y-1">
            <div className="flex gap-3 items-start">
              <div
              className={`min-w-9 min-h-9 w-9 h-9 rounded-lg flex items-center justify-center ${
                vote.status === "positive"
                ? "bg-[hsl(var(--success))] text-white"
                : "bg-primary text-white"
              }`}
              >
              {vote.status === "positive" ? (
                <Check className="w-6 h-6" />
              ) : (
                <Check className="w-6 h-8" />
              )}
              </div>
              <div className="space-y-1 flex-1">
                <p className="text-xl  font-normal leading-tight">{vote.title}</p>
                <p className="text-sm text-muted-foreground">{vote.amendment}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </CardWrapper>
  );
}
