"use client"

import { useState, Suspense } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FilterBar, Pagination, SortSelector } from "@/components/filters"
import { ProductAddDialog } from "@/components/products/ProductAddDialog"
import { ProductEditDialog } from "@/components/products/ProductEditDialog"
import { ProductTable } from "@/components/products/ProductTable"
import { ProductTableSkeleton } from "@/components/products/ProductTableSkeleton"
import { useProducts } from "@/hooks/useProducts"
import { type Product } from "@/server/db/schema/products"

function ProductsContent() {
  const {
    products,
    pagination,
    isLoading,
    filters,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleActive,
    refetch
  } = useProducts()

  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const handleDelete = async (productId: string) => {
    await deleteProduct(productId)
  }

  const handleToggleActive = async (productId: string, active: boolean) => {
    await toggleActive(productId, active)
  }

  const handleProductCreated = async () => {
    refetch()
  }

  const handleUpdateProduct = async () => {
    setEditingProduct(null)
    refetch()
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header with Filters and Actions */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <FilterBar filters={filters} />
        <ProductAddDialog onProductCreated={handleProductCreated} />
      </div>

      {/* Sort Controls */}
      <div className="flex items-center justify-between">
        <SortSelector
          currentSortField={filters.currentSortField}
          currentSortDirection={filters.currentSortDirection}
          sortOptions={filters.config.sorting}
          onSortChange={filters.setSorting}
        />
      </div>

      {/* Products Table */}
      <ProductTable
        products={products}
        isLoading={isLoading}
        onEditProduct={setEditingProduct}
        onDeleteProduct={handleDelete}
        onToggleActive={handleToggleActive}
      />

      {/* Pagination */}
      <Pagination
        currentPage={filters.currentPage}
        totalPages={pagination.totalPages}
        pageSize={filters.pageSize}
        total={pagination.total}
        onPageChange={filters.setPage}
        onPageSizeChange={filters.setPageSize}
        pageSizes={filters.config.pagination?.pageSizes}
      />

      {/* Edit Dialog */}
      <ProductEditDialog
        product={editingProduct}
        onProductUpdated={handleUpdateProduct}
        onOpenChange={(open) => {
          if (!open) setEditingProduct(null)
        }}
      />
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductTableSkeleton />}>
      <ProductsContent />
    </Suspense>
  )
}

