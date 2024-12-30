"use client";

import { Input } from "@/components/ui/input";
import { getDistrictFromPostalCode } from "@/lib/utils/districts";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EnvoysListFiltersProps {
  clubs: string[];
  onSearchChange: (value: string) => void;
  onClubChange: (value: string) => void;
  onActivityChange: (value: "active" | "inactive" | "all") => void;
  onDistrictChange: (value: string | null) => void;
}

export function EnvoysListFilters({
  clubs,
  onSearchChange,
  onClubChange,
  onActivityChange,
  onDistrictChange,
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
    <div className="flex flex-col md:flex-row gap-4">
      <Input
        placeholder="Szukaj posła..."
        className="max-w-sm"
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
      <div className="flex flex-row gap-2 items-center">
        <Input
          placeholder="2 cyfry kodu pocztowego"
          className="w-[240px]"
          onChange={handlePostalCodeChange}
          maxLength={6}
        />
        {currentDistrict && (
          <Badge variant="secondary">okręg: {currentDistrict}</Badge>
        )}
      </div>
    </div>
  );
}
