"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/server/db/connection"
import {
  user,
  type User,
  createUserSchema,
  updateUserSchema,
  userSelectSchema
} from "@/server/db/schema"
import { createQueryParamsSchema } from "@/lib/schema-utils"
import { usersFilterConfig } from "@/configs/usersFilters"
import { eq, desc, like, or, and, sql } from "drizzle-orm"
import { z } from "zod"
import { redirect } from "next/navigation"

// Types for querying
interface UsersQueryParams {
  page?: number
  pageSize?: number
  search?: string
  sortField?: keyof User
  sortDirection?: 'asc' | 'desc'
  emailVerified?: boolean
}

interface UsersResponse {
  data: User[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

// Auto-generated query validation schema from filter config
const usersQuerySchema = createQueryParamsSchema(usersFilterConfig)

export async function createUser(formData: FormData) {
  try {
    // Extract and validate form data using Drizzle Zod schema
    const rawData = {
      name: formData.get('name'),
      email: formData.get('email'),
      image: formData.get('image'),
    }

    const { name, email, image } = createUserSchema.parse(rawData)

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1)

    if (existingUser.length > 0) {
      return {
        success: false,
        error: 'User with this email already exists'
      }
    }

    // Create new user
    const newUser = await db.insert(user).values({
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      email,
      emailVerified: false,
      image: image || null
    }).returning()

    revalidatePath('/dashboard/users')

    return {
      success: true,
      data: newUser[0]
    }
  } catch (error) {
    console.error('Error creating user:', error)
    return {
      success: false,
      error: 'Failed to create user'
    }
  }
}

export async function updateUser(userId: string, formData: FormData) {
  try {
    // Extract and validate form data using Drizzle Zod schema
    const rawData = {
      name: formData.get('name'),
      email: formData.get('email'),
      image: formData.get('image'),
      emailVerified: formData.get('emailVerified') === 'true',
    }

    const { name, email, image, emailVerified } = updateUserSchema.parse(rawData)

    // Check if user exists
    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1)

    if (existingUser.length === 0) {
      return {
        success: false,
        error: 'User not found'
      }
    }

    // Check email uniqueness
    if (email !== existingUser[0].email) {
      const emailExists = await db
        .select()
        .from(user)
        .where(eq(user.email, email))
        .limit(1)

      if (emailExists.length > 0) {
        return {
          success: false,
          error: 'Email already exists'
        }
      }
    }

    // Update user
    const updatedUser = await db
      .update(user)
      .set({
        name: name || existingUser[0].name,
        email: email || existingUser[0].email,
        image: image !== undefined ? image : existingUser[0].image,
        emailVerified: emailVerified !== undefined ? emailVerified : existingUser[0].emailVerified,
        updatedAt: new Date()
      })
      .where(eq(user.id, userId))
      .returning()

    revalidatePath('/dashboard/users')

    return {
      success: true,
      data: updatedUser[0]
    }
  } catch (error) {
    console.error('Error updating user:', error)
    return {
      success: false,
      error: 'Failed to update user'
    }
  }
}

export async function deleteUser(userId: string) {
  try {
    // Check if user exists
    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1)

    if (existingUser.length === 0) {
      return {
        success: false,
        error: 'User not found'
      }
    }

    // Delete user
    await db.delete(user).where(eq(user.id, userId))

    revalidatePath('/dashboard/users')

    return {
      success: true
    }
  } catch (error) {
    console.error('Error deleting user:', error)
    return {
      success: false,
      error: 'Failed to delete user'
    }
  }
}

export async function getUsers(params: UsersQueryParams = {}): Promise<UsersResponse> {
  try {
    // Validate and parse query parameters using Drizzle Zod schema
    const validatedParams = usersQuerySchema.parse(params) as any

    const { page, pageSize, search, sortField, sortDirection, emailVerified } = validatedParams
    const offset = (page - 1) * pageSize

    // Build the query conditions
    const conditions = []
    if (search) {
      conditions.push(
        or(
          like(user.name, `%${search}%`),
          like(user.email, `%${search}%`)
        )
      )
    }

    // Add emailVerified filter
    if (emailVerified !== undefined) {
      conditions.push(eq(user.emailVerified, emailVerified))
    }

    // Add sorting
    const orderByField = sortField as keyof User
    const orderDirection = sortDirection === 'asc'
      ? sql`${user[orderByField]} ASC`
      : desc(user[orderByField])

    // Execute the main query
    const usersQuery = db
      .select()
      .from(user)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(orderDirection)
      .limit(pageSize)
      .offset(offset)

    // Get total count
    let totalCountQuery = search
      ? db.select({ count: sql<number>`count(*)` }).from(user)
          .where(
            or(
              like(user.name, `%${search}%`),
              like(user.email, `%${search}%`)
            )
          )
      : db.select({ count: sql<number>`count(*)` }).from(user)

    const [usersData, totalCountResult] = await Promise.all([
      usersQuery,
      totalCountQuery
    ])

    const totalCount = totalCountResult[0].count

    return {
      data: usersData,
      pagination: {
        page,
        pageSize,
        total: totalCount,
        totalPages: Math.ceil(totalCount / pageSize)
      }
    }
  } catch (error) {
    console.error('Error fetching users:', error)
    throw new Error('Failed to fetch users')
  }
}

export async function toggleUserVerified(userId: string, verified: boolean) {
  try {
    await db
      .update(user)
      .set({
        emailVerified: verified,
        updatedAt: new Date()
      })
      .where(eq(user.id, userId))

    revalidatePath('/dashboard/users')

    return {
      success: true
    }
  } catch (error) {
    console.error('Error updating user verification:', error)
    return {
      success: false,
      error: 'Failed to update user verification'
    }
  }
}