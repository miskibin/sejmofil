import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: number;
  category: string;
}

export default function StatCard({ title, value, category }: StatCardProps) {
  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-sm text-primary">{category}</CardTitle>
        <h2 className="text-2xl font-semibold">{title}</h2>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between md:px-3 xl:px-4">
        <p className="text-4xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
