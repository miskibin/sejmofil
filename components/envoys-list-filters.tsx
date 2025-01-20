'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
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

interface FilterButtonConfig {
  label: string
  placeholder: string
  type: 'select' | 'postal' | 'professions'
  onChange: (value: string) => void
  options?: { value: string; label: string }[]
  defaultValue?: string
  badge?: string | number
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

  const filteredProfessions = professions.filter((prof) =>
    prof.name.toLowerCase().includes(professionFilter.toLowerCase())
  )

  const filterButtonConfigs: FilterButtonConfig[] = [
    {
      label: 'Klub parlamentarny',
      placeholder: 'Wybierz klub',
      type: 'select',
      onChange: (value) => onClubChange(value),
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
      options: filteredProfessions.map((prof) => ({
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
            {filterButtonConfigs.map(
              ({
                label,
                placeholder,
                type,
                onChange,
                options,
                defaultValue,
                badge,
              }) => (
                <div key={placeholder} className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-muted-foreground">
                    {label}
                  </label>
                  {type === 'select' && (
                    <Select
                      defaultValue={defaultValue}
                      onValueChange={onChange}
                    >
                      <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder={placeholder} />
                      </SelectTrigger>
                      <SelectContent>
                        {options?.map(({ value, label }) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {type === 'postal' && (
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder={placeholder}
                        onChange={(e) => onChange(e.target.value)}
                        maxLength={6}
                        className="w-full md:w-[180px]"
                      />
                      {badge && (
                        <Badge
                          variant="secondary"
                          className="whitespace-nowrap"
                        >
                          {badge}
                        </Badge>
                      )}
                    </div>
                  )}
                  {type === 'professions' && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 w-[180px] justify-between border-dashed"
                        >
                          {placeholder}
                          {badge && (
                            <>
                              <Separator
                                orientation="vertical"
                                className="mx-2 h-4"
                              />
                              <Badge
                                variant="secondary"
                                className="rounded-sm px-1 font-normal"
                              >
                                {badge}
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
                            onChange={(e) =>
                              setProfessionFilter(e.target.value)
                            }
                            className="mb-2"
                          />
                          <div className="max-h-[300px] overflow-y-auto">
                            {filteredProfessions.length === 0 ? (
                              <p className="py-4 text-center text-sm text-muted-foreground">
                                Nie znaleziono zawodów
                              </p>
                            ) : (
                              <div className="flex flex-col gap-1">
                                {filteredProfessions.map((prof) => (
                                  <button
                                    key={prof.name}
                                    onClick={() => toggleProfession(prof.name)}
                                    className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-primary/20"
                                  >
                                    <div
                                      className={`flex h-4 w-4 items-center justify-center rounded-sm border border-primary ${
                                        selectedProfessions.includes(prof.name)
                                          ? 'bg-primary text-primary-foreground'
                                          : 'opacity-50'
                                      }`}
                                    >
                                      {selectedProfessions.includes(
                                        prof.name
                                      ) && '✓'}
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
                  )}
                </div>
              )
            )}
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
