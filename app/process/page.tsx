"use client";
import { Suspense, useEffect, useState } from "react";
import { getAllTopics, getPrintsRelatedToTopic } from "@/lib/queries";
import ProcessSearchClient from "./processSearch";
import { Print, Topic } from "@/lib/types";

export default function ProcessSearchPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [flatPrints, setFlatPrints] = useState<Print[]>([]);
  const [topicsMap, setTopicsMap] = useState<Record<string, string[]>>({});

  useEffect(() => {
    const fetchData = async () => {
      const topics = await getAllTopics();
      setTopics(topics);

      const topicsMap: Record<string, string[]> = {};
      const printsPromises = topics.map(async (topic) => {
        const prints = await getPrintsRelatedToTopic(topic.name);
        prints.forEach((print) => {
          if (!topicsMap[print.number]) {
            topicsMap[print.number] = [];
          }
          topicsMap[print.number].push(topic.name);
        });
        return prints;
      });
      const allPrints = await Promise.all(printsPromises);
      const flatPrints = allPrints.flat();
      setFlatPrints(flatPrints);
      setTopicsMap(topicsMap);
    };

    fetchData();
  }, []);

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Process Search</h1>
      <Suspense
        fallback={
          <div className="text-center text-muted-foreground">Loading...</div>
        }
      >
        <ProcessSearchClient
          topics={topics}
          prints={flatPrints}
          topicsMap={topicsMap}
        />
      </Suspense>
    </div>
  );
}
