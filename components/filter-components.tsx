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

export interface FilterOption {
  value: string
  label: string
}

export interface FilterConfig {
  label: string
  placeholder: string
  type: 'select' | 'postal' | 'professions' | 'checkbox'
  onChange: ((value: string) => void | string) | ((value: string) => void)
  options?: FilterOption[]
  defaultValue?: string
  badge?: string | number
}

interface SelectFilterProps {
  config: FilterConfig
}

/**
 * Select dropdown filter
 */
export const SelectFilter = ({ config }: SelectFilterProps) => (
  <Select defaultValue={config.defaultValue} onValueChange={config.onChange}>
    <SelectTrigger className="w-full md:w-[180px]">
      <SelectValue placeholder={config.placeholder} />
    </SelectTrigger>
    <SelectContent>
      {config.options?.map(({ value, label }) => (
        <SelectItem key={value} value={value}>
          {label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
)

/**
 * Postal code input filter
 */
export const PostalFilter = ({ config }: SelectFilterProps) => (
  <div className="flex items-center gap-2">
    <Input
      placeholder={config.placeholder}
      onChange={(e) => config.onChange(e.target.value)}
      maxLength={6}
      className="w-full md:w-[180px]"
    />
    {config.badge && (
      <Badge variant="secondary" className="whitespace-nowrap">
        {config.badge}
      </Badge>
    )}
  </div>
)

interface ProfessionFilterProps {
  config: FilterConfig
  searchValue: string
  onSearchChange: (value: string) => void
}

/**
 * Checkbox list filter with search (used for professions)
 */
export const CheckboxListFilter = ({
  config,
  searchValue,
  onSearchChange,
}: ProfessionFilterProps) => {
  const filteredOptions =
    config.options?.filter((opt) =>
      opt.label.toLowerCase().includes(searchValue.toLowerCase())
    ) ?? []

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 w-[180px] justify-between border-dashed"
        >
          {config.placeholder}
          {config.badge && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal"
              >
                {config.badge}
              </Badge>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="start">
        <div className="flex flex-col gap-2">
          <Input
            placeholder="Szukaj..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="mb-2"
          />
          <div className="max-h-[300px] overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Nie znaleziono opcji
              </p>
            ) : (
              <div className="flex flex-col gap-1">
                {filteredOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => config.onChange(opt.value)}
                    className="px-2 py-2 text-left text-sm hover:bg-accent"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

/**
 * Generic filter renderer
 */
export const FilterField = ({
  config,
  searchValue,
  onSearchChange,
}: ProfessionFilterProps) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-medium text-muted-foreground">
      {config.label}
    </label>
    {config.type === 'select' && <SelectFilter config={config} />}
    {config.type === 'postal' && <PostalFilter config={config} />}
    {config.type === 'professions' && (
      <CheckboxListFilter
        config={config}
        searchValue={searchValue}
        onSearchChange={onSearchChange}
      />
    )}
  </div>
)
