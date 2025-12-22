import { NextRequest, NextResponse } from 'next/server'
import { query, getClient } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    await client.query('BEGIN')

    const serviceResult = await client.query(
      `UPDATE fixed_services 
       SET game = $1, service_type = $2, title = $3, description = $4, base_price = $5, 
           price_per_division = $6, image_url = $7, is_active = $8
       WHERE id = $9
       RETURNING *`,
      [game, serviceType, title, description, basePrice, pricePerDivision || 0, imageUrl, isActive !== false, params.id]
    )

    if (serviceResult.rows.length === 0) {
      await client.query('ROLLBACK')
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }

    await client.query(
      'DELETE FROM service_available_options WHERE service_id = $1',
      [params.id]
    )

    if (availableOptions && Array.isArray(availableOptions)) {
      for (const option of availableOptions) {
        await client.query(
          'INSERT INTO service_available_options (service_id, option_value) VALUES ($1, $2)',
          [params.id, option]
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
      [params.id]
    )

    return NextResponse.json(finalResult.rows[0])
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Update service error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const user = await verifyToken(token)

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin only' },
        { status: 401 }
      )
    }

    const result = await query(
      'DELETE FROM fixed_services WHERE id = $1 RETURNING id',
      [params.id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'Service deleted successfully' })
  } catch (error) {
    console.error('Delete service error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const user = await verifyToken(token)

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin only' },
        { status: 401 }
      )
    }

    const { isActive } = await request.json()

    const result = await query(
      'UPDATE fixed_services SET is_active = $1 WHERE id = $2 RETURNING *',
      [isActive, params.id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Toggle service error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
