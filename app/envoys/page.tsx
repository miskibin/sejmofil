"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Ban } from "lucide-react"; // Import the icon for inactive envoys
import { CardWrapper } from "@/components/ui/card-wrapper";
import { EnvoysListFilters } from "@/components/envoys-list-filters";
import { cn } from "@/lib/utils";
import { getAllEnvoys } from "@/lib/queries/person";
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

  useEffect(() => {
    const fetchEnvoys = async () => {
      const data = await getAllEnvoys();
      setEnvoys(data);
    };
    fetchEnvoys();
  }, []);

  const getProfessionCounts = (envoys: EnvoyShort[]): { name: string; count: number }[] => {
    const counts = new Map<string, number>();
    
    envoys.forEach(envoy => {
      const professions = envoy.profession?.split(',').map(p => p.trim()) || [];
      professions.forEach(prof => {
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
      selectedProfessions.some(prof => 
        envoy.profession?.split(',').map(p => p.trim()).includes(prof)
      );

    return (
      matchesSearch && 
      matchesClub && 
      matchesActivity && 
      matchesDistrict && 
      matchesProfession
    );
  });

  const clubs = [...new Set(envoys.map((e) => e.club).filter(Boolean))];
  const professionCounts = getProfessionCounts(envoys);

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
      />

      <div className="mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredEnvoys.map((envoy) => {
            const fullName = `${envoy.firstName} ${envoy.lastName}`;
            const truncatedName =
              fullName.length > 20 ? fullName.substring(0, 17) + "..." : fullName;

            return (
              <Link key={envoy.id} href={`/envoys/${envoy.id}`}>
                <CardWrapper
                  title={envoy.club || ""}
                  subtitle={truncatedName}
                  showSource={false}
                  showDate={false}
                  showGradient={false}
                  headerIcon={
                    !envoy.active && <Ban className="text-destructive" />
                  }
                  className={cn(
                    "hover:shadow-lg transition-shadow duration-200",
                    Number(envoy.numberOfVotes) > 100000 &&
                      "border-primary border-2"
                  )}
                >
                  <div className="flex items-center space-x-4">
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
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {envoy.profession || "Brak danych"}
                      </p>
                      <p
                        className={cn(
                          "text-sm",
                          Number(envoy.numberOfVotes) > 500000
                            ? "text-primary font-semibold"
                            : "text-muted-foreground"
                        )}
                      >
                        Głosy: {envoy.numberOfVotes || "Brak danych"}
                      </p>
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
