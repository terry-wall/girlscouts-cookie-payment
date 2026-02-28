'use client'

import { useState } from 'react'

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

interface PaymentFormProps {
  order: Order
  onSuccess: () => void
  onError: (error: string) => void
}

export default function PaymentForm({ order, onSuccess, onError }: PaymentFormProps) {
  const [processing, setProcessing] = useState(false)
  const [cardNumber, setCardNumber] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [cvv, setCvv] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4)
    }
    return v
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProcessing(true)

    try {
      // In a real implementation, you would:
      // 1. Get the client secret from your checkout API
      // 2. Use Stripe.js to confirm the payment
      // 3. Handle the response
      
      // For demo purposes, we'll simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simulate successful payment
      const success = Math.random() > 0.1 // 90% success rate
      
      if (success) {
        onSuccess()
      } else {
        onError('Payment failed. Please try again.')
      }
    } catch (error) {
      onError('Payment processing failed. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cardholder Name
          </label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-girl-scout-green focus:border-transparent"
            placeholder="John Doe"
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-girl-scout-green focus:border-transparent"
            placeholder="john@example.com"
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Card Number
          </label>
          <input
            type="text"
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            required
            maxLength={19}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-girl-scout-green focus:border-transparent"
            placeholder="1234 5678 9012 3456"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Expiry Date
          </label>
          <input
            type="text"
            value={expiryDate}
            onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
            required
            maxLength={5}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-girl-scout-green focus:border-transparent"
            placeholder="MM/YY"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CVV
          </label>
          <input
            type="text"
            value={cvv}
            onChange={(e) => setCvv(e.target.value.replace(/[^0-9]/g, ''))}
            required
            maxLength={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-girl-scout-green focus:border-transparent"
            placeholder="123"
          />
        </div>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex justify-between items-center text-lg font-bold">
          <span>Total to Pay:</span>
          <span className="text-girl-scout-green">${order.total.toFixed(2)}</span>
        </div>
      </div>
      
      <button
        type="submit"
        disabled={processing}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {processing ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Processing Payment...
          </div>
        ) : (
          `Pay $${order.total.toFixed(2)}`
        )}
      </button>
      
      <div className="text-xs text-gray-500 text-center">
        This is a demo form. No real payment will be processed.
        <br />
        Use any card number for testing (e.g., 4242 4242 4242 4242)
      </div>
    </form>
  )
}