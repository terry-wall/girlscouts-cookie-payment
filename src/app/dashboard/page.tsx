'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Order {
  id: string
  total: number
  status: string
  created_at: string
  items: Array<{
    cookie_type: string
    quantity: number
    price: number
  }>
}

export default function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [scoutName, setScoutName] = useState('Scout')
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders)
        if (data.scoutName) {
          setScoutName(data.scoutName)
        }
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-girl-scout-green">
              Welcome back, {scoutName}!
            </h2>
            <p className="text-gray-600">Ready to sell some cookies?</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
          >
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/scan"
            className="bg-girl-scout-green text-white p-6 rounded-lg text-center hover:bg-girl-scout-dark-green transition-colors"
          >
            <div className="text-3xl mb-2">📱</div>
            <div className="text-xl font-semibold">Scan Cookie Box</div>
            <div className="text-sm opacity-90">Start a new order</div>
          </Link>

          <div className="bg-blue-500 text-white p-6 rounded-lg text-center">
            <div className="text-3xl mb-2">📊</div>
            <div className="text-xl font-semibold">Total Orders</div>
            <div className="text-2xl font-bold">{orders.length}</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-4">Recent Orders</h3>
        
        {orders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-4">🍪</div>
            <div>No orders yet. Start by scanning your first cookie box!</div>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 5).map((order) => (
              <Link
                key={order.id}
                href={`/order/${order.id}`}
                className="block border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold">Order #{order.id.slice(0, 8)}</div>
                    <div className="text-sm text-gray-600">
                      {new Date(order.created_at).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-600">
                      {order.items.length} item(s)
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">${order.total.toFixed(2)}</div>
                    <div className={`text-sm px-2 py-1 rounded ${
                      order.status === 'paid' ? 'bg-green-100 text-green-800' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}