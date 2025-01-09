"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import debounce from "lodash/debounce";
import { EnvoysListFilters } from "@/components/envoys-list-filters";
import { EnvoyCard } from "@/components/envoy-card";
import { EnvoyShort } from "@/lib/types/person";
import type { ActivityStatus } from "@/components/envoys-list-filters";

type RankingType = "votes" | "absents" | "statements" | "interruptions" | "none" | null;

interface Props {
  initialEnvoys: EnvoyShort[];
  initialStatementCounts: Record<string, number>;
  initialInterruptionCounts: Record<string, number>;
}

const getRankingValue = (envoy: EnvoyShort, type: RankingType, counts: Record<string, number>) => {
  switch (type) {
    case "votes": return Number(envoy.numberOfVotes) || 0;
    case "absents": return envoy.absents || 0;
    case "statements": return counts[envoy.id] || 0;
    case "interruptions": return counts[envoy.id] || 0;
    default: return 0;
  }
};

export function EnvoysListClient({ initialEnvoys, initialStatementCounts, initialInterruptionCounts }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState({
    search: "",
    club: "all",
    district: null as string | null,
    activity: "active" as ActivityStatus,
    professions: [] as string[],
  });
  const [rankingType, setRankingType] = useState<RankingType>(
    (searchParams.get("ranking") as RankingType) || null
  );
  const [isSearching, setIsSearching] = useState(false);

  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        setIsSearching(true);
        requestAnimationFrame(() => {
          setFilters(f => ({ ...f, search: value }));
          setIsSearching(false);
        });
      }, 300),
    [setFilters, setIsSearching]
  );

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (rankingType) params.set("ranking", rankingType);
    else params.delete("ranking");
    router.push(`?${params.toString()}`, { scroll: false });
  }, [rankingType, router, searchParams]);

  const rankingPositions = useMemo(() => {
    if (!rankingType || rankingType === 'none') return new Map<string, number>();
    const counts = rankingType === 'statements' ? initialStatementCounts : initialInterruptionCounts;
    return new Map(
      [...initialEnvoys]
        .sort((a, b) => getRankingValue(b, rankingType, counts) - getRankingValue(a, rankingType, counts))
        .map((envoy, index) => [envoy.id, index + 1])
    );
  }, [rankingType, initialEnvoys, initialStatementCounts, initialInterruptionCounts]);

  const sortedAndFilteredEnvoys = useMemo(() => {
    const filtered = initialEnvoys.filter(envoy => 
      `${envoy.firstName} ${envoy.lastName}`.toLowerCase().includes(filters.search.toLowerCase()) &&
      (filters.club === "all" || envoy.club === filters.club) &&
      (filters.activity === "all" || (filters.activity === "active" ? envoy.active : !envoy.active)) &&
      (!filters.district || envoy.districtName === filters.district) &&
      (filters.professions.length === 0 || filters.professions.some(p => 
        envoy.profession?.split(",").map(s => s.trim()).includes(p)
      ))
    );

    return rankingType && rankingType !== 'none'
      ? filtered.sort((a, b) => (rankingPositions.get(a.id) || 0) - (rankingPositions.get(b.id) || 0))
      : filtered.sort((a, b) => a.lastName.localeCompare(b.lastName));
  }, [filters, rankingType, rankingPositions]);

  return (
    <>
      <EnvoysListFilters
        clubs={[...new Set(initialEnvoys.map(e => e.club).filter(Boolean))]}
        professions={(() => {
          const counts = new Map<string, number>();
          initialEnvoys.forEach((env) => {
            env.profession
              ?.split(",")
              .map((p: string) => p.trim())
              .forEach((prof: string) => counts.set(prof, (counts.get(prof) || 0) + 1));
          });
          return Array.from(counts.entries())
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);
        })()}
        onSearchChange={debouncedSearch}
        onClubChange={club => setFilters(f => ({ ...f, club }))}
        onActivityChange={activity => setFilters(f => ({ ...f, activity }))}
        onDistrictChange={district => setFilters(f => ({ ...f, district }))}
        onProfessionsChange={professions => setFilters(f => ({ ...f, professions }))}
        selectedProfessions={filters.professions}
        onSortChange={setRankingType}
      />

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isSearching ? (
          <div className="col-span-full text-center py-4">Wyszukiwanie...</div>
        ) : sortedAndFilteredEnvoys.length === 0 ? (
          <div className="col-span-full text-center py-4">Brak wyników</div>
        ) : (
          sortedAndFilteredEnvoys.map(envoy => (
            <EnvoyCard
              key={envoy.id}
              envoy={envoy}
              rankingPosition={rankingPositions.get(envoy.id) || 0}
              rankingValue={rankingType && rankingType !== 'none' 
                ? getRankingValue(envoy, rankingType, 
                    rankingType === 'statements' ? initialStatementCounts : initialInterruptionCounts)
                : null}
              rankingType={rankingType === 'none' ? null : rankingType}
            />
          ))
        )}
      </div>
    </>
  );
}
