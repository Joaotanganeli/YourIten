import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const result = await query(
      'SELECT * FROM game_categories WHERE is_active = true ORDER BY display_order ASC',
      []
    )

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Get games error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
