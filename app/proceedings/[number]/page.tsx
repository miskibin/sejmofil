import { createClient } from "@/app/supabase/server";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { Calendar, Info, ListOrdered } from "lucide-react";
import { Proceeding } from "@/lib/types/proceeding";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { notFound } from "next/navigation";

async function getProceeding(number: string) {
  const supabase = await createClient();
  const { data: proceeding, error } = await supabase
    .from("proceedings")
    .select(
      `
      *,
      points:proceeding_points_ai(
        id,
        discussion_order,
        statement_concat_topic,
        statement_concat_description,
        proceeding_number
      )
    `
    )
    .eq("proceeding_number", number)
    .single();

  if (error) throw new Error("Failed to fetch proceeding");
  return proceeding as Proceeding;
}
export default async function ProceedingPage({
  params,
}: {
  params: Promise<{ number: string }>;
}) {
  const { number } = await params;
  const proceeding = await getProceeding(number);
  if (!number) notFound();
  return (
    <div className="container mx-auto py-8 px-4">
      {/* Proceeding Header */}
      <div className="mb-8 bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <div className="flex items-center gap-2 text-gray-500 mb-2">
          <Calendar className="h-4 w-4" />
          <time>
            {proceeding.dates?.length > 0
              ? proceeding.dates
                  .map((date: string) =>
                    format(new Date(date), "d MMMM yyyy", { locale: pl })
                  )
                  .join(", ")
              : "Brak daty"}
          </time>
        </div>
        <h1 className="text-3xl font-bold mb-2">
          Posiedzenie {proceeding.proceeding_number}
        </h1>
        <h2 className="text-xl text-gray-600 mb-4">{proceeding.title}</h2>
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Info className="h-4 w-4" />
          <span>Kadencja: {proceeding.term}</span>
        </div>
      </div>

      {/* Points List */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <ListOrdered className="h-6 w-6" />
          Punkty posiedzenia
        </h2>
        <div className="space-y-4">
          {proceeding.points.map((point) => (
            <Link
              key={point.id}
              href={`/proceedings/${proceeding.proceeding_number}/points/${point.discussion_order}`}
            >
              <Card className="hover:shadow-md transition-shadow  my-8">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      Punkt {point.discussion_order}
                    </Badge>
                    <h3 className="font-semibold">
                      {point.statement_concat_topic}
                    </h3>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    {point.statement_concat_description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
