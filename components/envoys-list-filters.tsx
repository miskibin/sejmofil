"use client";

import { Input } from "@/components/ui/input";
import { getDistrictFromPostalCode } from "@/lib/utils/districts";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { X, Filter } from "lucide-react";

type ActivityStatus = "active" | "inactive" | "all";
type ProfessionCount = { name: string; count: number };
type SortField = "votes" | "statements" | "interruptions";

interface EnvoysListFiltersProps {
  clubs: string[];
  professions: ProfessionCount[];
  onSearchChange: (value: string) => void;
  onClubChange: (value: string) => void;
  onActivityChange: (value: ActivityStatus) => void;
  onDistrictChange: (value: string | null) => void;
  onProfessionsChange: (value: string[]) => void;
  selectedProfessions: string[];
  onSortChange: (field: SortField) => void;
}

export function EnvoysListFilters({
  clubs,
  professions,
  onSearchChange,
  onClubChange,
  onActivityChange,
  onDistrictChange,
  onProfessionsChange,
  selectedProfessions,
  onSortChange,
}: EnvoysListFiltersProps) {
  const [currentDistrict, setCurrentDistrict] = useState<string | null>(null);
  const [professionFilter, setProfessionFilter] = useState("");
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);

  const handlePostalCode = (value: string) => {
    let clean = value.replace(/[^0-9]/g, "").slice(0, 6);
    if (clean.length > 2) clean = clean.slice(0, 2) + "-" + clean.slice(2);
    const district =
      clean.replace("-", "").length >= 2
        ? getDistrictFromPostalCode(clean.replace("-", ""))
        : null;
    setCurrentDistrict(district);
    onDistrictChange(district);
    return clean;
  };

  const toggleProfession = (profName: string) => {
    onProfessionsChange(
      selectedProfessions.includes(profName)
        ? selectedProfessions.filter((p) => p !== profName)
        : [...selectedProfessions, profName]
    );
  };

  const filteredProfessions = professions.filter((prof) =>
    prof.name.toLowerCase().includes(professionFilter.toLowerCase())
  );

  const filterButtonConfigs = [
    {
      type: "select",
      props: {
        placeholder: "Klub poselski",
        onChange: onClubChange,
        options: [
          { value: "all", label: "Wszystkie kluby" },
          ...clubs.map((club) => ({ value: club, label: club })),
        ],
      },
    },
    {
      type: "select",
      props: {
        placeholder: "Status",
        defaultValue: "active",
        onChange: onActivityChange,
        options: [
          { value: "active", label: "Tylko aktywni" },
          { value: "inactive", label: "Tylko nieaktywni" },
          { value: "all", label: "Wszyscy" },
        ],
      },
    },
    {
      type: "select",
      props: {
        placeholder: "Sortuj według",
        defaultValue: "votes",
        onChange: onSortChange,
        options: [
          { value: "votes", label: "Liczba głosów" },
          { value: "statements", label: "Liczba wypowiedzi" },
          { value: "interruptions", label: "Liczba przerywań" },
        ],
      },
    },
  ];

  return (
    <div className="space-y-4 p-3 mb-8">
      <div className="flex gap-2 items-center">
        <Input
          placeholder="Szukaj posła..."
          className="flex-1 md:flex-none md:w-48"
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsFiltersVisible(!isFiltersVisible)}
          className="flex items-center gap-2"
        >
          <Filter className={isFiltersVisible ? "text-primary" : ""} />
          <span className="hidden md:inline">Filtry</span>
        </Button>
      </div>

      {isFiltersVisible && (
        <div className="flex flex-col md:flex-row flex-wrap gap-2">
          {filterButtonConfigs.map((config, idx) => (
            <Select key={idx} onValueChange={config.props.onChange}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder={config.props.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {config.props.options.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Input
              placeholder="Kod pocztowy"
              onChange={(e) =>
                (e.target.value = handlePostalCode(e.target.value))
              }
              maxLength={6}
              className="w-full md:w-[180px]"
            />
            {currentDistrict && (
              <Badge variant="secondary" className="whitespace-nowrap">
                okręg: {currentDistrict}
              </Badge>
            )}
          </div>

          <div className="w-full md:w-auto">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 border-dashed"
                >
                  Zawody
                  {selectedProfessions.length > 0 && (
                    <>
                      <Separator orientation="vertical" className="mx-2 h-4" />
                      <Badge
                        variant="secondary"
                        className="rounded-sm px-1 font-normal"
                      >
                        {selectedProfessions.length}
                      </Badge>
                    </>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-2" align="start">
                <div className="flex flex-col gap-2">
                  <Input
                    placeholder="Szukaj zawodu..."
                    value={professionFilter}
                    onChange={(e) => setProfessionFilter(e.target.value)}
                    className="mb-2"
                  />
                  <div className="max-h-[300px] overflow-y-auto">
                    {filteredProfessions.length === 0 ? (
                      <p className="text-sm text-center py-4 text-muted-foreground">
                        Nie znaleziono zawodów
                      </p>
                    ) : (
                      <div className="flex flex-col gap-1">
                        {filteredProfessions.map((prof) => (
                          <button
                            key={prof.name}
                            onClick={() => toggleProfession(prof.name)}
                            className="flex items-center gap-2 px-2 py-1.5 hover:bg-primary/20 rounded-sm text-sm"
                          >
                            <div
                              className={`flex h-4 w-4 items-center justify-center rounded-sm border border-primary ${
                                selectedProfessions.includes(prof.name)
                                  ? "bg-primary text-primary-foreground"
                                  : "opacity-50"
                              }`}
                            >
                              {selectedProfessions.includes(prof.name) && "✓"}
                            </div>
                            <span className="flex-grow text-left">
                              {prof.name}
                            </span>
                            <span className="text-muted-foreground">
                              ({prof.count})
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {selectedProfessions.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {selectedProfessions.map((prof) => (
                  <Badge
                    key={prof}
                    variant="default"
                    className="cursor-pointer p-2"
                    onClick={() => toggleProfession(prof)}
                  >
                    {prof} <X size={16} className="ml-1" />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
