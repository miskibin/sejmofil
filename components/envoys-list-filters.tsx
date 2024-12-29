'use client';

import { Input } from "@/components/ui/input";
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
}

export function EnvoysListFilters({ clubs, onSearchChange, onClubChange }: EnvoysListFiltersProps) {
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
          {clubs.map(club => (
            <SelectItem key={club} value={club}>
              {club}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
