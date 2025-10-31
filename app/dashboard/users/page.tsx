"use client"

import * as React from "react"
import { format } from "date-fns"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  MoreHorizontal,
  Plus,
  Edit,
  Trash2,
  Eye,
  Mail,
  User as UserIcon,
  Calendar
} from "lucide-react"
import { toast } from "sonner"
import { DataTable } from "@/components/ui/data-table-v2"
import { Form as CompoundForm } from "@/components/form"
import { Form, useForm } from "@/components/ui/form"
import { type User } from "@/server/db/schema/auth"

// Types
type FormData = {
  name: string
  email: string
  image?: string
}

// Form validation schema
const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  image: z.string().url("Invalid URL").optional().or(z.literal("")),
})

// User form component
function UserForm({
  user,
  onSubmit,
  onCancel
}: {
  user?: User
  onSubmit: (data: FormData) => Promise<void>
  onCancel: () => void
}) {
  const [isLoading, setIsLoading] = React.useState(false)

  const form = useForm<FormData>(
    {
      name: user?.name || "",
      email: user?.email || "",
      image: user?.image || "",
    },
    userSchema
  )

  const handleSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      await onSubmit(data)
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form form={form} onSubmit={handleSubmit}>
      <div className="space-y-4">
        <CompoundForm.Input
          name="name"
          label="Name"
          placeholder="Enter user name"
          required
        />

        <CompoundForm.Input
          name="email"
          label="Email"
          type="email"
          placeholder="Enter email address"
          required
        />

        <CompoundForm.Input
          name="image"
          label="Profile Image URL"
          type="url"
          placeholder="Enter profile image URL"
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : user ? 'Update User' : 'Create User'}
          </Button>
        </div>
      </div>
    </Form>
  )
}

// Main User Management Page
export default function UsersPage() {
  const [users, setUsers] = React.useState<User[]>([])
  const [loading, setLoading] = React.useState(true)
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)
  const [editDialogOpen, setEditDialogOpen] = React.useState(false)
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null)

  // Fetch users
  const fetchUsers = React.useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/users')
      if (!response.ok) throw new Error('Failed to fetch users')
      const result = await response.json()
      setUsers(result.data)
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Create user
  const handleCreateUser = async (data: FormData) => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create user')
      }

      await fetchUsers()
      setCreateDialogOpen(false)
      toast.success('User created successfully')
    } catch (error) {
      console.error('Error creating user:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create user')
    }
  }

  // Update user
  const handleUpdateUser = async (data: FormData) => {
    if (!selectedUser) return

    try {
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update user')
      }

      await fetchUsers()
      setEditDialogOpen(false)
      setSelectedUser(null)
      toast.success('User updated successfully')
    } catch (error) {
      console.error('Error updating user:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update user')
    }
  }

  // Delete user
  const handleDeleteUser = async (user: User) => {
    if (!confirm(`Are you sure you want to delete ${user.name}?`)) return

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete user')
      }

      await fetchUsers()
      toast.success('User deleted successfully')
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete user')
    }
  }

  // Table columns
  const columns = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }: any) => (
        <div className="flex items-center space-x-3">
          {row.original.image ? (
            <img
              src={row.original.image}
              alt={row.original.name}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
              <UserIcon className="h-4 w-4 text-gray-500" />
            </div>
          )}
          <span className="font-medium">{row.original.name}</span>
        </div>
      ),
    },

    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }: any) => (
        <div className="flex items-center space-x-2">
          <Mail className="h-4 w-4 text-gray-400" />
          <span>{row.original.email}</span>
        </div>
      ),
    },

    {
      accessorKey: 'emailVerified',
      header: 'Status',
      cell: ({ row }: any) => (
        <Badge variant={row.original.emailVerified ? 'default' : 'secondary'}>
          {row.original.emailVerified ? 'Verified' : 'Unverified'}
        </Badge>
      ),
    },

    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }: any) => (
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span>{format(new Date(row.original.createdAt), 'MMM dd, yyyy')}</span>
        </div>
      ),
    },

    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => {
                setSelectedUser(row.original)
                setEditDialogOpen(true)
              }}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => handleDeleteUser(row.original)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage your application users and their permissions.
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
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
            <UserForm
              onSubmit={handleCreateUser}
              onCancel={() => setCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Users Table */}
      <DataTable
        columns={columns}
        data={users}
        searchKey="name"
        searchPlaceholder="Search users..."
        pageSize={10}
        loading={loading}
        emptyMessage="No users found."
      />

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <UserForm
              user={selectedUser}
              onSubmit={handleUpdateUser}
              onCancel={() => {
                setEditDialogOpen(false)
                setSelectedUser(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}