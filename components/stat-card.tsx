import { CardWrapper } from "@/components/ui/card-wrapper";

interface StatCardProps {
  title: string;
  value: number;
  category: string;
}

export default function StatCard({ title, value, category }: StatCardProps) {
  return (
    <CardWrapper
      title={category}
      subtitle={title}
      showDate={false}
      showGradient={false}
    >
      <p className="text-4xl font-bold">{value}</p>
    </CardWrapper>
  );
}
