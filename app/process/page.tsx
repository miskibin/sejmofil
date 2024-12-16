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

  useEffect(() => {
    const fetchData = async () => {
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
    };
    fetchData();
  }, []);

  const debouncedSearch = useMemo(
    () =>
      debounce(async (query: string) => {
        if (!query.trim()) {
          setSearchResults([]);
          return;
        }

        const searchLower = query.toLowerCase();

        // Search in topics
        const matchingTopics = topics.filter(
          (topic) =>
            topic.name.toLowerCase().includes(searchLower) ||
            topic.description?.toLowerCase().includes(searchLower)
        );

        // Get prints that are related to matching topics or match by title
        const matchingPrints = prints.filter((print) => {
          const matchesByTitle = print.title
            .toLowerCase()
            .includes(searchLower);
          const matchesByTopic = matchingTopics.some((topic) =>
            printTopicsMap[print.number]?.includes(topic.name)
          );
          return matchesByTitle || matchesByTopic;
        });

        // For each matching print, find which topics matched
        const matchingPrintsWithTopics = matchingPrints
          .slice(0, 3)
          .map((print) => ({
            print,
            matchedTopics: matchingTopics.filter((topic) =>
              printTopicsMap[print.number]?.includes(topic.name)
            ),
          }));

        setSearchResults(matchingPrintsWithTopics);
      }, 50),
    []
  );

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Process Search</h1>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search by topic or title..."
        className="w-full p-3 border rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-primary/50"
      />

      <div className="space-y-3">
        {searchResults.map(({ print, matchedTopics }, index) => (
          <div
            key={index}
            className="p-4 rounded-lg transition-all cursor-pointer 
                       hover:scale-[1.02] hover:shadow-md
                       bg-primary/5 hover:bg-primary/10"
            onClick={() => router.push(`/process/${print.number}`)}
          >
            <div className="space-y-2">
              <p className="text-lg font-semibold text-primary">
                {print.title}
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {matchedTopics.map((topic, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 text-xs rounded-full bg-primary/20 text-primary font-medium"
                  >
                    {topic.name}
                  </span>
                ))}
              </div>
              <p className="text-xs font-medium text-primary/70">
                Process {print.number}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
