import { PrintShort } from "@/lib/types/print";
import { SearchResultCard } from "./search-result-card";

interface PrintCardProps {
  print: PrintShort;
}

export function PrintCard({ print }: PrintCardProps) {
  return (
    <SearchResultCard
      href={`/prints/${print.number}`}
      title={print.title}
      description={print.summary}
      metadata={`Druk nr ${print.number}${
        print.documentDate
          ? ` • ${new Date(print.documentDate).toLocaleDateString("pl-PL")}`
          : ""
      }`}
    />
  );
}
