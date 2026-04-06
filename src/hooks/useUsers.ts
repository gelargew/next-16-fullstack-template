"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  getUsers,
  createUser as createUsersAction,
  updateUser as updateUsersAction,
  deleteUser as deleteUsersAction,
  toggleUserVerified
} from '@/actions/users'
import { useQueryFilters } from '@/hooks/useQueryFilters'
import { usersFilterConfig, type UserFilters } from '@/configs/usersFilters'
import { type User } from '@/server/db/schema/auth'

export function useUsers() {
  const queryClient = useQueryClient()

  // Use the filter system
  const filters = useQueryFilters<UserFilters>(usersFilterConfig)

  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['users', filters.getQueryParams()],
    queryFn: async () => {
      return await getUsers(filters.getQueryParams())
    },
    staleTime: 30000, // 30 seconds
    gcTime: 60000, // 1 minute (garbage collection time)
  })

  const createUser = async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
    const formData = new FormData()
    formData.append('name', userData.name)
    formData.append('email', userData.email)
    if (userData.image) formData.append('image', userData.image)

    const result = await createUsersAction(formData)

    if (!result.success) {
      throw new Error(result.error || 'Failed to create user')
    }

    toast.success('User created successfully')
    queryClient.invalidateQueries({ queryKey: ['users'] })
    refetch()

    return result.data
  }

  const updateUserFn = async (id: string, userData: Partial<User>) => {
    const formData = new FormData()
    if (userData.name !== undefined) formData.append('name', userData.name)
    if (userData.email !== undefined) formData.append('email', userData.email)
    if (userData.image !== undefined) formData.append('image', userData.image || '')
    if (userData.emailVerified !== undefined) {
      formData.append('emailVerified', userData.emailVerified.toString())
    }

    const result = await updateUsersAction(id, formData)

    if (!result.success) {
      throw new Error(result.error || 'Failed to update user')
    }

    toast.success('User updated successfully')
    queryClient.invalidateQueries({ queryKey: ['users'] })
    refetch()

    return result.data
  }

  const deleteUserFn = async (userId: string) => {
    const result = await deleteUsersAction(userId)

    if (!result.success) {
      throw new Error(result.error || 'Failed to delete user')
    }

    toast.success('User deleted successfully')
    queryClient.invalidateQueries({ queryKey: ['users'] })
    refetch()

    return result
  }

  const toggleVerificationFn = async (userId: string, verified: boolean) => {
    const result = await toggleUserVerified(userId, verified)

    if (!result.success) {
      throw new Error(result.error || 'Failed to update user verification')
    }

    toast.success('User verification updated')
    queryClient.invalidateQueries({ queryKey: ['users'] })
    refetch()

    return result
  }

  return {
    // Data
    users: data?.data || [],
    pagination: data?.pagination || { page: 1, pageSize: 10, total: 0, totalPages: 0 },
    isLoading,
    error,
    refetch,

    // Filters
    filters,

    // Actions
    createUser,
    updateUser: updateUserFn,
    deleteUser: deleteUserFn,
    toggleVerification: toggleVerificationFn,
  }
}