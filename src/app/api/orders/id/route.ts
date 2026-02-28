import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

interface JWTPayload {
  userId: string
  email: string
  name: string
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload
    
    const client = await pool.connect()
    try {
      const orderResult = await client.query(`
        SELECT o.*, 
               json_agg(
                 json_build_object(
                   'id', oi.id,
                   'cookie_type', oi.cookie_type,
                   'quantity', oi.quantity,
                   'price', oi.price
                 )
               ) as items
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.id = $1 AND o.scout_id = $2
        GROUP BY o.id
      `, [params.id, decoded.userId])

      if (orderResult.rows.length === 0) {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        )
      }

      const order = {
        ...orderResult.rows[0],
        total: parseFloat(orderResult.rows[0].total)
      }

      return NextResponse.json(order)
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Get order error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload
    const { action, item } = await request.json()

    if (action !== 'add_item' || !item) {
      return NextResponse.json(
        { error: 'Invalid action or missing item' },
        { status: 400 }
      )
    }

    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      // Verify order belongs to user and is not paid
      const orderResult = await client.query(
        'SELECT * FROM orders WHERE id = $1 AND scout_id = $2 AND status != $3',
        [params.id, decoded.userId, 'paid']
      )

      if (orderResult.rows.length === 0) {
        return NextResponse.json(
          { error: 'Order not found or already paid' },
          { status: 404 }
        )
      }

      // Add new item
      await client.query(
        'INSERT INTO order_items (order_id, cookie_type, quantity, price) VALUES ($1, $2, $3, $4)',
        [params.id, item.cookie_type, item.quantity, item.price]
      )

      // Recalculate and update total
      const itemsResult = await client.query(
        'SELECT quantity, price FROM order_items WHERE order_id = $1',
        [params.id]
      )

      const newTotal = itemsResult.rows.reduce(
        (sum, row) => sum + (row.quantity * parseFloat(row.price)),
        0
      )

      await client.query(
        'UPDATE orders SET total = $1 WHERE id = $2',
        [newTotal, params.id]
      )

      await client.query('COMMIT')

      // Return updated order
      const updatedOrderResult = await client.query(`
        SELECT o.*, 
               json_agg(
                 json_build_object(
                   'id', oi.id,
                   'cookie_type', oi.cookie_type,
                   'quantity', oi.quantity,
                   'price', oi.price
                 )
               ) as items
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.id = $1
        GROUP BY o.id
      `, [params.id])

      const updatedOrder = {
        ...updatedOrderResult.rows[0],
        total: parseFloat(updatedOrderResult.rows[0].total)
      }

      return NextResponse.json(updatedOrder)
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Update order error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}