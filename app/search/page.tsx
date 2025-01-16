import { searchPrints } from "@/lib/queries/print";
import { searchPersons } from "@/lib/queries/person";
import { PrintCard } from "@/components/print-card";
import { EnvoyCard } from "@/components/envoy-card";
import { searchPoints } from "@/lib/supabase/queries";
import { PointCard } from "@/components/point-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users2, FileText, Calendar } from "lucide-react";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q: string }>;
}) {
  const { q: query } = await searchParams;

  if (!query) {
    return (
      <div className="container mx-auto mt-20 px-4">
        <h1 className="text-2xl font-bold mb-4">Wyszukiwarka</h1>
        <p>Wprowadź tekst aby wyszukać druki sejmowe lub posłów.</p>
      </div>
    );
  }

  const [prints, persons, points] = await Promise.all([
    searchPrints(query),
    searchPersons(query),
    searchPoints(query),
  ]);

  const hasResults =
    prints.length > 0 || persons.length > 0 || points.length > 0;

  if (!hasResults) {
    return (
      <div className="container mx-auto mt-20 px-4">
        <h1 className="text-2xl font-bold mb-4">
          Wyniki wyszukiwania dla: {query}
        </h1>
        <p>Nie znaleziono wyników dla podanego zapytania.</p>
      </div>
    );
  }

  const defaultTab =
    points.length > 0 ? "points" : persons.length > 0 ? "persons" : "prints";

  return (
    <div className="container mx-auto mt-20 px-4">
      <h1 className="text-2xl font-bold mb-8">
        Wyniki wyszukiwania dla: {query}
      </h1>

      <Tabs defaultValue={defaultTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger
            value="points"
            disabled={points.length === 0}
            className="flex gap-2"
          >
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Punkty</span>
            <span className="text-xs">{points.length}</span>
          </TabsTrigger>
          <TabsTrigger
            value="persons"
            disabled={persons.length === 0}
            className="flex gap-2"
          >
            <Users2 className="h-4 w-4" />
            <span className="hidden sm:inline">Posłowie</span>
            <span className="text-xs">{persons.length}</span>
          </TabsTrigger>
          <TabsTrigger
            value="prints"
            disabled={prints.length === 0}
            className="flex gap-2"
          >
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Druki</span>
            <span className="text-xs">{prints.length}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="points" className="space-y-4">
          {points.map((point) => (
            <PointCard
              key={point.id}
              point={point}
              proceedingNumber={point.proceeding_day.proceeding.number}
              date={point.proceeding_day.date}
              searchQuery={query}
            />
          ))}
        </TabsContent>

        <TabsContent
          value="persons"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {persons.map((person) => (
            <EnvoyCard key={person.id} envoy={person} />
          ))}
        </TabsContent>

        <TabsContent value="prints" className="space-y-4">
          {prints.map((print) => (
            <PrintCard key={print.number} print={print} searchQuery={query} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
