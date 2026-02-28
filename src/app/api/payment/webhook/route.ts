import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { Pool } from 'pg'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentSuccess(paymentIntent)
        break
      
      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent
        await handlePaymentFailure(failedPayment)
        break
      
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const client = await pool.connect()
  try {
    // Update order status to paid
    const result = await client.query(
      'UPDATE orders SET status = $1 WHERE stripe_payment_intent_id = $2 RETURNING *',
      ['paid', paymentIntent.id]
    )

    if (result.rows.length > 0) {
      console.log(`Order ${result.rows[0].id} marked as paid`)
    }
  } finally {
    client.release()
  }
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  const client = await pool.connect()
  try {
    // Update order status to failed
    const result = await client.query(
      'UPDATE orders SET status = $1 WHERE stripe_payment_intent_id = $2 RETURNING *',
      ['failed', paymentIntent.id]
    )

    if (result.rows.length > 0) {
      console.log(`Order ${result.rows[0].id} marked as failed`)
    }
  } finally {
    client.release()
  }
}