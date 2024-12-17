"use client";
import { Suspense, useEffect, useState } from "react";
import { getAllPrints } from "@/lib/queries";
import ProcessSearchClient from "./processSearch";
import { PrintListItem } from "@/lib/types";

export default function ProcessSearchPage() {
  const [prints, setPrints] = useState<PrintListItem[]>([]);
  const [topicsMap, setTopicsMap] = useState<Record<string, string[]>>({});

  useEffect(() => {
    const fetchData = async () => {
      const printItems = await getAllPrints();
      setPrints(printItems);

      // Create topics map from PrintListItems
      const topicsMapping: Record<string, string[]> = {};
      printItems.forEach((item) => {
        if (!topicsMapping[item.number]) {
          topicsMapping[item.number] = [];
        }
        topicsMapping[item.number].push(item.topicName);
      });
      setTopicsMap(topicsMapping);
    };

    fetchData();
  }, []);

  // Get unique topics from prints
  const topics = Array.from(
    new Set(
      prints.map((p) => ({
        name: p.topicName,
        description: p.topicDescription,
      }))
    )
  );

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
          prints={prints}
          topicsMap={topicsMap}
        />
      </Suspense>
    </div>
  );
}
