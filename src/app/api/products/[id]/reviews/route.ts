import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const result = await query(
      `SELECT 
        r.id,
        r.rating,
        r.comment,
        r.created_at,
        u.name as buyer_name
       FROM reviews r
       JOIN users u ON r.buyer_id = u.id
       WHERE r.product_id = $1
       ORDER BY r.created_at DESC
       LIMIT 50`,
      [id]
    )

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Get reviews error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
