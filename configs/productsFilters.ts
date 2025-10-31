import type { FilterConfig } from '@/hooks/useQueryFilters'
import type { Product } from '@/server/db/schema/products'

// Define the filter interface for products - auto-inferred from schema
export type ProductFilters = {
  search?: string
  active?: boolean
}

// Product filter configuration
export const productsFilterConfig: FilterConfig<ProductFilters> = {
  filters: {
    search: {
      type: 'search',
      label: 'Search',
      placeholder: 'Search products by name, SKU, or description...'
    },
    active: {
      type: 'select',
      label: 'Status',
      options: [
        { value: 'all', label: 'All Products' },
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Inactive' }
      ],
      defaultValue: 'all'
    }
  },
  sorting: {
    name: { label: 'Name', field: 'name' },
    sku: { label: 'SKU', field: 'sku' },
    price: { label: 'Price', field: 'price' },
    createdAt: { label: 'Created Date', field: 'createdAt' },
    updatedAt: { label: 'Last Updated', field: 'updatedAt' }
  },
  pagination: {
    defaultPageSize: 10,
    pageSizes: [10, 25, 50]
  }
}

