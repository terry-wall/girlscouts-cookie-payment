import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import Stripe from 'stripe'
import { Pool } from 'pg'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

interface JWTPayload {
  userId: string
  email: string
  name: string
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload
    
    const client = await pool.connect()
    try {
      // Get order details
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
        WHERE o.id = $1 AND o.scout_id = $2 AND o.status != 'paid'
        GROUP BY o.id
      `, [params.id, decoded.userId])

      if (orderResult.rows.length === 0) {
        return NextResponse.json(
          { error: 'Order not found or already paid' },
          { status: 404 }
        )
      }

      const order = orderResult.rows[0]
      const amount = Math.round(parseFloat(order.total) * 100) // Convert to cents

      // Create Stripe PaymentIntent
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'usd',
        metadata: {
          orderId: order.id,
          scoutId: decoded.userId,
          scoutEmail: decoded.email
        },
        description: `Girl Scout Cookie Order #${order.id.slice(0, 8)}`
      })

      // Update order with Stripe payment intent ID
      await client.query(
        'UPDATE orders SET stripe_payment_intent_id = $1 WHERE id = $2',
        [paymentIntent.id, order.id]
      )

      return NextResponse.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}