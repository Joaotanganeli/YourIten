import { NextRequest, NextResponse } from 'next/server'
import { query, getClient } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const user = await verifyToken(token)

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const role = searchParams.get('role')

    let queryText = 'SELECT * FROM orders WHERE 1=1'
    const params: any[] = []

    if (role === 'buyer') {
      queryText += ' AND buyer_id = $1'
      params.push(user.userId)
    } else if (role === 'seller') {
      queryText += ' AND seller_id = $1'
      params.push(user.userId)
    }

    queryText += ' ORDER BY created_at DESC'

    const result = await query(queryText, params)

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Get orders error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const client = await getClient()
  
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const user = await verifyToken(token)

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { productId, quantity } = await request.json()

    if (!productId || !quantity || quantity <= 0) {
      return NextResponse.json(
        { error: 'Invalid order data' },
        { status: 400 }
      )
    }

    await client.query('BEGIN')

    const productResult = await client.query(
      'SELECT * FROM products WHERE id = $1',
      [productId]
    )

    if (productResult.rows.length === 0) {
      await client.query('ROLLBACK')
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    const product = productResult.rows[0]
    const productPrice = parseFloat(product.price)
    const productStock = parseInt(product.stock)

    if (productStock < quantity) {
      await client.query('ROLLBACK')
      return NextResponse.json(
        { error: 'Insufficient stock' },
        { status: 400 }
      )
    }

    const totalPrice = productPrice * quantity

    const orderResult = await client.query(
      `INSERT INTO orders (product_id, product_title, product_price, buyer_id, buyer_name, seller_id, seller_name, quantity, total_price, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [productId, product.title, product.price, user.userId, user.name, product.seller_id, product.seller_name, quantity, totalPrice, 'pending']
    )

    await client.query(
      'UPDATE products SET stock = stock - $1 WHERE id = $2',
      [quantity, productId]
    )

    await client.query('COMMIT')

    return NextResponse.json(orderResult.rows[0], { status: 201 })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Create order error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}
