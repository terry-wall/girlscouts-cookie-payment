'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import OrderSummary from '@/components/OrderSummary'
import Link from 'next/link'

interface OrderItem {
  id: string
  cookie_type: string
  quantity: number
  price: number
}

interface Order {
  id: string
  total: number
  status: string
  created_at: string
  items: OrderItem[]
}

export default function OrderPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [addingItem, setAddingItem] = useState(false)
  const [newItem, setNewItem] = useState({
    cookie_type: '',
    quantity: 1,
    price: 5.00
  })
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    fetchOrder()
  }, [params.id])

  const fetchOrder = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/orders/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setOrder(data)
      } else {
        setError('Order not found')
      }
    } catch (error) {
      setError('Failed to load order')
    } finally {
      setLoading(false)
    }
  }

  const handleAddItem = async () => {
    if (!newItem.cookie_type.trim()) {
      setError('Please enter a cookie type')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/orders/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'add_item',
          item: newItem
        })
      })

      if (response.ok) {
        const updatedOrder = await response.json()
        setOrder(updatedOrder)
        setNewItem({ cookie_type: '', quantity: 1, price: 5.00 })
        setAddingItem(false)
        setError('')
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to add item')
      }
    } catch (error) {
      setError('Failed to add item')
    }
  }

  const handleProceedToPayment = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/orders/${params.id}/checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        router.push(`/payment/${params.id}`)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to proceed to payment')
      }
    } catch (error) {
      setError('Failed to proceed to payment')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-lg">Loading order...</div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 text-center">
        <div className="text-red-600 mb-4">{error || 'Order not found'}</div>
        <Link 
          href="/dashboard"
          className="bg-girl-scout-green text-white px-4 py-2 rounded-md hover:bg-girl-scout-dark-green transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-girl-scout-green">
              Order #{order.id.slice(0, 8)}
            </h2>
            <p className="text-gray-600">
              Created: {new Date(order.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className={`px-3 py-1 rounded text-sm font-medium ${
            order.status === 'paid' ? 'bg-green-100 text-green-800' :
            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {order.status}
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <OrderSummary order={order} />
      </div>

      {order.status !== 'paid' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Add More Items</h3>
          
          {!addingItem ? (
            <button
              onClick={() => setAddingItem(true)}
              className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-500 hover:border-girl-scout-green hover:text-girl-scout-green transition-colors"
            >
              + Add Another Cookie Type
            </button>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cookie Type
                </label>
                <select
                  value={newItem.cookie_type}
                  onChange={(e) => setNewItem({ ...newItem, cookie_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-girl-scout-green"
                >
                  <option value="">Select a cookie type</option>
                  <option value="Thin Mints">Thin Mints</option>
                  <option value="Caramel deLites/Samoas">Caramel deLites/Samoas</option>
                  <option value="Peanut Butter Patties/Tagalongs">Peanut Butter Patties/Tagalongs</option>
                  <option value="Do-si-dos/Peanut Butter Sandwich">Do-si-dos/Peanut Butter Sandwich</option>
                  <option value="Trefoils/Shortbread">Trefoils/Shortbread</option>
                  <option value="Lemon-Ups">Lemon-Ups</option>
                  <option value="Toast-Yay!">Toast-Yay!</option>
                  <option value="Adventurefuls">Adventurefuls</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-girl-scout-green"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newItem.price}
                    onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-girl-scout-green"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleAddItem}
                  className="flex-1 bg-girl-scout-green text-white py-2 px-4 rounded-md font-semibold hover:bg-girl-scout-dark-green transition-colors"
                >
                  Add Item
                </button>
                <button
                  onClick={() => {
                    setAddingItem(false)
                    setNewItem({ cookie_type: '', quantity: 1, price: 5.00 })
                    setError('')
                  }}
                  className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md font-semibold hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex space-x-4">
        <Link
          href="/dashboard"
          className="flex-1 bg-gray-500 text-white text-center py-3 px-4 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
        >
          Back to Dashboard
        </Link>
        
        {order.status !== 'paid' && (
          <button
            onClick={handleProceedToPayment}
            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Proceed to Payment
          </button>
        )}
      </div>
    </div>
  )
}