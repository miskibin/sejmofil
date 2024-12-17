"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import debounce from "lodash/debounce";
import { getAllPrints } from "@/lib/queries";
import { PrintListItem } from "@/lib/types";

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
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Process Search</h1>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search prints by title or topic..."
        className="w-full p-3 border rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-primary/50"
      />

      {searchQuery.trim() && searchResults.length === 0 ? (
        <div className="text-center text-muted-foreground">
          No results found
        </div>
      ) : (
        <div className="space-y-3">
          {searchResults.map((print) => (
            <div
              key={print.number}
              className="p-4 rounded-lg transition-all cursor-pointer 
                       hover:scale-[1.02] hover:shadow-md
                       bg-primary/5 hover:bg-primary/10"
              onClick={() => router.push(`/process/${print.number}`)}
            >
              <div className="space-y-2">
                <p className="text-lg font-semibold text-primary line-clamp-2">
                  {print.title}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="px-2 py-1 text-xs rounded-full bg-primary/20 text-primary font-medium">
                    {print.topicName}
                  </span>
                </div>
                <p className="text-xs font-medium text-primary/70">
                  Print {print.number}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
