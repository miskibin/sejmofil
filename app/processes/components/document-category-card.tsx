import { CardWrapper } from "@/components/ui/card-wrapper";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PrintShort } from "@/lib/types/print";
import {
  LucideIcon,
  FileText,
  ClipboardList,
  FileSearch,
  Files,
} from "lucide-react";
import { useRouter } from "next/navigation";

const DOCUMENT_TYPES = {
  "Projekty ustaw": {
    matcher: (title: string) => title.toLowerCase().includes("projekt ustawy"),
    icon: FileText,
  },
  Sprawozdania: {
    matcher: (title: string) => title.toLowerCase().includes("sprawozdanie"),
    icon: ClipboardList,
  },
  Wnioski: {
    matcher: (title: string) => title.toLowerCase().includes("wniosek"),
    icon: FileSearch,
  },
  Inne: {
    matcher: () => true,
    icon: Files,
  },
} as const;

interface Props {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  prints: PrintShort[];
}

export function DocumentCategoryCard({
  title,
  subtitle,
  icon: Icon,
  prints,
}: Props) {
  const router = useRouter();

  const categorizedPrints = prints.reduce((acc, print) => {
    const category =
      Object.entries(DOCUMENT_TYPES).find(([key, { matcher }]) =>
        key === "Inne"
          ? !Object.entries(DOCUMENT_TYPES).some(
              ([k, v]) => k !== "Inne" && v.matcher(print.title)
            )
          : matcher(print.title)
      )?.[0] || "Inne";

    acc[category] = [...(acc[category] || []), print];
    return acc;
  }, {} as Record<string, PrintShort[]>);

  const nonEmptyCategories = Object.entries(categorizedPrints).filter(
    ([, items]) => items.length > 0
  ) as [keyof typeof DOCUMENT_TYPES, PrintShort[]][];

  if (nonEmptyCategories.length === 0) return null;

  return (
    <CardWrapper
      title={title}
      subtitle={subtitle}
      headerIcon={<Icon className="w-5 h-5 text-primary" />}
      showGradient={false}
    >
      <Tabs defaultValue={nonEmptyCategories[0][0]}>
        <TabsList className="w-full">
          {nonEmptyCategories.map(([category]) => {
            const CategoryIcon = DOCUMENT_TYPES[category].icon;
            return (
              <TabsTrigger key={category} value={category} className="flex-1">
                <CategoryIcon className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">{category}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>
        {nonEmptyCategories.map(([category, items]) => (
          <TabsContent key={category} value={category} className="pt-4">
            <div className="space-y-3">
              {items.slice(0, 5).map((print) => (
                <div
                  key={print.number}
                  onClick={() =>
                    router.push(
                      `/processes/${print.processPrint[0] || print.number}`
                    )
                  }
                  className="flex items-start space-x-2 cursor-pointer group"
                >
                  <span className="text-xs text-primary font-medium whitespace-nowrap">
                    {print.number}
                  </span>
                  <span className="text-sm flex-1 line-clamp-2 group-hover:text-primary transition-colors">
                    {print.title}
                  </span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(print.documentDate).toLocaleDateString("pl-PL")}
                  </span>
                </div>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </CardWrapper>
  );
}
