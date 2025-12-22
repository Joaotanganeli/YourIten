import { NextRequest, NextResponse } from 'next/server'
import { query, getClient } from '@/lib/db'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function POST(request: NextRequest) {
  const client = await getClient()
  
  try {
    const { email, password, name, role, gameCategories } = await request.json()

    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    if (!['buyer', 'seller', 'booster', 'admin'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      )
    }

    await client.query('BEGIN')

    const existingUser = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    )

    if (existingUser.rows.length > 0) {
      await client.query('ROLLBACK')
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const result = await client.query(
      'INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role',
      [email, passwordHash, name, role]
    )

    const user = result.rows[0]

    if (role === 'booster' && gameCategories && Array.isArray(gameCategories)) {
      for (const category of gameCategories) {
        await client.query(
          'INSERT INTO user_game_categories (user_id, game_category) VALUES ($1, $2)',
          [user.id, category]
        )
      }
    }

    await client.query('COMMIT')

    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      gameCategories: gameCategories || []
    }

    return NextResponse.json({ 
      user: userData,
      token 
    }, { status: 201 })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}
