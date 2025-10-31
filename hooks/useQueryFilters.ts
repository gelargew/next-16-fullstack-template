"use client"

import { useQueryState, useQueryStates } from 'nuqs'
import { parseAsBoolean, parseAsInteger, parseAsString } from 'nuqs'

// Base filter types
export interface FilterDefinition {
  type: 'search' | 'select' | 'multiselect' | 'daterange' | 'boolean'
  label?: string
  placeholder?: string
  options?: Array<{ value: string; label: string }>
  defaultValue?: any
}

export interface SortDefinition {
  label: string
  field: string
}

export interface PaginationConfig {
  defaultPageSize?: number
  pageSizes?: number[]
}

export interface FilterConfig<T> {
  filters: Record<keyof T, FilterDefinition>
  sorting: Record<string, SortDefinition>
  pagination?: PaginationConfig
}

// Generic filter state type
export type FilterState<T> = {
  [K in keyof T]: T[K]
} & {
  page?: number
  pageSize?: number
  sortField?: string
  sortDirection?: 'asc' | 'desc'
}

// Hook for managing query filters with nuqs
export function useQueryFilters<T extends Record<string, any>>(
  config: FilterConfig<T>
) {
  // Create initial state from config
  const getInitialState = (): any => {
    const state: any = {}

    // Set default filter values
    Object.entries(config.filters).forEach(([key, filter]) => {
      if (filter.defaultValue !== undefined) {
        state[key] = filter.defaultValue
      }
    })

    // Set default pagination
    state.page = 1
    state.pageSize = config.pagination?.defaultPageSize || 10
    state.sortField = Object.keys(config.sorting)[0] || 'createdAt'
    state.sortDirection = 'desc'

    return state
  }

  // Define parsers for each filter type
  const createParsers = () => {
    const parsers: Record<string, any> = {}

    // Add filter parsers
    Object.keys(config.filters).forEach(key => {
      const filter = config.filters[key as keyof T]
      switch (filter.type) {
        case 'boolean':
          parsers[key] = parseAsBoolean.withDefault(filter.defaultValue || false)
          break
        case 'search':
        case 'select':
        case 'multiselect':
          parsers[key] = parseAsString.withDefault(filter.defaultValue || '')
          break
        default:
          parsers[key] = parseAsString.withDefault(filter.defaultValue || '')
      }
    })

    // Add pagination parsers
    parsers.page = parseAsInteger.withDefault(1)
    parsers.pageSize = parseAsInteger.withDefault(config.pagination?.defaultPageSize || 10)
    parsers.sortField = parseAsString.withDefault(Object.keys(config.sorting)[0] || 'createdAt')
    parsers.sortDirection = parseAsString.withDefault('desc')

    return parsers
  }

  const parsers = createParsers()

  // Use nuqs for state management
  const [filters, setFilters] = useQueryStates(parsers)

  // Update functions for different filter types
  const updateFilter = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }))
  }

  const updateFilters = (newFilters: Partial<FilterState<T>>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1 // Reset to first page when filters change
    }))
  }

  const clearFilters = () => {
    const clearedState: Partial<FilterState<T>> = {}
    Object.keys(config.filters).forEach(key => {
      const filter = config.filters[key as keyof T]
      ;(clearedState as any)[key] = filter.defaultValue || (filter.type === 'boolean' ? false : '')
    })

    setFilters({
      ...clearedState,
      page: 1,
      pageSize: config.pagination?.defaultPageSize || 10
    })
  }

  const setPage = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

  const setPageSize = (pageSize: number) => {
    setFilters(prev => ({ ...prev, pageSize, page: 1 }))
  }

  const setSorting = (sortField: string, sortDirection: 'asc' | 'desc') => {
    setFilters(prev => ({
      ...prev,
      sortField,
      sortDirection,
      page: 1 // Reset to first page when sorting changes
    }))
  }

  // Get current filters as a clean object (for API calls)
  const getQueryParams = (): any => {
    const params: any = {}

    // Add filter values
    Object.keys(config.filters).forEach(key => {
      const value = filters[key]
      const filterConfig = config.filters[key as keyof T]

      // Skip 'all' values and empty values
      if (value !== undefined && value !== '' && value !== 'all' && value !== null) {
        // Convert string 'true'/'false' to boolean for boolean types
        if (filterConfig.type === 'boolean' && typeof value === 'string') {
          params[key] = value === 'true'
        } else {
          params[key] = value
        }
      }
    })

    // Add pagination and sorting
    params.page = filters.page || 1
    params.pageSize = filters.pageSize || (config.pagination?.defaultPageSize || 10)
    params.sortField = filters.sortField || Object.keys(config.sorting)[0]
    params.sortDirection = (filters.sortDirection as 'asc' | 'desc') || 'desc'

    return params
  }

  // Check if any non-default filters are active
  const hasActiveFilters = () => {
    const defaults = getInitialState()
    return Object.keys(config.filters).some(key => {
      const filter = config.filters[key as keyof T]
      const current = filters[key]
      const defaultValue = filter.defaultValue || (filter.type === 'boolean' ? false : '')
      return current !== defaultValue
    })
  }

  return {
    // Current state
    filters,
    config,

    // Update functions
    updateFilter,
    updateFilters,
    clearFilters,
    setPage,
    setPageSize,
    setSorting,

    // Utilities
    getQueryParams,
    hasActiveFilters,

    // Computed values
    currentPage: (filters.page as number) || 1,
    pageSize: (filters.pageSize as number) || (config.pagination?.defaultPageSize || 10),
    currentSortField: (filters.sortField as string) || Object.keys(config.sorting)[0],
    currentSortDirection: (filters.sortDirection as 'asc' | 'desc') || 'desc'
  }
}