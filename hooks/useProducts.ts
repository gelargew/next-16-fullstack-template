"use client"

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  getProducts,
  createProduct as createProductAction,
  updateProduct as updateProductAction,
  deleteProduct as deleteProductAction,
  toggleProductActive
} from '@/actions/products'
import { useQueryFilters } from '@/hooks/useQueryFilters'
import { productsFilterConfig, type ProductFilters } from '@/configs/productsFilters'
import { type Product } from '@/server/db/schema/products'

export function useProducts() {
  const queryClient = useQueryClient()

  // Use the filter system
  const filters = useQueryFilters<ProductFilters>(productsFilterConfig)

  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['products', filters.getQueryParams()],
    queryFn: async () => {
      return await getProducts(filters.getQueryParams())
    },
    staleTime: 30000, // 30 seconds
    gcTime: 60000, // 1 minute (garbage collection time)
  })

  const createProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>) => {
    const formData = new FormData()
    formData.append('name', productData.name)
    formData.append('sku', productData.sku)
    formData.append('price', productData.price.toString())
    if (productData.description) formData.append('description', productData.description)
    formData.append('active', productData.active.toString())

    const result = await createProductAction(formData)

    if (!result.success) {
      throw new Error(result.error || 'Failed to create product')
    }

    toast.success('Product created successfully')
    queryClient.invalidateQueries({ queryKey: ['products'] })
    refetch()

    return result.data
  }

  const updateProductFn = async (id: string, productData: Partial<Product>) => {
    const formData = new FormData()
    if (productData.name !== undefined) formData.append('name', productData.name)
    if (productData.sku !== undefined) formData.append('sku', productData.sku)
    if (productData.price !== undefined) formData.append('price', productData.price.toString())
    if (productData.description !== undefined) formData.append('description', productData.description || '')
    if (productData.active !== undefined) {
      formData.append('active', productData.active.toString())
    }

    const result = await updateProductAction(id, formData)

    if (!result.success) {
      throw new Error(result.error || 'Failed to update product')
    }

    toast.success('Product updated successfully')
    queryClient.invalidateQueries({ queryKey: ['products'] })
    refetch()

    return result.data
  }

  const deleteProductFn = async (productId: string) => {
    const result = await deleteProductAction(productId)

    if (!result.success) {
      throw new Error(result.error || 'Failed to delete product')
    }

    toast.success('Product deleted successfully')
    queryClient.invalidateQueries({ queryKey: ['products'] })
    refetch()

    return result
  }

  const toggleActiveFn = async (productId: string, active: boolean) => {
    const result = await toggleProductActive(productId, active)

    if (!result.success) {
      throw new Error(result.error || 'Failed to update product status')
    }

    toast.success('Product status updated')
    queryClient.invalidateQueries({ queryKey: ['products'] })
    refetch()

    return result
  }

  return {
    // Data
    products: data?.data || [],
    pagination: data?.pagination || { page: 1, pageSize: 10, total: 0, totalPages: 0 },
    isLoading,
    error,
    refetch,

    // Filters
    filters,

    // Actions
    createProduct,
    updateProduct: updateProductFn,
    deleteProduct: deleteProductFn,
    toggleActive: toggleActiveFn,
  }
}

