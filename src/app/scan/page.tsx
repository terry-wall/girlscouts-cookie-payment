'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Scanner from '@/components/Scanner'

export default function ScanPage() {
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
  }, [])

  const handleScanResult = async (qrData: string) => {
    setIsScanning(false)
    
    try {
      // Parse QR code data - expected format: "COOKIE:TYPE:QUANTITY:PRICE"
      const parts = qrData.split(':')
      if (parts.length !== 4 || parts[0] !== 'COOKIE') {
        throw new Error('Invalid QR code format')
      }

      const [, cookieType, quantity, price] = parts
      
      // Create a new order
      const token = localStorage.getItem('token')
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: [{
            cookie_type: cookieType,
            quantity: parseInt(quantity),
            price: parseFloat(price)
          }]
        })
      })

      if (response.ok) {
        const { orderId } = await response.json()
        router.push(`/order/${orderId}`)
      } else {
        const error = await response.json()
        setError(error.error || 'Failed to create order')
      }
    } catch (err) {
      setError('Invalid QR code. Please scan a valid cookie box QR code.')
    }
  }

  const handleScanError = (error: string) => {
    setError(error)
    setIsScanning(false)
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-girl-scout-green mb-2">
          Scan Cookie Box
        </h2>
        <p className="text-gray-600">
          Point your camera at the QR code on the cookie box
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button 
            onClick={() => setError('')}
            className="ml-2 text-red-900 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      <div className="scanner-container mb-6">
        <Scanner
          isScanning={isScanning}
          onResult={handleScanResult}
          onError={handleScanError}
        />
      </div>

      <div className="space-y-4">
        {!isScanning ? (
          <button
            onClick={() => {
              setIsScanning(true)
              setError('')
            }}
            className="w-full bg-girl-scout-green text-white py-3 px-4 rounded-lg font-semibold hover:bg-girl-scout-dark-green transition-colors"
          >
            Start Scanning
          </button>
        ) : (
          <button
            onClick={() => setIsScanning(false)}
            className="w-full bg-red-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-600 transition-colors"
          >
            Stop Scanning
          </button>
        )}

        <button
          onClick={() => router.push('/dashboard')}
          className="w-full bg-gray-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
        >
          Back to Dashboard
        </button>
      </div>

      <div className="mt-6 text-center text-sm text-gray-500">
        <div className="mb-2 font-semibold">QR Code Format:</div>
        <div className="font-mono bg-gray-100 p-2 rounded text-xs">
          COOKIE:TYPE:QUANTITY:PRICE
        </div>
        <div className="mt-2 text-xs">
          Example: COOKIE:Thin Mints:12:5.00
        </div>
      </div>
    </div>
  )
}