import { Suspense } from "react";
import { SearchSection } from "./components/search-section";

import { getLatestPrints, getPrintsByTopic } from "@/lib/queries/process";
import { getAllPrints } from "@/lib/queries/print";
import { DocumentCategories } from "./components/document-categories";

export default async function ProcessSearchPage() {
  // Fetch data on server
  const [allPrints, latestPrints, energyPrints, immunityPrints, taxPrints] =
    await Promise.all([
      getAllPrints(),
      getLatestPrints(10),
      getPrintsByTopic("Ceny energii", 10),
      getPrintsByTopic("Immunitet poselski", 10),
      getPrintsByTopic("Podatki", 10),
    ]);

  return (
    <div className="space-y-8">
      <Suspense >
        <SearchSection initialPrints={allPrints} />
      </Suspense>

      <Suspense >
        <DocumentCategories
          latestPrints={latestPrints}
          energyPrints={energyPrints}
          immunityPrints={immunityPrints}
          taxPrints={taxPrints}
        />
      </Suspense>
    </div>
  );
}
