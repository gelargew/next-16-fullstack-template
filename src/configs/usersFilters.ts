import type { FilterConfig } from '@/hooks/useQueryFilters'
import type { User } from '@/server/db/schema/auth'

// Define the filter interface for users - auto-inferred from schema
export type UserFilters = {
  search?: string
  emailVerified?: boolean
}

// User filter configuration
export const usersFilterConfig: FilterConfig<UserFilters> = {
  filters: {
    search: {
      type: 'search',
      label: 'Search',
      placeholder: 'Search users by name or email...'
    },
    emailVerified: {
      type: 'select',
      label: 'Verification Status',
      options: [
        { value: 'all', label: 'All Users' },
        { value: 'true', label: 'Verified' },
        { value: 'false', label: 'Unverified' }
      ],
      defaultValue: 'all'
    }
  },
  sorting: {
    name: { label: 'Name', field: 'name' },
    email: { label: 'Email', field: 'email' },
    createdAt: { label: 'Created Date', field: 'createdAt' },
    updatedAt: { label: 'Last Updated', field: 'updatedAt' }
  },
  pagination: {
    defaultPageSize: 10,
    pageSizes: [10, 25, 50]
  }
}