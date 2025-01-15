import { PrintShort } from "@/lib/types/print";
import { SearchResultCard } from "./search-result-card";
import { FileText } from "lucide-react";

interface PrintCardProps {
  print: PrintShort;
  searchQuery?: string;
}

export function PrintCard({ print, searchQuery }: PrintCardProps) {
  return (
    <SearchResultCard
      href={`/prints/${print.number}`}
      title={print.title}
      content={print.summary}
      date={print.documentDate}
      metadata={{
        icon: <FileText className="h-4 w-4" />,
        text: `Druk nr ${print.number}`,
      }}
      searchQuery={searchQuery}
    />
  );
}
