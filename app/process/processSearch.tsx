"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import debounce from "lodash/debounce";
import { Topic, PrintListItem } from "@/lib/types";

type Props = {
  prints: PrintListItem[];
};

export default function ProcessSearchClient({ prints }: Props) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  type SearchResult = {
    print: PrintListItem;
    matchedTopics: Topic[];
  };

  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  const performSearch = useMemo(
    () =>
      debounce((query: string) => {
        if (!query.trim()) {
          setSearchResults([]);
          return;
        }

        const searchTerms = query.toLowerCase().split(" ");
        const results: SearchResult[] = prints
          .filter((print) => {
            const titleMatch = searchTerms.some((term) =>
              print.title.toLowerCase().includes(term)
            );
            const topicMatch = searchTerms.some((term) =>
              print.topicName.toLowerCase().includes(term)
            );
            return titleMatch || topicMatch;
          })
          .map((print) => ({
            print,
            matchedTopics: [
              {
                name: print.topicName,
                description: print.topicDescription,
              },
            ],
          }));

        setSearchResults(results);
      }, 300),
    [prints]
  );

  useEffect(() => {
    performSearch(searchQuery);
  }, [searchQuery, performSearch]);

  return (
    <>
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
          {searchResults.map(({ print, matchedTopics }) => (
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
                  {matchedTopics.map((topic) => (
                    <span
                      key={topic.name}
                      className="px-2 py-1 text-xs rounded-full bg-primary/20 text-primary font-medium"
                    >
                      {topic.name}
                    </span>
                  ))}
                </div>
                <p className="text-xs font-medium text-primary/70">
                  Print {print.number}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
