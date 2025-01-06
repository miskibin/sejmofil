import { Metadata } from "next";
import { getProceedings } from "@/lib/supabase/queries";
import { CardWrapper } from "@/components/ui/card-wrapper";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SearchBox } from "./search";

export const metadata: Metadata = {
  title: "Posiedzenia Sejmu | Sejmofil",
  description: "Lista posiedzeń Sejmu X kadencji",
};

export default async function ProceedingsPage({
  searchParams,
}: {
  searchParams?: { query?: string };
}) {
  const proceedings = await getProceedings();
  const query = searchParams?.query?.toLowerCase();

  // Filter proceedings if search query exists
  const filteredProceedings = proceedings
    .map((proceeding) => ({
      ...proceeding,
      proceeding_day: proceeding.proceeding_day
        .map((day) => ({
          ...day,
          proceeding_point_ai: day.proceeding_point_ai.filter(
            (point) => !query || point.topic.toLowerCase().includes(query)
          ),
        }))
        .filter((day) => day.proceeding_point_ai.length > 0),
    }))
    .filter((proc) => proc.proceeding_day.length > 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SearchBox />
      </div>
      <div className="grid gap-6">
        {filteredProceedings.map((proceeding) => (
          <CardWrapper
            key={proceeding.id}
            title={`Posiedzenie ${proceeding.number}`}
            subtitle={proceeding.title}
            headerIcon={<CalendarDays className="h-5 w-5 text-primary" />}
          >
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {proceeding.dates.map((date) => (
                  <Badge key={date} variant="outline">
                    {new Date(date).toLocaleDateString("pl-PL")}
                  </Badge>
                ))}
              </div>

              <Accordion type="single" collapsible>
                {proceeding.proceeding_day.map((day) => (
                  <AccordionItem key={day.id} value={`day-${day.id}`}>
                    <AccordionTrigger className="text-sm">
                      Dzień {new Date(day.date).toLocaleDateString("pl-PL")}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 pl-4">
                        {day.proceeding_point_ai?.map((point) => (
                          <Link
                            key={point.id}
                            href={`/proceedings/${proceeding.number}/${day.date}/${point.id}`}
                            className="block hover:underline text-sm text-muted-foreground hover:text-primary"
                          >
                            {point.topic.split(" | ")[1] || point.topic}
                          </Link>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </CardWrapper>
        ))}
      </div>
    </div>
  );
}
