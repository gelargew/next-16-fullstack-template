import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/server/db/connection'
import { user } from '@/server/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const userData = await db
      .select()
      .from(user)
      .where(eq(user.id, id))
      .limit(1)

    if (userData.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: userData[0] })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, email, image, emailVerified } = body

    // Check if user exists
    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.id, id))
      .limit(1)

    if (existingUser.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
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
      .where(eq(user.id, id))
      .returning()

    return NextResponse.json({ data: updatedUser[0] })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // Check if user exists
    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.id, id))
      .limit(1)

    if (existingUser.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Delete user
    await db.delete(user).where(eq(user.id, id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}