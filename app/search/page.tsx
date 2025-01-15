import { searchPrints } from "@/lib/queries/print";
import { searchPersons } from "@/lib/queries/person";
import { PrintCard } from "@/components/print-card";
import { EnvoyCard } from "@/components/envoy-card";

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

  const [prints, persons] = await Promise.all([
    searchPrints(query),
    searchPersons(query),
  ]);

  const hasResults = prints.length > 0 || persons.length > 0;

  return (
    <div className="container mx-auto mt-20 px-4">
      <h1 className="text-2xl font-bold mb-4">
        Wyniki wyszukiwania dla: {query}
      </h1>

      {!hasResults ? (
        <p>Nie znaleziono wyników dla podanego zapytania.</p>
      ) : (
        <div className="space-y-8">
          {persons.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4">Posłowie</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {persons.map((person) => (
                  <EnvoyCard key={person.id} envoy={person} />
                ))}
              </div>
            </section>
          )}

          {prints.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4">Druki sejmowe</h2>
              <div className="grid gap-4">
                {prints.map((print) => (
                  <PrintCard key={print.number} print={print} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
