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

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload
    
    const client = await pool.connect()
    try {
      const ordersResult = await client.query(`
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
        WHERE o.scout_id = $1
        GROUP BY o.id
        ORDER BY o.created_at DESC
      `, [decoded.userId])

      const orders = ordersResult.rows.map(row => ({
        ...row,
        total: parseFloat(row.total)
      }))

      return NextResponse.json({
        orders,
        scoutName: decoded.name
      })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Get orders error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload
    const { items } = await request.json()

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Items are required' },
        { status: 400 }
      )
    }

    // Calculate total
    const total = items.reduce((sum, item) => sum + (item.quantity * item.price), 0)

    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      // Create order
      const orderResult = await client.query(
        'INSERT INTO orders (scout_id, total) VALUES ($1, $2) RETURNING id',
        [decoded.userId, total]
      )
      
      const orderId = orderResult.rows[0].id

      // Add order items
      for (const item of items) {
        await client.query(
          'INSERT INTO order_items (order_id, cookie_type, quantity, price) VALUES ($1, $2, $3, $4)',
          [orderId, item.cookie_type, item.quantity, item.price]
        )
      }

      await client.query('COMMIT')

      return NextResponse.json({ orderId })
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Create order error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}