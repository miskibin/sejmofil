'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FilterField, type FilterConfig } from '@/components/filter-components'
import { getDistrictFromPostalCode } from '@/lib/utils/districts'
import { Filter } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'

export type ActivityStatus = 'active' | 'inactive' | 'all'
type ProfessionCount = { name: string; count: number }
export type SortField =
  | 'votes'
  | 'absents'
  | 'statements'
  | 'interruptions'
  | 'none'
  | null

interface EnvoysListFiltersProps {
  clubs: string[]
  professions: ProfessionCount[]
  onSearchChange: (value: string) => void
  onClubChange: (value: string) => void
  onActivityChange: (value: ActivityStatus) => void
  onDistrictChange: (value: string | null) => void
  onProfessionsChange: (value: string[]) => void
  selectedProfessions: string[]
  onSortChange: (field: SortField) => void
}

const RANKING_OPTIONS = {
  none: 'Alfabetycznie',
  votes: 'Liczba głosów',
  absents: 'Liczba nieobecności',
  statements: 'Liczba wypowiedzi',
  interruptions: 'Liczba okrzyków',
} as const

const STATUS_OPTIONS = {
  active: 'Tylko aktywni',
  inactive: 'Tylko nieaktywni',
  all: 'Wszyscy',
} as const

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
  const searchParams = useSearchParams()
  const [currentDistrict, setCurrentDistrict] = useState<string | null>(null)
  const [professionFilter, setProfessionFilter] = useState('')
  const [isFiltersVisible, setIsFiltersVisible] = useState(false)

  const handlePostalCode = (value: string) => {
    let clean = value.replace(/[^0-9]/g, '').slice(0, 6)
    if (clean.length > 2) clean = clean.slice(0, 2) + '-' + clean.slice(2)
    const district =
      clean.replace('-', '').length >= 2
        ? getDistrictFromPostalCode(clean.replace('-', ''))
        : null
    setCurrentDistrict(district)
    onDistrictChange(district)
    return clean
  }

  const toggleProfession = (profName: string) => {
    onProfessionsChange(
      selectedProfessions.includes(profName)
        ? selectedProfessions.filter((p) => p !== profName)
        : [...selectedProfessions, profName]
    )
  }

  const filterConfigs: FilterConfig[] = [
    {
      label: 'Klub parlamentarny',
      placeholder: 'Wybierz klub',
      type: 'select',
      onChange: (value) => onClubChange(value as string),
      options: [
        { value: 'all', label: 'Wszystkie kluby' },
        ...clubs.map((club) => ({ value: club, label: club })),
      ],
    },
    {
      label: 'Status posła',
      placeholder: 'Wybierz status',
      type: 'select',
      defaultValue: 'active',
      onChange: (value) => onActivityChange(value as ActivityStatus),
      options: Object.entries(STATUS_OPTIONS).map(([value, label]) => ({
        value,
        label,
      })),
    },
    {
      label: 'Okręg wyborczy',
      placeholder: 'Kod pocztowy',
      type: 'postal',
      onChange: handlePostalCode,
      badge: currentDistrict ? `okręg: ${currentDistrict}` : undefined,
    },
    {
      label: 'Zawód',
      placeholder: 'Wybierz zawody',
      type: 'professions',
      onChange: toggleProfession,
      badge: selectedProfessions.length || undefined,
      options: professions
        .filter((prof) =>
          prof.name.toLowerCase().includes(professionFilter.toLowerCase())
        )
        .map((prof) => ({
          value: prof.name,
          label: prof.name,
        })),
    },
  ]

  const currentRanking = searchParams?.get('ranking')
  const rankingLabel =
    currentRanking && currentRanking !== 'none'
      ? RANKING_OPTIONS[currentRanking as keyof typeof RANKING_OPTIONS]
      : null

  return (
    <div className="mb-8 space-y-4 p-3">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Szukaj posła lub funkcji..."
          className="flex-1 md:w-48 md:flex-none"
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <div className="flex items-center gap-2">
          <Select
            defaultValue={searchParams?.get('ranking') || 'none'}
            onValueChange={(value) => onSortChange(value as SortField)}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Sortowanie">
                {RANKING_OPTIONS[
                  searchParams?.get('ranking') as keyof typeof RANKING_OPTIONS
                ] || 'Alfabetycznie'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(RANKING_OPTIONS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="default"
            size="sm"
            onClick={() => setIsFiltersVisible(!isFiltersVisible)}
            className="flex items-center gap-2"
          >
            <Filter className={isFiltersVisible ? 'text-white' : ''} />
            <span className="hidden md:inline">Filtry</span>
          </Button>
          {rankingLabel && (
            <Badge variant="secondary" className="hidden md:inline-flex">
              sortowanie: {rankingLabel}
            </Badge>
          )}
        </div>
      </div>

      {isFiltersVisible && (
        <>
          <div className="flex flex-col flex-wrap gap-4 md:flex-row">
            {filterConfigs.map((config) => (
              <FilterField
                key={config.placeholder}
                config={config}
                searchValue={professionFilter}
                onSearchChange={setProfessionFilter}
              />
            ))}
          </div>
          {searchParams?.get('ranking') !== 'none' &&
            searchParams?.get('ranking') && (
              <p className="mt-2 text-sm italic text-muted-foreground">
                * ranking dotyczy wszystkich posłów 10 kadencji (włącznie z
                nieaktywnymi)
              </p>
            )}
        </>
      )}
    </div>
  )
}
