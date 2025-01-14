"use client";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import debounce from "lodash/debounce";
import { PrintListItem } from "@/lib/types/print";
import { CardWrapper } from "@/components/ui/card-wrapper";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const searchPrints = (query: string, prints: PrintListItem[]) => {
  if (!query.trim()) return [];
  
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

export function SearchSection({ initialPrints }: { initialPrints: PrintListItem[] }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PrintListItem[]>([]);

  const performSearch = useMemo(
    () =>
      debounce((query: string) => {
        const results = searchPrints(query, initialPrints);
        setSearchResults(results);
      }, 50),
    [initialPrints]
  );

  useEffect(() => {
    performSearch(searchQuery);
  }, [searchQuery, performSearch]);

  return (
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
                  router.push(`/processes/${print.processPrint[0] || print.number}`)
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
  );
}
