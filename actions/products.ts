"use server"

import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { db } from "@/server/db/connection"
import {
  product,
  type Product,
  createProductSchema,
  updateProductSchema,
} from "@/server/db/schema"
import { createQueryParamsSchema } from "@/lib/schema-utils"
import { productsFilterConfig } from "@/configs/productsFilters"
import { eq, desc, like, or, and, sql } from "drizzle-orm"
import { auth } from "@/server/auth"

// Types for querying
interface ProductsQueryParams {
  page?: number
  pageSize?: number
  search?: string
  sortField?: keyof Product
  sortDirection?: 'asc' | 'desc'
  active?: boolean
}

interface ProductsResponse {
  data: Product[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

// Auto-generated query validation schema from filter config
const productsQuerySchema = createQueryParamsSchema(productsFilterConfig)

// Helper to get current user ID
async function getCurrentUserId(): Promise<string> {
  const headersList = await headers()
  const session = await auth.api.getSession({
    headers: headersList,
  })

  if (!session?.user?.id) {
    throw new Error('Unauthorized - Please sign in')
  }

  return session.user.id
}

export async function createProduct(formData: FormData) {
  try {
    const currentUserId = await getCurrentUserId()

    // Extract and validate form data using Drizzle Zod schema
    const rawData = {
      name: formData.get('name'),
      description: formData.get('description') || '',
      price: formData.get('price'),
      sku: formData.get('sku'),
      active: formData.get('active') === 'true',
    }

    const { name, description, price, sku, active } = createProductSchema.parse(rawData)

    // Check if product with SKU already exists
    const existingProduct = await db
      .select()
      .from(product)
      .where(eq(product.sku, sku))
      .limit(1)

    if (existingProduct.length > 0) {
      return {
        success: false,
        error: 'Product with this SKU already exists'
      }
    }

    // Create new product
    const newProduct = await db.insert(product).values({
      id: `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description: description || null,
      price,
      sku,
      active: active ?? true,
      createdBy: currentUserId,
      updatedBy: currentUserId,
    }).returning()

    revalidatePath('/dashboard/products')

    return {
      success: true,
      data: newProduct[0]
    }
  } catch (error) {
    console.error('Error creating product:', error)
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return {
        success: false,
        error: error.message
      }
    }
    return {
      success: false,
      error: 'Failed to create product'
    }
  }
}

export async function updateProduct(productId: string, formData: FormData) {
  try {
    const currentUserId = await getCurrentUserId()

    // Extract and validate form data using Drizzle Zod schema
    const rawData = {
      name: formData.get('name'),
      description: formData.get('description') || '',
      price: formData.get('price'),
      sku: formData.get('sku'),
      active: formData.get('active') === 'true',
    }

    const validatedData = updateProductSchema.parse(rawData)

    // Check if product exists
    const existingProduct = await db
      .select()
      .from(product)
      .where(eq(product.id, productId))
      .limit(1)

    if (existingProduct.length === 0) {
      return {
        success: false,
        error: 'Product not found'
      }
    }

    // Check SKU uniqueness if SKU is being changed
    if (validatedData.sku && validatedData.sku !== existingProduct[0].sku) {
      const skuExists = await db
        .select()
        .from(product)
        .where(eq(product.sku, validatedData.sku))
        .limit(1)

      if (skuExists.length > 0) {
        return {
          success: false,
          error: 'SKU already exists'
        }
      }
    }

    // Update product
    const updatedProduct = await db
      .update(product)
      .set({
        name: validatedData.name ?? existingProduct[0].name,
        description: validatedData.description !== undefined ? validatedData.description : existingProduct[0].description,
        price: validatedData.price ?? existingProduct[0].price,
        sku: validatedData.sku ?? existingProduct[0].sku,
        active: validatedData.active !== undefined ? validatedData.active : existingProduct[0].active,
        updatedBy: currentUserId,
        updatedAt: new Date()
      })
      .where(eq(product.id, productId))
      .returning()

    revalidatePath('/dashboard/products')

    return {
      success: true,
      data: updatedProduct[0]
    }
  } catch (error) {
    console.error('Error updating product:', error)
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return {
        success: false,
        error: error.message
      }
    }
    return {
      success: false,
      error: 'Failed to update product'
    }
  }
}

export async function deleteProduct(productId: string) {
  try {
    await getCurrentUserId() // Ensure user is authenticated

    // Check if product exists
    const existingProduct = await db
      .select()
      .from(product)
      .where(eq(product.id, productId))
      .limit(1)

    if (existingProduct.length === 0) {
      return {
        success: false,
        error: 'Product not found'
      }
    }

    // Delete product
    await db.delete(product).where(eq(product.id, productId))

    revalidatePath('/dashboard/products')

    return {
      success: true
    }
  } catch (error) {
    console.error('Error deleting product:', error)
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return {
        success: false,
        error: error.message
      }
    }
    return {
      success: false,
      error: 'Failed to delete product'
    }
  }
}

export async function getProducts(params: ProductsQueryParams = {}): Promise<ProductsResponse> {
  try {
    // Validate and parse query parameters using Drizzle Zod schema
    const validatedParams = productsQuerySchema.parse(params) as any

    const { page, pageSize, search, sortField, sortDirection, active } = validatedParams
    const offset = (page - 1) * pageSize

    // Build the query conditions
    const conditions = []
    if (search) {
      conditions.push(
        or(
          like(product.name, `%${search}%`),
          like(product.sku, `%${search}%`),
          like(product.description, `%${search}%`)
        )
      )
    }

    // Add active filter
    if (active !== undefined) {
      conditions.push(eq(product.active, active))
    }

    // Add sorting
    const orderByField = sortField as keyof Product
    const orderDirection = sortDirection === 'asc'
      ? sql`${product[orderByField]} ASC`
      : desc(product[orderByField])

    // Execute the main query
    const productsQuery = db
      .select()
      .from(product)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(orderDirection)
      .limit(pageSize)
      .offset(offset)

    // Get total count
    let totalCountQuery = db.select({ count: sql<number>`count(*)` }).from(product)

    if (conditions.length > 0) {
      totalCountQuery = totalCountQuery.where(and(...conditions))
    }

    const [productsData, totalCountResult] = await Promise.all([
      productsQuery,
      totalCountQuery
    ])

    const totalCount = totalCountResult[0].count

    return {
      data: productsData,
      pagination: {
        page,
        pageSize,
        total: totalCount,
        totalPages: Math.ceil(totalCount / pageSize)
      }
    }
  } catch (error) {
    console.error('Error fetching products:', error)
    throw new Error('Failed to fetch products')
  }
}

export async function toggleProductActive(productId: string, active: boolean) {
  try {
    const currentUserId = await getCurrentUserId()

    await db
      .update(product)
      .set({
        active,
        updatedBy: currentUserId,
        updatedAt: new Date()
      })
      .where(eq(product.id, productId))

    revalidatePath('/dashboard/products')

    return {
      success: true
    }
  } catch (error) {
    console.error('Error updating product status:', error)
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return {
        success: false,
        error: error.message
      }
    }
    return {
      success: false,
      error: 'Failed to update product status'
    }
  }
}

