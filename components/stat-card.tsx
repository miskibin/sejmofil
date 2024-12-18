import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: number;
  category: string;
}

export default function StatCard({ title, value, category }: StatCardProps) {
  return (
    <Card className="w-full h-full">
      <CardHeader>
        <span className="text-sm text-[#8B1538]">{category}</span>
        <CardTitle className="text-2xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-4xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
