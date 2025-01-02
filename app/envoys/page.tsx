"use client";

import { Suspense, useEffect, useState } from "react";
import { EnvoysListFilters } from "@/components/envoys-list-filters";
import { EnvoyCard } from "@/components/envoy-card";
import {
  getAllEnvoys,
  getPersonStatementCounts,
  getPersonInterruptionsCount,
} from "@/lib/queries/person";
import { EnvoyShort } from "@/lib/types/person";

// export const revalidate = 3600;

function EnvoysList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClub, setSelectedClub] = useState("all");
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [activityFilter, setActivityFilter] = useState<
    "active" | "inactive" | "all"
  >("active");
  const [envoys, setEnvoys] = useState<EnvoyShort[]>([]);
  const [selectedProfessions, setSelectedProfessions] = useState<string[]>([]);
  const [sortField, setSortField] = useState<
    "none" | "votes" | "statements" | "interruptions"
  >("none");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [statementCounts, setStatementCounts] = useState<
    Record<string, number>
  >({});
  const [interruptionCounts, setInterruptionCounts] = useState<
    Record<string, number>
  >({});

  useEffect(() => {
    (async () => {
      const [allEnvoys, statements, interruptions] = await Promise.all([
        getAllEnvoys(),
        getPersonStatementCounts(),
        getPersonInterruptionsCount(),
      ]);
      setEnvoys(allEnvoys);
      setStatementCounts(
        statements.reduce(
          (acc, { id, numberOfStatements }) => ({
            ...acc,
            [id]: numberOfStatements,
          }),
          {}
        )
      );
      setInterruptionCounts(
        interruptions.reduce(
          (acc, { id, numberOfInterruptions }) => ({
            ...acc,
            [id]: numberOfInterruptions,
          }),
          {}
        )
      );
    })();
  }, []);

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

  const sortedEnvoys = [...filterEnvoys(envoys)].sort((a, b) => {
    const m = sortDirection === "desc" ? 1 : -1;
    switch (sortField) {
      case "votes":
        return (
          m * ((Number(b.numberOfVotes) || 0) - (Number(a.numberOfVotes) || 0))
        );
      case "statements":
        return (
          m * ((statementCounts[b.id] || 0) - (statementCounts[a.id] || 0))
        );
      case "interruptions":
        return (
          m *
          ((interruptionCounts[b.id] || 0) - (interruptionCounts[a.id] || 0))
        );
      default:
        return 0;
    }
  });

  const clubs = [...new Set(envoys.map((e) => e.club).filter(Boolean))];

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
        professions={getProfessionCounts(envoys)}
        onSearchChange={setSearchTerm}
        onClubChange={setSelectedClub}
        onActivityChange={setActivityFilter}
        onDistrictChange={setSelectedDistrict}
        onProfessionsChange={setSelectedProfessions}
        selectedProfessions={selectedProfessions}
        onSortChange={(field, direction) => {
          setSortField(field);
          setSortDirection(direction);
        }}
      />

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sortedEnvoys.map((envoy) => {
          const displayValue = (() => {
            switch (sortField) {
              case "votes":
                return `Głosy: ${envoy.numberOfVotes || "Brak danych"}`;
              case "statements":
                return `Wypowiedzi: ${statementCounts[envoy.id] || 0}`;
              case "interruptions":
                return `Przerywania: ${interruptionCounts[envoy.id] || 0}`;
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
        })}
      </div>
    </>
  );
}

export default function EnvoysPage() {
  return (
    <>
      <h1 className="text-3xl font-bold mb-8">Posłowie</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <EnvoysList />
      </Suspense>
    </>
  );
}
