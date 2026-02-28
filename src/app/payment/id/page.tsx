'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import PaymentForm from '@/components/PaymentForm'
import OrderSummary from '@/components/OrderSummary'
import QRCodeDisplay from '@/components/QRCodeDisplay'

interface Order {
  id: string
  total: number
  status: string
  created_at: string
  items: Array<{
    id: string
    cookie_type: string
    quantity: number
    price: number
  }>
}

export default function PaymentPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'qr'>('card')
  const [qrCodeUrl, setQrCodeUrl] = useState('')
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
        
        if (data.status === 'paid') {
          // Redirect if already paid
          router.push(`/order/${params.id}`)
          return
        }
        
        // Generate payment QR code URL
        const paymentUrl = `${window.location.origin}/payment/${params.id}?method=qr`
        setQrCodeUrl(paymentUrl)
      } else {
        setError('Order not found')
      }
    } catch (error) {
      setError('Failed to load order')
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentSuccess = () => {
    // Refresh order status
    fetchOrder()
    // Redirect to order page
    setTimeout(() => {
      router.push(`/order/${params.id}`)
    }, 2000)
  }

  const handlePaymentError = (error: string) => {
    setError(error)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-lg">Loading payment...</div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 text-center">
        <div className="text-red-600 mb-4">{error || 'Order not found'}</div>
        <button 
          onClick={() => router.push('/dashboard')}
          className="bg-girl-scout-green text-white px-4 py-2 rounded-md hover:bg-girl-scout-dark-green transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    )
  }

  if (order.status === 'paid') {
    return (
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 text-center">
        <div className="text-green-600 text-4xl mb-4">✅</div>
        <div className="text-xl font-bold text-green-600 mb-2">Payment Successful!</div>
        <div className="text-gray-600 mb-4">This order has already been paid.</div>
        <button 
          onClick={() => router.push(`/order/${params.id}`)}
          className="bg-girl-scout-green text-white px-4 py-2 rounded-md hover:bg-girl-scout-dark-green transition-colors"
        >
          View Order
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-girl-scout-green mb-4">
          Payment for Order #{order.id.slice(0, 8)}
        </h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <OrderSummary order={order} />
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">Payment Method</h3>
        
        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setPaymentMethod('card')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              paymentMethod === 'card'
                ? 'bg-white text-girl-scout-green shadow-sm'
                : 'text-gray-600 hover:text-girl-scout-green'
            }`}
          >
            💳 Credit Card
          </button>
          <button
            onClick={() => setPaymentMethod('qr')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              paymentMethod === 'qr'
                ? 'bg-white text-girl-scout-green shadow-sm'
                : 'text-gray-600 hover:text-girl-scout-green'
            }`}
          >
            📱 QR Code
          </button>
        </div>

        {paymentMethod === 'card' ? (
          <PaymentForm
            order={order}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />
        ) : (
          <QRCodeDisplay
            value={qrCodeUrl}
            size={256}
            title="Scan to Pay"
            description={`Show this QR code to the customer to complete payment of $${order.total.toFixed(2)}`}
          />
        )}
      </div>

      <div className="flex space-x-4">
        <button
          onClick={() => router.push(`/order/${params.id}`)}
          className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
        >
          Back to Order
        </button>
      </div>
    </div>
  )
}