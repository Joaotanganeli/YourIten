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
    const status = searchParams.get('status')
    const game = searchParams.get('game')

    let queryText = `
      SELECT bo.*,
             json_build_object(
               'id', s.id,
               'game', s.game,
               'serviceType', s.service_type,
               'title', s.title,
               'description', s.description,
               'basePrice', s.base_price,
               'pricePerDivision', s.price_per_division,
               'imageUrl', s.image_url,
               'isActive', s.is_active
             ) as service,
             (
               SELECT json_object_agg(bc.config_key, bc.config_value)
               FROM boost_configurations bc
               WHERE bc.boost_order_id = bo.id
             ) as boost_config
      FROM boost_orders bo
      JOIN fixed_services s ON bo.service_id = s.id
      WHERE 1=1
    `
    const params: any[] = []
    let paramCount = 1

    if (role === 'buyer') {
      queryText += ` AND bo.buyer_id = $${paramCount}`
      params.push(user.userId)
      paramCount++
    } else if (role === 'booster') {
      queryText += ` AND (bo.booster_id = $${paramCount} OR (bo.status = 'pending' AND s.game = ANY($${paramCount + 1})))`
      params.push(user.userId)
      
      const userGamesResult = await query(
        'SELECT game_category FROM user_game_categories WHERE user_id = $1',
        [user.userId]
      )
      const userGames = userGamesResult.rows.map((row: any) => row.game_category)
      params.push(userGames)
      paramCount += 2
    }

    if (status) {
      queryText += ` AND bo.status = $${paramCount}`
      params.push(status)
      paramCount++
    }

    if (game) {
      queryText += ` AND bo.game = $${paramCount}`
      params.push(game)
      paramCount++
    }

    queryText += ' ORDER BY bo.created_at DESC'

    const result = await query(queryText, params)

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Get boost orders error:', error)
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

    const { serviceId, boostConfig, totalPrice } = await request.json()

    if (!serviceId || !boostConfig || !totalPrice) {
      return NextResponse.json(
        { error: 'Required fields missing' },
        { status: 400 }
      )
    }

    await client.query('BEGIN')

    const serviceResult = await client.query(
      'SELECT * FROM fixed_services WHERE id = $1 AND is_active = true',
      [serviceId]
    )

    if (serviceResult.rows.length === 0) {
      await client.query('ROLLBACK')
      return NextResponse.json(
        { error: 'Service not found or inactive' },
        { status: 404 }
      )
    }

    const service = serviceResult.rows[0]

    const orderResult = await client.query(
      `INSERT INTO boost_orders (service_id, game, service_type, buyer_id, buyer_name, buyer_email, status, total_price)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [serviceId, service.game, service.service_type, user.userId, user.name, user.email, 'pending', totalPrice]
    )

    const order = orderResult.rows[0]

    for (const [key, value] of Object.entries(boostConfig)) {
      await client.query(
        'INSERT INTO boost_configurations (boost_order_id, config_key, config_value) VALUES ($1, $2, $3)',
        [order.id, key, String(value)]
      )
    }

    await client.query('COMMIT')

    const finalResult = await client.query(
      `SELECT bo.*,
              json_build_object(
                'id', s.id,
                'game', s.game,
                'serviceType', s.service_type,
                'title', s.title,
                'description', s.description,
                'basePrice', s.base_price,
                'pricePerDivision', s.price_per_division,
                'imageUrl', s.image_url,
                'isActive', s.is_active
              ) as service,
              (
                SELECT json_object_agg(bc.config_key, bc.config_value)
                FROM boost_configurations bc
                WHERE bc.boost_order_id = bo.id
              ) as boost_config
       FROM boost_orders bo
       JOIN fixed_services s ON bo.service_id = s.id
       WHERE bo.id = $1`,
      [order.id]
    )

    return NextResponse.json(finalResult.rows[0], { status: 201 })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Create boost order error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}
