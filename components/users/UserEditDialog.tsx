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
import { updateUser } from "@/actions/users"
import { type User } from "@/server/db/schema/auth"

interface UserEditDialogProps {
  user: User | null
  onUserUpdated: () => void
  onOpenChange?: (open: boolean) => void
}

export function UserEditDialog({ user, onUserUpdated, onOpenChange }: UserEditDialogProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm(
    {
      name: "",
      email: "",
      image: ""
    }
  )

  // Update form when user changes
  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name || "",
        email: user.email || "",
        image: user.image || ""
      })
      setOpen(true)
    } else {
      setOpen(false)
    }
  }, [user, form])

  const handleSubmit = async (data: { name: string; email: string; image?: string }) => {
    if (!user) return

    setIsSubmitting(true)
    try {
      // Convert form data to FormData for server action
      const formData = new FormData()
      formData.append('name', data.name)
      formData.append('email', data.email)
      if (data.image) formData.append('image', data.image)
      if (typeof user.emailVerified === 'boolean') {
        formData.append('emailVerified', user.emailVerified.toString())
      }

      // Server action handles validation
      const result = await updateUser(user.id, formData)

      if (!result.success) {
        throw new Error(result.error || 'Failed to update user')
      }

      setOpen(false)
      form.reset()
      onUserUpdated()
    } catch (error) {
      console.error('Error updating user:', error)
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
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user information.
          </DialogDescription>
        </DialogHeader>
        <Form form={form} onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Status:</span>
              <Badge variant={user?.emailVerified ? 'default' : 'secondary'}>
                {user?.emailVerified ? 'Verified' : 'Unverified'}
              </Badge>
            </div>

            <Form.Input
              name="name"
              label="Name"
              placeholder="Enter user name"
              required
              disabled={isSubmitting}
            />

            <Form.Input
              name="email"
              type="email"
              label="Email"
              placeholder="Enter email address"
              required
              disabled={isSubmitting}
            />

            <Form.Input
              name="image"
              label="Profile Image URL"
              type="url"
              placeholder="Enter profile image URL"
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
                {isSubmitting ? 'Updating...' : 'Update User'}
              </Button>
            </div>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  )
}