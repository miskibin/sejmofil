"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getAllTopics, getPrintsRelatedToTopic } from "@/lib/queries";
import { Print, Topic } from "@/lib/types";
import debounce from "lodash/debounce";

export default function ProcessSearchPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [topics, setTopics] = useState<Topic[]>([]);
  const [prints, setPrints] = useState<Print[]>([]);
  type SearchResult = {
    print: Print;
    matchedTopics: Topic[];
  };

  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [printTopicsMap, setPrintTopicsMap] = useState<
    Record<string, string[]>
  >({});

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
            const topicMatch = printTopicsMap[print.number]?.some((topicName) =>
              searchTerms.some((term) => topicName.toLowerCase().includes(term))
            );
            return titleMatch || topicMatch;
          })
          .map((print) => ({
            print,
            matchedTopics: topics.filter((topic) =>
              printTopicsMap[print.number]?.includes(topic.name)
            ),
          }));

        setSearchResults(results);
      }, 300),
    [prints, topics, printTopicsMap]
  );

  useEffect(() => {
    performSearch(searchQuery);
  }, [searchQuery, performSearch]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const fetchedTopics = await getAllTopics();
        setTopics(fetchedTopics);

        // Create a map to store print-to-topics relationships
        const topicsMap: Record<string, string[]> = {};
        const printsPromises = fetchedTopics.map((topic) =>
          getPrintsRelatedToTopic(topic.name).then((prints) => {
            prints.forEach((print) => {
              if (!topicsMap[print.number]) {
                topicsMap[print.number] = [];
              }
              topicsMap[print.number].push(topic.name);
            });
            return prints;
          })
        );
        const allPrints = await Promise.all(printsPromises);
        const flatPrints = allPrints.flat();
        setPrints(flatPrints);
        setPrintTopicsMap(topicsMap);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Process Search</h1>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search prints by title or topic..."
        className="w-full p-3 border rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-primary/50"
        disabled={isLoading}
      />

      {isLoading ? (
        <div className="text-center text-muted-foreground">Loading...</div>
      ) : searchQuery.trim() && searchResults.length === 0 ? (
        <div className="text-center text-muted-foreground">
          No results found
        </div>
      ) : (
        <div className="space-y-3">
          {searchResults.map(({ print, matchedTopics }, ) => (
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
    </div>
  );
}
