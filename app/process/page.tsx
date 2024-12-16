import { Suspense } from "react";
import { getAllTopics, getPrintsRelatedToTopic } from "@/lib/queries";
import ProcessSearchClient from "./processSearch";

export default async function ProcessSearchPage() {
  const topics = await getAllTopics();

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
