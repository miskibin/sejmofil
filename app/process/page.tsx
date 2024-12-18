"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import debounce from "lodash/debounce";
import { getAllPrints } from "@/lib/queries";
import { PrintListItem } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProcessSearchPage() {
  const router = useRouter();
  const [prints, setPrints] = useState<PrintListItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PrintListItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const printItems = await getAllPrints();
      setPrints(printItems);
    };
    fetchData();
  }, []);

  const performSearch = useMemo(
    () =>
      debounce((query: string) => {
        if (!query.trim()) {
          setSearchResults([]);
          return;
        }

        const searchTerms = query.toLowerCase().split(" ");
        const results = prints
          .filter((print) => {
            const titleMatch = searchTerms.some((term) =>
              print.title.toLowerCase().includes(term)
            );
            const topicMatch = searchTerms.some((term) =>
              print.topicName.toLowerCase().includes(term)
            );
            return titleMatch || topicMatch;
          })
          .slice(0, 4); // Limit results to 4

        setSearchResults(results);
      }, 50),
    [prints]
  );

  useEffect(() => {
    performSearch(searchQuery);
  }, [searchQuery, performSearch]);

  return (
    <div className="container mx-auto p-8">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-sm text-[#8B1538]">Wyszukiwarka</CardTitle>
          <h2 className="text-2xl font-semibold">Proces legislacyjny</h2>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Wyszukaj po tytule lub temacie..."
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B1538]/50"
            />
          </div>

          {searchQuery.trim() && searchResults.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              Nie znaleziono wyników
            </div>
          ) : (
            <div className="space-y-3">
              {searchResults.map((print) => (
                <div
                  key={print.number}
                  className="p-4 rounded-lg transition-all cursor-pointer 
                           hover:scale-[1.01] hover:shadow-md
                      "
                  onClick={() => router.push(`/process/${print.number}`)}
                >
                  <div className="space-y-2">
                    <p className="text-lg font-semibold line-clamp-2">
                      {print.title}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="px-2 py-1 text-xs rounded-full  text-[#8B1538] font-medium">
                        {print.topicName}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-[#8B1538]/70">
                      Druk {print.number}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
