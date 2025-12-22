import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const result = await query(
      `SELECT 
        p.*,
        u.name as seller_name,
        u.rating as seller_rating,
        u.total_sales as seller_total_sales,
        u.total_reviews as seller_total_reviews,
        u.avatar_url as seller_avatar,
        u.created_at as seller_joined
       FROM products p
       LEFT JOIN users u ON p.seller_id = u.id
       WHERE p.id = $1`,
      [id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Get product error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const user = await verifyToken(token)

    if (!user || (user.role !== 'seller' && user.role !== 'admin')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { title, description, price, imageUrl, category, stock, game, productType, server, rank, level, blueEssence, championsCount, skinsCount, isHandmade, isRankedReady } = body

    const result = await query(
      `UPDATE products 
       SET title = $1, description = $2, price = $3, image_url = $4, category = $5, stock = $6,
           game = $7, product_type = $8, server = $9, rank = $10, level = $11, 
           blue_essence = $12, champions_count = $13, skins_count = $14,
           is_handmade = $15, is_ranked_ready = $16
       WHERE id = $17 AND seller_id = $18
       RETURNING *`,
      [title, description, price, imageUrl, category, stock, game, productType, server, rank, level, blueEssence, championsCount, skinsCount, isHandmade, isRankedReady, params.id, user.userId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Product not found or unauthorized' },
        { status: 404 }
      )
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Update product error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const user = await verifyToken(token)

    if (!user || (user.role !== 'seller' && user.role !== 'admin')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const result = await query(
      'DELETE FROM products WHERE id = $1 AND seller_id = $2 RETURNING id',
      [params.id, user.userId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Product not found or unauthorized' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'Product deleted successfully' })
  } catch (error) {
    console.error('Delete product error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
