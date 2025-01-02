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
import { X } from "lucide-react";

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

  const handlePostalCode = (value: string) => {
    const cleanValue = value.replace(/[^0-9]/g, "");
    const formattedValue =
      cleanValue.length > 2
        ? `${cleanValue.slice(0, 2)}-${cleanValue.slice(2)}`
        : cleanValue;

    const district =
      cleanValue.length >= 2 ? getDistrictFromPostalCode(cleanValue) : null;
    setCurrentDistrict(district);
    onDistrictChange(district);

    return formattedValue.slice(0, 6);
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

  const handleSortChange = (value: SortField) => {
    onSortChange(value);
  };

  return (
    <div className="p-3 mb-8">
      <div className="flex items-center gap-4 flex-wrap">
        <Input
          placeholder="Szukaj posła..."
          className="w-48"
          onChange={(e) => onSearchChange(e.target.value)}
        />

        <Select onValueChange={onClubChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Klub poselski" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie kluby</SelectItem>
            {clubs.map((club) => (
              <SelectItem key={club} value={club}>
                {club}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          defaultValue="active"
          onValueChange={(value: ActivityStatus) => onActivityChange(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {["active", "inactive", "all"].map((status) => (
              <SelectItem key={status} value={status}>
                {status === "active"
                  ? "Tylko aktywni"
                  : status === "inactive"
                  ? "Tylko nieaktywni"
                  : "Wszyscy"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Input
            placeholder="2 cyfry kodu pocztowego"
            className="w-56"
            onChange={(e) =>
              (e.target.value = handlePostalCode(e.target.value))
            }
            maxLength={6}
          />
          {currentDistrict && (
            <Badge variant="secondary">okręg: {currentDistrict}</Badge>
          )}
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 border-dashed">
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
                        <span className="flex-grow text-left">{prof.name}</span>
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

        <Select defaultValue="votes" onValueChange={handleSortChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sortuj według" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="votes">Liczba głosów</SelectItem>
            <SelectItem value="statements">Liczba wypowiedzi</SelectItem>
            <SelectItem value="interruptions">Liczba przerywań</SelectItem>
          </SelectContent>
        </Select>

        {selectedProfessions.length > 0 && (
          <div className="flex flex-wrap gap-1">
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
  );
}
