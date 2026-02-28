import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Check if database tables exist, create if not
    await initDatabase()

    // For demo purposes, create a default user if none exists
    await ensureDemoUser()

    const client = await pool.connect()
    try {
      // Find user by email
      const userResult = await client.query(
        'SELECT * FROM scouts WHERE email = $1',
        [email.toLowerCase()]
      )

      if (userResult.rows.length === 0) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        )
      }

      const user = userResult.rows[0]

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password)
      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        )
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email,
          name: user.name
        },
        process.env.JWT_SECRET!,
        { expiresIn: '24h' }
      )

      return NextResponse.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function initDatabase() {
  const client = await pool.connect()
  try {
    // Create scouts table
    await client.query(`
      CREATE TABLE IF NOT EXISTS scouts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `)

    // Create orders table
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        scout_id UUID REFERENCES scouts(id),
        total DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        stripe_payment_intent_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `)

    // Create order_items table
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
        cookie_type VARCHAR(255) NOT NULL,
        quantity INTEGER NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `)
  } finally {
    client.release()
  }
}

async function ensureDemoUser() {
  const client = await pool.connect()
  try {
    const result = await client.query('SELECT COUNT(*) FROM scouts')
    const userCount = parseInt(result.rows[0].count)
    
    if (userCount === 0) {
      const hashedPassword = await bcrypt.hash('password123', 10)
      await client.query(
        'INSERT INTO scouts (email, password, name) VALUES ($1, $2, $3)',
        ['scout@demo.com', hashedPassword, 'Demo Scout']
      )
    }
  } finally {
    client.release()
  }
}