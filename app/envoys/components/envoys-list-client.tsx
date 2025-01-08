"use client";

import { useState, useCallback } from "react";
import debounce from "lodash/debounce";
import { EnvoysListFilters } from "@/components/envoys-list-filters";
import { EnvoyCard } from "@/components/envoy-card";
import { EnvoyShort } from "@/lib/types/person";

interface Props {
  initialEnvoys: EnvoyShort[];
  initialStatementCounts: Record<string, number>;
  initialInterruptionCounts: Record<string, number>;
}

export function EnvoysListClient({
  initialEnvoys,
  initialStatementCounts,
  initialInterruptionCounts,
}: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClub, setSelectedClub] = useState("all");
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [activityFilter, setActivityFilter] = useState<"active" | "inactive" | "all">("active");
  const [selectedProfessions, setSelectedProfessions] = useState<string[]>([]);
  const [sortField, setSortField] = useState<"votes" | "statements" | "interruptions">("votes");
  const sortDirection = "desc";
  const [isSearching, setIsSearching] = useState(false);

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setIsSearching(true);
      setSearchTerm(value);
      setTimeout(() => setIsSearching(false), 200);
    }, 150),
    []
  );

  const filterEnvoys = (list: EnvoyShort[]) =>
    list.filter((envoy) => {
      return (
        `${envoy.firstName} ${envoy.lastName}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) &&
        (selectedClub === "all" || envoy.club === selectedClub) &&
        (activityFilter === "all" ||
          (activityFilter === "active" && envoy.active) ||
          (activityFilter === "inactive" && !envoy.active)) &&
        (!selectedDistrict || envoy.districtName === selectedDistrict) &&
        (selectedProfessions.length === 0 ||
          selectedProfessions.some((p) =>
            envoy.profession
              ?.split(",")
              .map((s) => s.trim())
              .includes(p)
          ))
      );
    });

  const sortedEnvoys = [...filterEnvoys(initialEnvoys)].sort((a, b) => {
    const m = sortDirection === "desc" ? 1 : -1;
    switch (sortField) {
      case "votes":
        return m * ((Number(b.numberOfVotes) || 0) - (Number(a.numberOfVotes) || 0));
      case "statements":
        return m * ((initialStatementCounts[b.id] || 0) - (initialStatementCounts[a.id] || 0));
      case "interruptions":
        return m * ((initialInterruptionCounts[b.id] || 0) - (initialInterruptionCounts[a.id] || 0));
      default:
        return 0;
    }
  });

  const clubs = [...new Set(initialEnvoys.map((e) => e.club).filter(Boolean))];

  const getProfessionCounts = (list: EnvoyShort[]) => {
    const counts = new Map<string, number>();
    list.forEach((env) => {
      env.profession
        ?.split(",")
        .map((p) => p.trim())
        .forEach((prof) => counts.set(prof, (counts.get(prof) || 0) + 1));
    });
    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  };

  return (
    <>
      <EnvoysListFilters
        clubs={clubs}
        professions={getProfessionCounts(initialEnvoys)}
        onSearchChange={debouncedSearch}
        onClubChange={setSelectedClub}
        onActivityChange={setActivityFilter}
        onDistrictChange={setSelectedDistrict}
        onProfessionsChange={setSelectedProfessions}
        selectedProfessions={selectedProfessions}
        onSortChange={setSortField}
      />

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isSearching ? (
          <div className="col-span-full text-center py-4">Wyszukiwanie...</div>
        ) : sortedEnvoys.length === 0 ? (
          <div className="col-span-full text-center py-4">Brak wyników</div>
        ) : (
          sortedEnvoys.map((envoy) => {
            const displayValue = (() => {
              switch (sortField) {
                case "votes":
                  return `Głosy: ${envoy.numberOfVotes || "Brak danych"}`;
                case "statements":
                  return `Wypowiedzi: ${initialStatementCounts[envoy.id] || 0}`;
                case "interruptions":
                  return `Przerywania: ${initialInterruptionCounts[envoy.id] || 0}`;
                default:
                  return `Głosy: ${envoy.numberOfVotes || "Brak danych"}`;
              }
            })();

            return (
              <EnvoyCard
                key={envoy.id}
                envoy={envoy}
                displayValue={displayValue}
              />
            );
          })
        )}
      </div>
    </>
  );
}
