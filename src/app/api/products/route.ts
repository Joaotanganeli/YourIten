import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const game = searchParams.get('game')
    const productType = searchParams.get('productType')
    const server = searchParams.get('server')
    const rank = searchParams.get('rank')

    let queryText = `
      SELECT p.*, 
             u.rating as seller_rating, 
             u.total_reviews as seller_total_reviews,
             u.total_sales as seller_total_sales
      FROM products p
      LEFT JOIN users u ON p.seller_id = u.id
      WHERE p.stock > 0`
    const params: any[] = []
    let paramCount = 1

    if (game && game !== 'all') {
      queryText += ` AND p.game = $${paramCount}`
      params.push(game)
      paramCount++
    }

    if (productType && productType !== 'all') {
      queryText += ` AND p.product_type = $${paramCount}`
      params.push(productType)
      paramCount++
    }

    if (category && category !== 'all') {
      queryText += ` AND p.category = $${paramCount}`
      params.push(category)
      paramCount++
    }

    if (server && server !== 'all') {
      queryText += ` AND p.server = $${paramCount}`
      params.push(server)
      paramCount++
    }

    if (rank && rank !== 'all') {
      queryText += ` AND p.rank = $${paramCount}`
      params.push(rank)
      paramCount++
    }

    if (search) {
      queryText += ` AND (p.title ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`
      params.push(`%${search}%`)
      paramCount++
    }

    queryText += ' ORDER BY p.is_featured DESC, p.created_at DESC'

    const result = await query(queryText, params)

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Get products error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const user = await verifyToken(token)

    if (!user || (user.role !== 'seller' && user.role !== 'admin')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { title, description, price, imageUrl, category, stock } = await request.json()

    if (!title || !description || price === undefined || !imageUrl || !category || stock === undefined) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    const result = await query(
      `INSERT INTO products (seller_id, seller_name, title, description, price, image_url, category, stock) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [user.userId, user.name, title, description, price, imageUrl, category, stock]
    )

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error('Create product error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
