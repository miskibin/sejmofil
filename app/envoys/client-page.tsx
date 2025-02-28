"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { EnvoyShort } from "@/types/person";
import FilterBar from "@/components/filter-bar";
import PageLayout from "@/components/default-layout";
import { EnvoyCard } from "./envoy-card";

interface EnvoysClientProps {
  initialEnvoys: EnvoyShort[];
}

export default function EnvoysClient({ initialEnvoys }: EnvoysClientProps) {
  const [isPending, setIsPending] = useState(false);
  const searchParams = useSearchParams();

  const activeSort = searchParams?.get("sort") || "najwięcej_głosów";

  // Filter categories
  const filterCategories = [
    "Najwięcej Głosów",
    "Manipulatywni",
    "Emocjonalni",
    "Najmłodsi",
    "Najstarsi",
    "Edukacja",
  ];

  // Sort envoys based on active filter
  const sortedEnvoys = useCallback(() => {
    if (!initialEnvoys.length) return [];

    switch (activeSort) {
      case "najwięcej_głosów":
        return [...initialEnvoys].sort(
          (a, b) => b.numberOfVotes - a.numberOfVotes
        );
      case "manipulatywni":
        // This would need a specific logic based on your data
        return initialEnvoys;
      case "emocjonalni":
        // This would need a specific logic based on your data
        return initialEnvoys;
      case "najmłodsi":
        return [...initialEnvoys].sort(
          (a, b) =>
            new Date(b.birthDate).getTime() - new Date(a.birthDate).getTime()
        );
      case "najstarsi":
        return [...initialEnvoys].sort(
          (a, b) =>
            new Date(a.birthDate).getTime() - new Date(b.birthDate).getTime()
        );
      case "edukacja":
        return [...initialEnvoys].sort((a, b) =>
          a.profession.localeCompare(b.profession)
        );
      default:
        return [...initialEnvoys];
    }
  }, [initialEnvoys, activeSort]);

  // Generate party statistics for sidebar
  const partiesStats = useCallback(() => {
    const clubCounts: Record<string, number> = {};

    initialEnvoys.forEach((envoy) => {
      if (envoy.club) {
        clubCounts[envoy.club] = (clubCounts[envoy.club] || 0) + 1;
      }
    });

    return Object.entries(clubCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([club, count]) => ({ club, count }));
  }, [initialEnvoys]);

  console.log(sortedEnvoys()[0]);
  // Content for the page
  const content = (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {sortedEnvoys().map((envoy) => (
        <EnvoyCard key={envoy.id} envoy={envoy} />
      ))}
    </div>
  );

  // FilterBar component
  const filterBar = (
    <div className="mb-6">
      <FilterBar
        categories={filterCategories}
        activeSort={activeSort}
        isLoading={isPending}
        onTransition={setIsPending}
      />
    </div>
  );

  // Sidebar component with education tags
  const sidebar = (
    <div className="space-y-6">
      {/* Politycy section */}
      <Card className="border border-gray-200 rounded-lg">
        <CardContent className="p-5">
          <h3 className="text-lg font-medium mb-2">Politycy</h3>
          <div>
            <h3 className="text-xl font-semibold">Poznaj</h3>
            <h3 className="text-xl font-semibold text-primary mb-3">
              Polskich polityków.
            </h3>

            <Button className="w-full justify-between bg-primary hover:bg-primary/90 text-white rounded-md">
              Załoguj się <ChevronRight size={16} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Wykształcenie section */}
      <Card className="border border-gray-200 rounded-lg">
        <CardContent className="p-5">
          <h3 className="text-lg font-medium mb-2">Wykształcenie</h3>
          <div className="flex flex-wrap gap-2">
            <Badge
              variant="outline"
              className="bg-gray-100 border-0 text-gray-800"
            >
              Politologia
            </Badge>
            <Badge
              variant="outline"
              className="bg-gray-100 border-0 text-gray-800"
            >
              Rasizm
            </Badge>
            <Badge
              variant="outline"
              className="bg-gray-100 border-0 text-gray-800"
            >
              LGBT
            </Badge>
            <Badge
              variant="outline"
              className="bg-gray-100 border-0 text-gray-800"
            >
              J. Polski
            </Badge>
            <Badge
              variant="outline"
              className="bg-gray-100 border-0 text-gray-800"
            >
              Ekonomia
            </Badge>
            <Badge
              variant="outline"
              className="bg-gray-100 border-0 text-gray-800"
            >
              Rolnicze
            </Badge>
            <Badge
              variant="outline"
              className="bg-gray-100 border-0 text-gray-800"
            >
              Imigracja
            </Badge>
            <Badge
              variant="outline"
              className="bg-gray-100 border-0 text-gray-800"
            >
              Kradzież
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Partie section */}
      <Card className="border border-gray-200 rounded-lg">
        <CardContent className="p-5">
          <h3 className="text-lg font-medium mb-2">Partie</h3>
          <div className="space-y-2">
            {partiesStats().map(({ club, count }) => (
              <div
                key={club}
                className="flex justify-between items-center py-1"
              >
                <span className="font-medium">{club}</span>
                <Badge
                  variant="secondary"
                  className="bg-gray-100 text-gray-800"
                >
                  {count}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Statystyki section */}
      <Card className="border border-gray-200 rounded-lg">
        <CardContent className="p-5">
          <h3 className="text-lg font-medium mb-2">
            Chcesz więcej <span className="text-primary">Statystyk?</span>
          </h3>
          <Button className="w-full justify-between bg-white border border-gray-300 text-black hover:bg-gray-50 rounded-md">
            Dashboard <ChevronRight size={16} />
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <PageLayout
      filterBar={filterBar}
      sidebar={sidebar}
      content={content}
      className="container py-8"
    />
  );
}
