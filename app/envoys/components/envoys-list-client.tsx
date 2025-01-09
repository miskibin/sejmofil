"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import debounce from "lodash/debounce";
import { EnvoysListFilters } from "@/components/envoys-list-filters";
import { EnvoyCard } from "@/components/envoy-card";
import { EnvoyShort } from "@/lib/types/person";
import type { ActivityStatus } from "@/components/envoys-list-filters";

type RankingType =
  | "votes"
  | "absents"
  | "statements"
  | "interruptions"
  | "none"
  | null;

interface Props {
  initialEnvoys: EnvoyShort[];
  initialStatementCounts: Record<string, number>;
  initialInterruptionCounts: Record<string, number>;
}

const TOP_RANK_THRESHOLD = 40;

const createRankingMap = (
  envoys: EnvoyShort[],
  getValue: (envoy: EnvoyShort) => number
) => {
  const sorted = [...envoys]
    .sort((a, b) => getValue(b) - getValue(a))
    .map((e, i) => [e.id, i + 1] as [string, number]); // Type assertion here
  return new Map<string, number>(sorted);
};

const getRankingValue = (
  envoy: EnvoyShort,
  type: RankingType,
  counts: Record<string, number>
) => {
  switch (type) {
    case "votes":
      return Number(envoy.numberOfVotes) || 0;
    case "absents":
      return envoy.absents || 0;
    case "statements":
      return counts[envoy.id] || 0;
    case "interruptions":
      return counts[envoy.id] || 0;
    default:
      return 0;
  }
};

const createMetricsCache = (
  envoys: EnvoyShort[],
  interruptionCounts: Record<string, number>
) => {
  const votesRanking = createRankingMap(
    envoys,
    (e) => Number(e.numberOfVotes) || 0
  );
  const absentsRanking = createRankingMap(envoys, (e) => e.absents || 0);
  const interruptionsRanking = createRankingMap(
    envoys,
    (e) => interruptionCounts[e.id] || 0
  );
  const totalEnvoys = envoys.length;

  return {
    votesRanking,
    absentsRanking,
    interruptionsRanking,
    getMetrics: (envoyId: string) => {
      const metrics = new Set<string>();
      const votePos = votesRanking.get(envoyId) ?? 0; // Use nullish coalescing
      const absentsPos = absentsRanking.get(envoyId) ?? 0;
      const interruptionsPos = interruptionsRanking.get(envoyId) ?? 0;

      // Compare with explicit numbers
      if (votePos > 0 && votePos <= TOP_RANK_THRESHOLD) metrics.add("topVotes");
      if (votePos > 0 && votePos >= totalEnvoys - TOP_RANK_THRESHOLD)
        metrics.add("lowVotes");
      if (absentsPos > 0 && absentsPos <= TOP_RANK_THRESHOLD)
        metrics.add("topAbsents");
      if (absentsPos > 0 && absentsPos >= totalEnvoys - TOP_RANK_THRESHOLD)
        metrics.add("lowAbsents");
      if (interruptionsPos > 0 && interruptionsPos <= TOP_RANK_THRESHOLD)
        metrics.add("topInterruptions");

      return metrics;
    },
  };
};

export function EnvoysListClient({
  initialEnvoys,
  initialStatementCounts,
  initialInterruptionCounts,
}: Props) {
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
          setFilters((f) => ({ ...f, search: value }));
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

  const metricsCache = useMemo(
    () => createMetricsCache(initialEnvoys, initialInterruptionCounts),
    [initialEnvoys, initialInterruptionCounts]
  );

  const rankingPositions = useMemo(() => {
    if (!rankingType || rankingType === "none")
      return new Map<string, number>();

    if (rankingType === "votes") return metricsCache.votesRanking;
    if (rankingType === "absents") return metricsCache.absentsRanking;
    if (rankingType === "interruptions")
      return metricsCache.interruptionsRanking;

    return createRankingMap(
      initialEnvoys,
      (e) => initialStatementCounts[e.id] || 0
    );
  }, [rankingType, metricsCache, initialEnvoys, initialStatementCounts]);

  const sortedAndFilteredEnvoys = useMemo(() => {
    const professionSet =
      filters.professions.length > 0 ? new Set(filters.professions) : null;

    const searchLower = filters.search.toLowerCase();

    const filtered = initialEnvoys.filter((envoy) => {
      if (filters.club !== "all" && envoy.club !== filters.club) return false;
      if (filters.district && envoy.districtName !== filters.district)
        return false;
      if (
        filters.activity !== "all" &&
        (filters.activity === "active" ? !envoy.active : envoy.active)
      )
        return false;

      if (
        searchLower &&
        !`${envoy.firstName} ${envoy.lastName} ${envoy.role || ""}`
          .toLowerCase()
          .includes(searchLower)
      )
        return false;

      if (professionSet && envoy.profession) {
        const hasMatchingProfession = envoy.profession
          .split(",")
          .some((p) => professionSet.has(p.trim()));
        if (!hasMatchingProfession) return false;
      }

      return true;
    });

    const envoysWithMetrics = filtered.map((envoy) => ({
      ...envoy,
      metrics: metricsCache.getMetrics(envoy.id),
    }));

    if (rankingType && rankingType !== "none") {
      return envoysWithMetrics.sort((a, b) => {
        const posA = rankingPositions.get(a.id) ?? 0;
        const posB = rankingPositions.get(b.id) ?? 0;
        return posA - posB;
      });
    }

    return envoysWithMetrics.sort((a, b) =>
      a.lastName.localeCompare(b.lastName)
    );
  }, [filters, rankingType, rankingPositions, initialEnvoys, metricsCache]);

  return (
    <>
      <EnvoysListFilters
        clubs={[...new Set(initialEnvoys.map((e) => e.club).filter(Boolean))]}
        professions={(() => {
          const counts = new Map<string, number>();
          initialEnvoys.forEach((env) => {
            env.profession
              ?.split(",")
              .map((p: string) => p.trim())
              .forEach((prof: string) =>
                counts.set(prof, (counts.get(prof) || 0) + 1)
              );
          });
          return Array.from(counts.entries())
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);
        })()}
        onSearchChange={debouncedSearch}
        onClubChange={(club) => setFilters((f) => ({ ...f, club }))}
        onActivityChange={(activity) => setFilters((f) => ({ ...f, activity }))}
        onDistrictChange={(district) => setFilters((f) => ({ ...f, district }))}
        onProfessionsChange={(professions) =>
          setFilters((f) => ({ ...f, professions }))
        }
        selectedProfessions={filters.professions}
        onSortChange={setRankingType}
      />

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isSearching ? (
          <div className="col-span-full text-center py-4">Wyszukiwanie...</div>
        ) : sortedAndFilteredEnvoys.length === 0 ? (
          <div className="col-span-full text-center py-4">Brak wyników</div>
        ) : (
          sortedAndFilteredEnvoys.map((envoy) => (
            <EnvoyCard
              key={envoy.id}
              envoy={envoy}
              rankingPosition={rankingPositions.get(envoy.id) ?? 0}
              rankingValue={
                rankingType && rankingType !== "none"
                  ? getRankingValue(
                      envoy,
                      rankingType,
                      rankingType === "statements"
                        ? initialStatementCounts
                        : initialInterruptionCounts
                    )
                  : null
              }
              rankingType={rankingType === "none" ? null : rankingType}
            />
          ))
        )}
      </div>
    </>
  );
}
