import { Clock, Zap, Shield, PiggyBank } from "lucide-react";
import { DocumentCategoryCard } from "./document-category-card";
import { PrintShort } from "@/lib/types/print";

interface DocumentCategoriesProps {
  latestPrints: PrintShort[];
  energyPrints: PrintShort[];
  immunityPrints: PrintShort[];
  taxPrints: PrintShort[];
}

export function DocumentCategories({
  latestPrints,
  energyPrints,
  immunityPrints,
  taxPrints,
}: DocumentCategoriesProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <DocumentCategoryCard
        title="Najnowsze druki"
        subtitle="Ostatnio dodane dokumenty"
        icon={Clock}
        prints={latestPrints}
      />
      <DocumentCategoryCard
        title="Ceny energii"
        subtitle="Dokumenty dotyczące cen energii"
        icon={Zap}
        prints={energyPrints}
      />
      <DocumentCategoryCard
        title="Immunitet poselski"
        subtitle="Sprawy dotyczące immunitetu"
        icon={Shield}
        prints={immunityPrints}
      />
      <DocumentCategoryCard
        title="Podatki"
        subtitle="Dokumenty dotyczące podatków"
        icon={PiggyBank}
        prints={taxPrints}
      />
    </div>
  );
}
