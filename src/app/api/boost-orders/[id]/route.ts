import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const user = await verifyToken(token)

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { status, action } = await request.json()

    if (action === 'claim' && user.role === 'booster') {
      const orderResult = await query(
        'SELECT * FROM boost_orders WHERE id = $1 AND status = $2',
        [params.id, 'pending']
      )

      if (orderResult.rows.length === 0) {
        return NextResponse.json(
          { error: 'Order not found or already claimed' },
          { status: 404 }
        )
      }

      const result = await query(
        `UPDATE boost_orders 
         SET status = $1, booster_id = $2, booster_name = $3, claimed_at = CURRENT_TIMESTAMP
         WHERE id = $4
         RETURNING *`,
        ['claimed', user.userId, user.name, params.id]
      )

      return NextResponse.json(result.rows[0])
    }

    if (status) {
      const validStatuses = ['pending', 'claimed', 'in_progress', 'completed', 'cancelled']
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: 'Invalid status' },
          { status: 400 }
        )
      }

      let updateQuery = 'UPDATE boost_orders SET status = $1'
      const queryParams: any[] = [status, params.id]
      
      if (status === 'completed') {
        updateQuery += ', completed_at = CURRENT_TIMESTAMP'
      }
      
      updateQuery += ' WHERE id = $2'

      if (user.role === 'booster') {
        updateQuery += ' AND booster_id = $3'
        queryParams.push(user.userId)
      } else if (user.role === 'buyer') {
        updateQuery += ' AND buyer_id = $3'
        queryParams.push(user.userId)
      } else if (user.role !== 'admin') {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }

      updateQuery += ' RETURNING *'

      const result = await query(updateQuery, queryParams)

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Order not found or unauthorized' },
          { status: 404 }
        )
      }

      return NextResponse.json(result.rows[0])
    }

    return NextResponse.json(
      { error: 'No valid action or status provided' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Update boost order error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
