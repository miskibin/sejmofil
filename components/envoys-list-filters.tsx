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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Card } from "./ui/card";

// Add ProfessionCount type
type ProfessionCount = {
  name: string;
  count: number;
};

interface EnvoysListFiltersProps {
  clubs: string[];
  professions: ProfessionCount[];
  onSearchChange: (value: string) => void;
  onClubChange: (value: string) => void;
  onActivityChange: (value: "active" | "inactive" | "all") => void;
  onDistrictChange: (value: string | null) => void;
  onProfessionsChange: (value: string[]) => void;
  selectedProfessions: string[];
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
}: EnvoysListFiltersProps) {
  const [currentDistrict, setCurrentDistrict] = useState<string | null>(null);

  const handlePostalCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    let cleanValue = value.replace(/[^0-9]/g, "");

    // Format postal code as XX-XXX
    if (cleanValue.length > 2) {
      cleanValue = cleanValue.slice(0, 2) + "-" + cleanValue.slice(2);
    }

    e.target.value = cleanValue.slice(0, 6); // Limit to XX-XXX format

    if (cleanValue.length >= 2) {
      const district = getDistrictFromPostalCode(cleanValue);
      setCurrentDistrict(district);
      onDistrictChange(district);
    } else {
      setCurrentDistrict(null);
      onDistrictChange(null);
    }
  };

  return (
    <Card className="p-3 mb-8">
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
        <Select defaultValue="active" onValueChange={onActivityChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Tylko aktywni</SelectItem>
            <SelectItem value="inactive">Tylko nieaktywni</SelectItem>
            <SelectItem value="all">Wszyscy</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <Input
            placeholder="2 cyfry kodu pocztowego"
            className="w-56"
            onChange={handlePostalCodeChange}
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
          <PopoverContent className="w-[200px] p-0" align="start">
            <Command shouldFilter={false}>
              <CommandInput placeholder="Szukaj zawodu..." />
              <CommandList>
                <CommandEmpty>Nie znaleziono zawodów</CommandEmpty>
                <CommandGroup>
                  {professions.map((prof) => (
                    <CommandItem
                      key={prof.name}
                      onSelect={() => {
                        const isSelected = selectedProfessions.includes(
                          prof.name
                        );
                        onProfessionsChange(
                          isSelected
                            ? selectedProfessions.filter((p) => p !== prof.name)
                            : [...selectedProfessions, prof.name]
                        );
                      }}
                    >
                      <div
                        className={`mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary ${
                          selectedProfessions.includes(prof.name)
                            ? "bg-primary text-primary-foreground"
                            : "opacity-50"
                        }`}
                      >
                        {selectedProfessions.includes(prof.name) && (
                          <span>✓</span>
                        )}
                      </div>
                      <span>{prof.name}</span>
                      <span className="ml-auto ">({prof.count})</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {selectedProfessions.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {selectedProfessions.map((prof) => (
              <Badge
                key={prof}
                variant="default"
                className="cursor-pointer"
                onClick={() => {
                  onProfessionsChange(
                    selectedProfessions.filter((p) => p !== prof)
                  );
                }}
              >
                {prof} ×
              </Badge>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
