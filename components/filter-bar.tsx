import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition, useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface FilterBarProps {
  categories: string[];
  activeSort: string;
  isLoading?: boolean;
  onTransition?: (isPending: boolean) => void;
}

export default function FilterBar({
  categories,
  activeSort,
  isLoading = false,
  onTransition,
}: FilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    onTransition?.(isPending);
  }, [isPending, onTransition]);

  const navItems = [
    ...categories.map((category) => [
      category,
      `category-${encodeURIComponent(category.toLowerCase())}`,
    ]),
  ] as const;

  const handleSort = useCallback(
    (value: string) => {
      startTransition(() => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("sort", value);
        router.push(`?${params.toString()}`, { scroll: false });
      });
    },
    [router, searchParams]
  );

  return (
    <div className="relative w-full max-w-full md:max-w-4xl">
      <Carousel opts={{ align: "start", dragFree: true }}>
        <CarouselContent className="-ml-1 sm:-ml-2 md:-ml-4">
          {navItems.map(([label, value]) => (
            <CarouselItem
              key={value}
              className="pl-1 sm:pl-2 md:pl-4 basis-auto"
            >
              <button
                onClick={() => handleSort(value)}
                disabled={isPending}
                className={`px-2 sm:px-3 py-1 sm:py-2 text-sm font-medium transition-colors hover:text-primary whitespace-nowrap ${
                  activeSort === value
                    ? "text-primary"
                    : "text-muted-foreground"
                } ${isPending ? "opacity-50 " : ""}`}
              >
                {label}
              </button>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="hidden sm:block *:bg-neutral-50 ">
          <CarouselPrevious />
          <CarouselNext />
        </div>
      </Carousel>
    </div>
  );
}
