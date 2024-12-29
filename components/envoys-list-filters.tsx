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
  onActivityChange: (value: 'active' | 'inactive' | 'all') => void;
}

export function EnvoysListFilters({ 
  clubs, 
  onSearchChange, 
  onClubChange,
  onActivityChange 
}: EnvoysListFiltersProps) {
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
    </div>
  );
}
