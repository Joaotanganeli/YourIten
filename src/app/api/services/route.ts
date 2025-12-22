import { NextRequest, NextResponse } from 'next/server'
import { query, getClient } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const game = searchParams.get('game')
    const serviceType = searchParams.get('serviceType')
    const activeOnly = searchParams.get('activeOnly') === 'true'

    let queryText = `
      SELECT s.*, 
             COALESCE(
               json_agg(
                 DISTINCT sao.option_value
               ) FILTER (WHERE sao.option_value IS NOT NULL),
               '[]'
             ) as available_options
      FROM fixed_services s
      LEFT JOIN service_available_options sao ON s.id = sao.service_id
      WHERE 1=1
    `
    const params: any[] = []
    let paramCount = 1

    if (activeOnly) {
      queryText += ` AND s.is_active = true`
    }

    if (game && game !== 'all') {
      queryText += ` AND s.game = $${paramCount}`
      params.push(game)
      paramCount++
    }

    if (serviceType) {
      queryText += ` AND s.service_type = $${paramCount}`
      params.push(serviceType)
      paramCount++
    }

    queryText += ' GROUP BY s.id ORDER BY s.created_at DESC'

    const result = await query(queryText, params)

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Get services error:', error)
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

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin only' },
        { status: 401 }
      )
    }

    const { game, serviceType, title, description, basePrice, pricePerDivision, imageUrl, availableOptions, isActive } = await request.json()

    if (!game || !serviceType || !title || !description || basePrice === undefined || !imageUrl) {
      return NextResponse.json(
        { error: 'Required fields missing' },
        { status: 400 }
      )
    }

    await client.query('BEGIN')

    const serviceResult = await client.query(
      `INSERT INTO fixed_services (game, service_type, title, description, base_price, price_per_division, image_url, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [game, serviceType, title, description, basePrice, pricePerDivision || 0, imageUrl, isActive !== false]
    )

    const service = serviceResult.rows[0]

    if (availableOptions && Array.isArray(availableOptions)) {
      for (const option of availableOptions) {
        await client.query(
          'INSERT INTO service_available_options (service_id, option_value) VALUES ($1, $2)',
          [service.id, option]
        )
      }
    }

    await client.query('COMMIT')

    const finalResult = await client.query(
      `SELECT s.*, 
              COALESCE(
                json_agg(sao.option_value) FILTER (WHERE sao.option_value IS NOT NULL),
                '[]'
              ) as available_options
       FROM fixed_services s
       LEFT JOIN service_available_options sao ON s.id = sao.service_id
       WHERE s.id = $1
       GROUP BY s.id`,
      [service.id]
    )

    return NextResponse.json(finalResult.rows[0], { status: 201 })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Create service error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}
