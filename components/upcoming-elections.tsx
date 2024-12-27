import { CardWrapper } from "@/components/ui/card-wrapper";

interface Election {
  type: string;
  date: string;
  active?: boolean;
}

export default function UpcomingElections() {
  const elections: Election[] = [
    {
      type: "Prezydenckie",
      date: "14 Maja 2024",
      active: true,
    },
    {
      type: "Samorządowe",
      date: "około 2027 roku",
    },
    {
      type: "Europejskie",
      date: "około 2028 roku",
    },

  ];

  return (
    <CardWrapper 
      title="wybory"
      subtitle="Nadchodzące wybory"
      showDate={false}
      showGradient={false}
    >
      <div className="relative space-y-8">
        {/* Vertical line */}
        <div className="absolute left-[6px] top-3 bottom-3 w-[2px] bg-primary" />

        {elections.map((election, index) => (
          <div
            key={index}
            className="flex justify-between items-center relative pl-8"
          >
            {/* Timeline dot */}
            <div
              className={`absolute left-0 w-3.5 h-3.5 rounded-full border-2 ${
                election.active
                  ? "bg-primary border-primary"
                  : "bg-white border-primary"
              }`}
            />

            <span className="font-medium">
              {election.type}
            </span>
            <span>{election.date}</span>
          </div>
        ))}
      </div>
    </CardWrapper>
  );
}
