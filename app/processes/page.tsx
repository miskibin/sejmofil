"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import debounce from "lodash/debounce";
import { getAllPrints } from "@/lib/queries/print";
import { PrintListItem, PrintShort } from "@/lib/types/print";
import { CardWrapper } from "@/components/ui/card-wrapper";
import { Input } from "@/components/ui/input";
import { Search, Clock, Zap, Shield, PiggyBank } from "lucide-react";
import { getLatestPrints, getPrintsByTopic } from "@/lib/queries/process";

const CachedSearchResults = async ({
  query,
  prints,
}: {
  query: string;
  prints: PrintListItem[];
}) => {
  if (!query.trim()) {
    return [];
  }

  const searchTerms = query.toLowerCase().split(" ");
  return prints
    .filter((print) => {
      const titleMatch = searchTerms.some((term) =>
        print.title.toLowerCase().includes(term)
      );
      const topicMatch = searchTerms.some((term) =>
        print.topicName.toLowerCase().includes(term)
      );
      return titleMatch || topicMatch;
    })
    .slice(0, 4);
};

export default function ProcessSearchPage() {
  const router = useRouter();
  const [prints, setPrints] = useState<PrintListItem[]>([]);
  const [latestPrints, setLatestPrints] = useState<PrintShort[]>([]);
  const [energyPrints, setEnergyPrints] = useState<PrintShort[]>([]);
  const [immunityPrints, setImmunityPrints] = useState<PrintShort[]>([]);
  const [taxPrints, setTaxPrints] = useState<PrintShort[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PrintListItem[]>([]);

  useEffect(() => {
    const fetchAllData = async () => {
      const [allPrints, latest, energy, immunity, tax] = await Promise.all([
        getAllPrints(),
        getLatestPrints(10),
        getPrintsByTopic("Ceny energii", 10),
        getPrintsByTopic("Immunitet poselski", 10),
        getPrintsByTopic("Podatki", 10),
      ]);
      setPrints(allPrints);
      setLatestPrints(latest);
      setEnergyPrints(energy);
      setImmunityPrints(immunity);
      setTaxPrints(tax);
    };
    fetchAllData();
  }, []);

  const performSearch = useMemo(
    () =>
      debounce(async (query: string) => {
        const results = await CachedSearchResults({ query, prints });
        setSearchResults(results);
      }, 50),
    [prints]
  );

  useEffect(() => {
    performSearch(searchQuery);
  }, [searchQuery, performSearch]);

  const PrintList = ({ items }: { items: PrintShort[] }) => (
    <div className="space-y-3">
      {items.slice(0, 5).map((print) => (
        <div
          key={print.number}
          onClick={() =>
            router.push(`/processes/${print.processPrint[0] || print.number}`)
          }
          className="cursor-pointer group"
        >
          <div className="flex justify-between items-start space-x-2">
            <span className="text-xs text-primary font-medium whitespace-nowrap">
              {print.number}
            </span>
            <span className="text-sm line-clamp-2 group-hover:text-primary transition-colors">
              {print.title}
            </span>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {new Date(print.documentDate).toLocaleDateString("pl-PL")}
            </span>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-8">
      <CardWrapper
        title="Proces legislacyjny"
        subtitle="Wyszukaj druki sejmowe"
        showGradient={false}
      >
        <div className="space-y-6">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Wyszukaj po tytule lub temacie..."
              className="pl-8"
            />
          </div>

          {searchQuery.trim() && searchResults.length === 0 ? (
            <div className="text-muted-foreground">Nie znaleziono wyników</div>
          ) : (
            <div className="space-y-3 border-l">
              {searchResults.map((print) => (
                <div
                  key={print.number}
                  className="relative pl-4 border-l hover:border-primary transition-colors"
                  onClick={() =>
                    router.push(
                      `/processes/${print.processPrint[0] || print.number}`
                    )
                  }
                >
                  <div className="block hover:text-primary cursor-pointer">
                    <div className="text-sm font-medium">{print.title}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {print.topicName}
                      </span>
                      <span className="text-xs text-primary font-medium">
                        Druk {print.number}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardWrapper>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CardWrapper
          title="Najnowsze druki"
          subtitle="Ostatnio dodane dokumenty"
          headerIcon={<Clock className="w-5 h-5 text-primary" />}
          showGradient={false}
        >
          <PrintList items={latestPrints} />
        </CardWrapper>

        <CardWrapper
          title="Ceny energii"
          subtitle="Dokumenty dotyczące cen energii"
          headerIcon={<Zap className="w-5 h-5 text-primary" />}
          showGradient={false}
        >
          <PrintList items={energyPrints} />
        </CardWrapper>

        <CardWrapper
          title="Immunitet poselski"
          subtitle="Sprawy dotyczące immunitetu"
          headerIcon={<Shield className="w-5 h-5 text-primary" />}
          showGradient={false}
        >
          <PrintList items={immunityPrints} />
        </CardWrapper>

        <CardWrapper
          title="Podatki"
          subtitle="Dokumenty dotyczące podatków"
          headerIcon={<PiggyBank className="w-5 h-5 text-primary" />}
          showGradient={false}
        >
          <PrintList items={taxPrints} />
        </CardWrapper>
      </div>
    </div>
  );
}
