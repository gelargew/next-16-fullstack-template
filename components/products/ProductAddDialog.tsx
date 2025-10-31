"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Form } from "@/components/form"
import { useForm } from "@/components/ui/form"
import { createProduct } from "@/actions/products"
import { type Product } from "@/server/db/schema/products"

interface ProductAddDialogProps {
  onProductCreated: () => void
  disabled?: boolean
}

export function ProductAddDialog({ onProductCreated, disabled = false }: ProductAddDialogProps) {
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

  const handleSubmit = async (data: { name: string; description?: string; price: string; sku: string; active: boolean }) => {
    setIsSubmitting(true)
    try {
      // Convert form data to FormData for server action
      const formData = new FormData()
      formData.append('name', data.name)
      formData.append('sku', data.sku)
      formData.append('price', data.price)
      if (data.description) formData.append('description', data.description)
      formData.append('active', data.active.toString())

      // Server action handles validation
      const result = await createProduct(formData)

      if (!result.success) {
        throw new Error(result.error || 'Failed to create product')
      }

      setOpen(false)
      form.reset()
      onProductCreated()
    } catch (error) {
      console.error('Error creating product:', error)
      // Could show toast error here
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={disabled}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Product</DialogTitle>
          <DialogDescription>
            Add a new product to your catalog.
          </DialogDescription>
        </DialogHeader>
        <Form form={form} onSubmit={handleSubmit}>
          <div className="space-y-4">
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
                {isSubmitting ? 'Creating...' : 'Create Product'}
              </Button>
            </div>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

