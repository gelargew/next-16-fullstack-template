"use client"

import { useState, useEffect } from "react"
import { Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Form } from "@/components/form"
import { useForm } from "@/components/ui/form"
import { updateProduct } from "@/actions/products"
import { type Product } from "@/server/db/schema/products"

interface ProductEditDialogProps {
  product: Product | null
  onProductUpdated: () => void
  onOpenChange?: (open: boolean) => void
}

export function ProductEditDialog({ product, onProductUpdated, onOpenChange }: ProductEditDialogProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm(
    {
      name: "",
      description: "",
      price: "",
      sku: "",
      active: true,
    }
  )

  // Update form when product changes
  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name || "",
        description: product.description || "",
        price: product.price || "",
        sku: product.sku || "",
        active: product.active ?? true,
      })
      setOpen(true)
    } else {
      setOpen(false)
    }
  }, [product, form])

  const handleSubmit = async (data: { name: string; description?: string; price: string; sku: string; active: boolean }) => {
    if (!product) return

    setIsSubmitting(true)
    try {
      // Convert form data to FormData for server action
      const formData = new FormData()
      formData.append('name', data.name)
      formData.append('sku', data.sku)
      formData.append('price', data.price)
      if (data.description !== undefined) formData.append('description', data.description || '')
      formData.append('active', data.active.toString())

      // Server action handles validation
      const result = await updateProduct(product.id, formData)

      if (!result.success) {
        throw new Error(result.error || 'Failed to update product')
      }

      setOpen(false)
      form.reset()
      onProductUpdated()
    } catch (error) {
      console.error('Error updating product:', error)
      // Could show toast error here
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    onOpenChange?.(newOpen)
    if (!newOpen) {
      form.reset()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>
            Update product information.
          </DialogDescription>
        </DialogHeader>
        <Form form={form} onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Status:</span>
              <Badge variant={product?.active ? 'default' : 'secondary'}>
                {product?.active ? 'Active' : 'Inactive'}
              </Badge>
            </div>

            <Form.Input
              name="name"
              label="Product Name"
              placeholder="Enter product name"
              required
              disabled={isSubmitting}
            />

            <Form.Input
              name="sku"
              label="SKU"
              placeholder="Enter SKU"
              required
              disabled={isSubmitting}
            />

            <Form.Input
              name="price"
              label="Price"
              type="number"
              step="0.01"
              placeholder="0.00"
              required
              disabled={isSubmitting}
            />

            <Form.Textarea
              name="description"
              label="Description"
              placeholder="Enter product description (optional)"
              disabled={isSubmitting}
            />

            <Form.Checkbox
              name="active"
              label="Active"
              disabled={isSubmitting}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Updating...' : 'Update Product'}
              </Button>
            </div>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

