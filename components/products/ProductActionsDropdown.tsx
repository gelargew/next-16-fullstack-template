"use client"

import { useState } from "react"
import { MoreHorizontal, Edit, Trash2, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { type Product } from "@/server/db/schema/products"

interface ProductActionsDropdownProps {
  product: Product
  onEdit: (product: Product) => void
  onDelete: (productId: string) => void
  onToggleActive?: (productId: string, active: boolean) => void
  isTogglingActive?: boolean
  isDeleting?: boolean
}

export function ProductActionsDropdown({
  product,
  onEdit,
  onDelete,
  onToggleActive,
  isTogglingActive = false,
  isDeleting = false,
}: ProductActionsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleEdit = () => {
    onEdit(product)
    setIsOpen(false)
  }

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${product.name}?`)) {
      onDelete(product.id)
    }
    setIsOpen(false)
  }

  const handleToggleActive = () => {
    if (onToggleActive) {
      onToggleActive(product.id, !product.active)
    }
    setIsOpen(false)
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 w-8 p-0"
          disabled={isDeleting}
        >
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={handleEdit}>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>

        {onToggleActive && (
          <>
            <DropdownMenuItem onClick={handleToggleActive} disabled={isTogglingActive}>
              {product.active ? (
                <XCircle className="mr-2 h-4 w-4" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              {product.active ? 'Deactivate' : 'Activate'}
              {isTogglingActive && (
                <span className="ml-auto h-4 w-4 animate-spin">⏳</span>
              )}
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleDelete}
          className="text-destructive focus:text-destructive"
          disabled={isDeleting}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
          {isDeleting && (
            <span className="ml-auto h-4 w-4 animate-spin">⏳</span>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

