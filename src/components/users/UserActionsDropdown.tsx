"use client"

import { useState } from "react"
import { MoreHorizontal, Edit, Trash2, Mail, MailCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { type User } from "@/server/db/schema/auth"

interface UserActionsDropdownProps {
  user: User
  onEdit: (user: User) => void
  onDelete: (userId: string) => void
  onToggleVerification?: (userId: string, verified: boolean) => void
  isTogglingVerification?: boolean
  isDeleting?: boolean
}

export function UserActionsDropdown({
  user,
  onEdit,
  onDelete,
  onToggleVerification,
  isTogglingVerification = false,
  isDeleting = false,
}: UserActionsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleEdit = () => {
    onEdit(user)
    setIsOpen(false)
  }

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${user.name}?`)) {
      onDelete(user.id)
    }
    setIsOpen(false)
  }

  const handleToggleVerification = () => {
    if (onToggleVerification) {
      onToggleVerification(user.id, !user.emailVerified)
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

        {onToggleVerification && (
          <>
            <DropdownMenuItem onClick={handleToggleVerification} disabled={isTogglingVerification}>
              {user.emailVerified ? (
                <Mail className="mr-2 h-4 w-4" />
              ) : (
                <MailCheck className="mr-2 h-4 w-4" />
              )}
              {user.emailVerified ? 'Mark Unverified' : 'Mark Verified'}
              {isTogglingVerification && (
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