import jwt from 'jsonwebtoken'
import { query } from '@/lib/db'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

interface TokenPayload {
  userId: string
  email: string
  role: string
}

interface UserData extends TokenPayload {
  name: string
}

export async function verifyToken(token: string | null | undefined): Promise<UserData | null> {
  if (!token) {
    return null
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload
    
    const result = await query(
      'SELECT id, email, name, role FROM users WHERE id = $1',
      [decoded.userId]
    )

    if (result.rows.length === 0) {
      return null
    }

    const user = result.rows[0]
    return {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }
  } catch (error) {
    console.error('Token verification error:', error)
    return null
  }
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}
