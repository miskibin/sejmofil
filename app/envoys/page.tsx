"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Ban } from "lucide-react"; // Import the icon for inactive envoys
import { CardWrapper } from "@/components/ui/card-wrapper";
import { EnvoysListFilters } from "@/components/envoys-list-filters";
import {
  getAllEnvoys,
  getPersonStatementCounts,
  getPersonInterruptionsCount,
} from "@/lib/queries/person";
import { EnvoyShort } from "@/lib/types/person";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

  const handleSort = (
    field: typeof sortField,
    direction: typeof sortDirection
  ) => {
    setSortField(field);
    setSortDirection(direction);
  };

  const [statementCounts, setStatementCounts] = useState<
    Record<string, number>
  >({});
  const [interruptionCounts, setInterruptionCounts] = useState<
    Record<string, number>
  >({});

  useEffect(() => {
    const fetchData = async () => {
      const [envoys, statements, interruptions] = await Promise.all([
        getAllEnvoys(),
        getPersonStatementCounts(),
        getPersonInterruptionsCount(),
      ]);

      setEnvoys(envoys);
      setStatementCounts(
        statements.reduce(
          (acc, curr) => ({
            ...acc,
            [curr.id]: curr.numberOfStatements,
          }),
          {}
        )
      );
      setInterruptionCounts(
        interruptions.reduce(
          (acc, curr) => ({
            ...acc,
            [curr.id]: curr.numberOfInterruptions,
          }),
          {}
        )
      );
    };
    fetchData();
  }, []);

  const getProfessionCounts = (
    envoys: EnvoyShort[]
  ): { name: string; count: number }[] => {
    const counts = new Map<string, number>();

    envoys.forEach((envoy) => {
      const professions =
        envoy.profession?.split(",").map((p) => p.trim()) || [];
      professions.forEach((prof) => {
        if (prof) {
          counts.set(prof, (counts.get(prof) || 0) + 1);
        }
      });
    });

    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  };

  // Filter envoys based on all criteria
  const filteredEnvoys = envoys.filter((envoy) => {
    const matchesSearch = `${envoy.firstName} ${envoy.lastName}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesClub = selectedClub === "all" || envoy.club === selectedClub;
    const matchesActivity =
      activityFilter === "all" ||
      (activityFilter === "active" && envoy.active) ||
      (activityFilter === "inactive" && !envoy.active);
    const matchesDistrict =
      !selectedDistrict || envoy.districtName === selectedDistrict;
    const matchesProfession =
      selectedProfessions.length === 0 ||
      selectedProfessions.some((prof) =>
        envoy.profession
          ?.split(",")
          .map((p) => p.trim())
          .includes(prof)
      );

    return (
      matchesSearch &&
      matchesClub &&
      matchesActivity &&
      matchesDistrict &&
      matchesProfession
    );
  });

  const sortedEnvoys = [...filteredEnvoys].sort((a, b) => {
    const multiplier = sortDirection === "desc" ? 1 : -1;
    switch (sortField) {
      case "votes":
        return (
          multiplier *
          ((Number(b.numberOfVotes) || 0) - (Number(a.numberOfVotes) || 0))
        );
      case "statements":
        return (
          multiplier *
          ((statementCounts[b.id] || 0) - (statementCounts[a.id] || 0))
        );
      case "interruptions":
        return (
          multiplier *
          ((interruptionCounts[b.id] || 0) - (interruptionCounts[a.id] || 0))
        );
      default:
        return 0;
    }
  });

  const getSortValue = (envoy: EnvoyShort) => {
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
  };

  const clubs = [...new Set(envoys.map((e) => e.club).filter(Boolean))];
  const professionCounts = getProfessionCounts(envoys);

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength
      ? text.substring(0, maxLength - 1) + "…"
      : text;
  };

  return (
    <>
      <EnvoysListFilters
        clubs={clubs}
        professions={professionCounts}
        onSearchChange={setSearchTerm}
        onClubChange={setSelectedClub}
        onActivityChange={setActivityFilter}
        onDistrictChange={setSelectedDistrict}
        onProfessionsChange={setSelectedProfessions}
        selectedProfessions={selectedProfessions}
        onSortChange={handleSort}
      />

      <div className="mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sortedEnvoys.map((envoy) => {
            const fullName = `${envoy.firstName} ${envoy.lastName}`;
            const truncatedName =
              fullName.length > 20
                ? fullName.substring(0, 17) + "..."
                : fullName;

            return (
              <Link key={envoy.id} href={`/envoys/${envoy.id}`}>
                <CardWrapper
                  title={envoy.club || ""}
                  subtitle={truncatedName}
                  showSource={false}
                  showDate={false}
                  showGradient={false}
                  headerIcon={
                    <>
                      {!envoy.active && <Ban className="text-destructive" />}
                      {envoy.role &&
                        envoy.role !== "Poseł" &&
                        envoy.role != "envoy" && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge
                                  variant="secondary"
                                  className="ml-2 max-w-[120px] truncate"
                                >
                                  {truncateText(envoy.role, 15)}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{envoy.role}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                    </>
                  }
                  className="hover:shadow-lg transition-shadow duration-200"
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="w-16 h-20 relative flex-shrink-0">
                        <Image
                          src={`${
                            process.env.NEXT_PUBLIC_API_BASE_URL ||
                            "https://api.sejm.gov.pl/sejm/term10"
                          }/MP/${envoy.id}/photo`}
                          alt={fullName}
                          fill
                          sizes="60px"
                          className="rounded-lg object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-muted-foreground truncate">
                          {envoy.profession || "Brak danych"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {getSortValue(envoy)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardWrapper>
              </Link>
            );
          })}
        </div>
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
