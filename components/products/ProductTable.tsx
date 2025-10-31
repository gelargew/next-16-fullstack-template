"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Calendar, Package, DollarSign } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ProductActionsDropdown } from "./ProductActionsDropdown"
import { type Product } from "@/server/db/schema/products"

interface ProductTableProps {
  products: Product[]
  isLoading: boolean
  onEditProduct: (product: Product) => void
  onDeleteProduct: (productId: string) => void
  onToggleActive: (productId: string, active: boolean) => void
  isTogglingActive?: boolean
  isDeleting?: boolean
}

export function ProductTable({
  products,
  isLoading,
  onEditProduct,
  onDeleteProduct,
  onToggleActive,
  isTogglingActive = false,
  isDeleting = false,
}: ProductTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="w-12">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                </TableCell>
                <TableCell>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                </TableCell>
                <TableCell>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                </TableCell>
                <TableCell>
                  <div className="h-6 bg-gray-200 rounded-full animate-pulse w-20"></div>
                </TableCell>
                <TableCell>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                </TableCell>
                <TableCell>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                </TableCell>
                <TableCell>
                  <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="w-12">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <div className="flex items-center space-x-3">
                  <Package className="h-4 w-4 text-gray-400" />
                  <div>
                    <span className="font-medium">{product.name}</span>
                    {product.description && (
                      <p className="text-sm text-gray-500 truncate max-w-xs">
                        {product.description}
                      </p>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                  {product.sku}
                </code>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <span>${parseFloat(product.price).toFixed(2)}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={product.active ? 'default' : 'secondary'}>
                  {product.active ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>{format(new Date(product.createdAt), 'MMM dd, yyyy')}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>{format(new Date(product.updatedAt), 'MMM dd, yyyy')}</span>
                </div>
              </TableCell>
              <TableCell>
                <ProductActionsDropdown
                  product={product}
                  onEdit={onEditProduct}
                  onDelete={onDeleteProduct}
                  onToggleActive={onToggleActive}
                  isTogglingActive={isTogglingActive}
                  isDeleting={isDeleting}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

