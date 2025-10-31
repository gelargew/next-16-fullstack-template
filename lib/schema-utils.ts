import { z } from 'zod'
import type { FilterConfig } from '@/hooks/useQueryFilters'

// Utility to create type-safe query parameter schemas
export function createQueryParamsSchema<T extends Record<string, any>>(
  config: FilterConfig<T>
): z.ZodObject<any> {
  const schemaFields: Record<string, any> = {
    page: z.coerce.number().min(1).default(1),
    pageSize: z.coerce.number().min(1).max(100).default(config.pagination?.defaultPageSize || 10),
    sortField: z.enum(Object.keys(config.sorting) as [string, ...string[]]).default(Object.keys(config.sorting)[0]),
    sortDirection: z.enum(['asc', 'desc']).default('desc'),
  }

  // Add filter fields to schema
  Object.entries(config.filters).forEach(([key, filterConfig]) => {
    switch (filterConfig.type) {
      case 'search':
        schemaFields[key] = z.string().optional()
        break
      case 'boolean':
        schemaFields[key] = z.boolean().optional()
        break
      case 'select':
        if (filterConfig.options) {
          const values = filterConfig.options.map(opt => opt.value).filter(v => v !== 'all')
          if (values.length > 0) {
            schemaFields[key] = z.enum(values as [string, ...string[]]).optional()
          }
        }
        break
      case 'multiselect':
        schemaFields[key] = z.array(z.string()).optional()
        break
      case 'daterange':
        schemaFields[key] = z.object({
          from: z.string().optional(),
          to: z.string().optional(),
        }).optional()
        break
    }
  })

  return z.object(schemaFields)
}

// Utility to sanitize query parameters for API calls
export function sanitizeQueryParams<T extends Record<string, any>>(
  params: T,
  config: FilterConfig<T>
): Record<string, any> {
  const sanitized: Record<string, any> = {}

  // Add pagination and sorting
  sanitized.page = params.page || 1
  sanitized.pageSize = params.pageSize || (config.pagination?.defaultPageSize || 10)
  sanitized.sortField = params.sortField || Object.keys(config.sorting)[0]
  sanitized.sortDirection = params.sortDirection || 'desc'

  // Add filters
  Object.entries(config.filters).forEach(([key, filterConfig]) => {
    const value = params[key]

    // Skip undefined, null, empty, or 'all' values
    if (value !== undefined && value !== null && value !== '' && value !== 'all') {
      // Convert types based on filter type
      switch (filterConfig.type) {
        case 'boolean':
          sanitized[key] = value === true || value === 'true'
          break
        case 'search':
        case 'select':
          sanitized[key] = value
          break
        case 'multiselect':
          if (Array.isArray(value) && value.length > 0) {
            sanitized[key] = value
          }
          break
        case 'daterange':
          if (value && typeof value === 'object') {
            sanitized[key] = value
          }
          break
        default:
          sanitized[key] = value
      }
    }
  })

  return sanitized
}

// Helper to check if a field is a valid sort field
export function isValidSortField<T>(
  field: string,
  config: FilterConfig<T>
): boolean {
  return Object.keys(config.sorting).includes(field) && field in config.sorting
}