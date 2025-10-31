"use client"

import { useState } from "react"
import { Search, Filter, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useQueryFilters } from "@/hooks/useQueryFilters"

interface FilterBarProps<T extends Record<string, any>> {
  filters: ReturnType<typeof useQueryFilters<T>>
  showReset?: boolean
  className?: string
}

export function FilterBar<T extends Record<string, any>>({ filters, showReset = true, className = "" }: FilterBarProps<T>) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const { config, updateFilter, clearFilters, hasActiveFilters } = filters

  const renderFilter = (key: string, filterConfig: any) => {
    const currentValue = (filters.filters as any)[key]

    switch (filterConfig.type) {
      case 'search':
        return (
          <div key={key} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={filterConfig.placeholder || `Search ${filterConfig.label?.toLowerCase() || key}...`}
              value={currentValue || ''}
              onChange={(e) => updateFilter(key, e.target.value)}
              className="pl-9 w-full md:w-[300px]"
            />
          </div>
        )

      case 'select':
        return (
          <Select
            key={key}
            value={currentValue || ''}
            onValueChange={(value) => updateFilter(key, value)}
          >
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder={filterConfig.placeholder || `Select ${filterConfig.label?.toLowerCase() || key}...`} />
            </SelectTrigger>
            <SelectContent>
              {filterConfig.options?.map((option: { value: string; label: string }) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'boolean':
        return (
          <Select
            key={key}
            value={currentValue?.toString() || 'all'}
            onValueChange={(value) => updateFilter(key, value === 'all' ? null : value === 'true')}
          >
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder={filterConfig.placeholder || `Select ${filterConfig.label?.toLowerCase() || key}...`} />
            </SelectTrigger>
            <SelectContent>
              {filterConfig.options?.map((option: { value: string; label: string }) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      default:
        return null
    }
  }

  const getActiveFilterCount = () => {
    let count = 0
    Object.entries(config.filters).forEach(([key, filterConfig]) => {
      const currentValue = (filters.filters as any)[key]
      const defaultValue = filterConfig.defaultValue || ''
      if (currentValue !== undefined && currentValue !== defaultValue && currentValue !== '') {
        count++
      }
    })
    return count
  }

  const activeFilterCount = getActiveFilterCount()

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Primary filters (always visible) */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          {/* Render search filter if it exists */}
          {Object.entries(config.filters)
            .filter(([_, filter]) => filter.type === 'search')
            .map(([key, filter]) => renderFilter(key, filter))}

          {/* Show filter toggle or other primary filters */}
          {Object.keys(config.filters).length > 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          )}
        </div>

        {/* Reset button */}
        {showReset && hasActiveFilters() && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        )}
      </div>

      {/* Advanced filters (collapsible) */}
      {showAdvanced && Object.keys(config.filters).length > 1 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(config.filters)
            .filter(([_, filter]) => filter.type !== 'search')
            .map(([key, filter]) => renderFilter(key, filter))}
        </div>
      )}
    </div>
  )
}