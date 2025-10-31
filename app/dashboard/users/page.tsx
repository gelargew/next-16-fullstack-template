"use client"

import { useState, Suspense } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FilterBar, Pagination, SortSelector } from "@/components/filters"
import { UserAddDialog } from "@/components/users/UserAddDialog"
import { UserEditDialog } from "@/components/users/UserEditDialog"
import { UserTable } from "@/components/users/UserTable"
import { UserTableSkeleton } from "@/components/users/UserTableSkeleton"
import { useUsers } from "@/hooks/useUsers"
import { type User } from "@/server/db/schema/auth"

function UsersContent() {
  const {
    users,
    pagination,
    isLoading,
    filters,
    createUser,
    updateUser,
    deleteUser,
    toggleVerification,
    refetch
  } = useUsers()

  const [editingUser, setEditingUser] = useState<User | null>(null)

  const handleDelete = async (userId: string) => {
    await deleteUser(userId)
  }

  const handleToggleVerification = async (userId: string, verified: boolean) => {
    await toggleVerification(userId, verified)
  }

  const handleUserCreated = async () => {
    refetch()
  }

  const handleUpdateUser = async () => {
    setEditingUser(null)
    refetch()
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header with Filters and Actions */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <FilterBar filters={filters} />
        <UserAddDialog onUserCreated={handleUserCreated} />
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

      {/* Users Table */}
      <UserTable
        users={users}
        isLoading={isLoading}
        onEditUser={setEditingUser}
        onDeleteUser={handleDelete}
        onToggleVerification={handleToggleVerification}
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
      <UserEditDialog
        user={editingUser}
        onUserUpdated={handleUpdateUser}
        onOpenChange={(open) => {
          if (!open) setEditingUser(null)
        }}
      />
    </div>
  )
}

export default function UsersPage() {
  return (
    <Suspense fallback={<UserTableSkeleton />}>
      <UsersContent />
    </Suspense>
  )
}