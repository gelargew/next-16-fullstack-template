import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/server/db/connection'
import { user, type User } from '@/server/db/schema'
import { desc, like, or, and, sql } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const offset = (page - 1) * pageSize

    // Search parameters
    const search = searchParams.get('search') || ''

    // Sorting parameters
    const sortField = searchParams.get('sortField') || 'createdAt'
    const sortDirection = searchParams.get('sortDirection') || 'desc'

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

    // Add sorting
    const orderByField = sortField as keyof User
    const orderDirection = sortDirection === 'asc' ? sql`${user[orderByField]} ASC` : desc(user[orderByField])

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

    return NextResponse.json({
      data: usersData,
      pagination: {
        page,
        pageSize,
        total: totalCount,
        totalPages: Math.ceil(totalCount / pageSize)
      }
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, image } = body

    // Basic validation
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(user)
      .where(like(user.email, email))
      .limit(1)

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Create new user
    const newUser = await db.insert(user).values({
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      email,
      emailVerified: false,
      image: image || null
    }).returning()

    return NextResponse.json({ data: newUser[0] }, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}