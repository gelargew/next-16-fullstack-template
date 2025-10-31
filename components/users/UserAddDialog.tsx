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
import { createUser } from "@/actions/users"
import { type User } from "@/server/db/schema/auth"

interface UserAddDialogProps {
  onUserCreated: () => void
  disabled?: boolean
}

export function UserAddDialog({ onUserCreated, disabled = false }: UserAddDialogProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm(
    {
      name: "",
      email: "",
      image: ""
    }
  )

  const handleSubmit = async (data: { name: string; email: string; image?: string }) => {
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('name', data.name)
      formData.append('email', data.email)
      if (data.image) formData.append('image', data.image)

      const result = await createUser(formData)

      if (!result.success) {
        throw new Error(result.error || 'Failed to create user')
      }

      setOpen(false)
      form.reset()
      onUserCreated()
    } catch (error) {
      console.error('Error creating user:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={disabled}>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
          <DialogDescription>
            Add a new user to your application.
          </DialogDescription>
        </DialogHeader>
        <Form form={form} onSubmit={handleSubmit}>
          <div className="space-y-4">
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
                {isSubmitting ? 'Creating...' : 'Create User'}
              </Button>
            </div>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  )
}