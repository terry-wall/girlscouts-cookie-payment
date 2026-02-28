'use client'

import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'

interface QRCodeDisplayProps {
  value: string
  size?: number
  title?: string
  description?: string
}

export default function QRCodeDisplay({ 
  value, 
  size = 200, 
  title = 'QR Code',
  description 
}: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current && value) {
      QRCode.toCanvas(canvasRef.current, value, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }).catch((error) => {
        console.error('QR Code generation failed:', error)
      })
    }
  }, [value, size])

  if (!value) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg">
        <div className="text-gray-500">No QR code data provided</div>
      </div>
    )
  }

  return (
    <div className="text-center space-y-4">
      {title && (
        <h3 className="text-lg font-semibold">{title}</h3>
      )}
      
      <div className="inline-block p-4 bg-white rounded-lg shadow-sm border">
        <canvas 
          ref={canvasRef}
          className="max-w-full h-auto"
        />
      </div>
      
      {description && (
        <div className="text-sm text-gray-600 max-w-md mx-auto">
          {description}
        </div>
      )}
      
      <div className="text-xs text-gray-500 font-mono bg-gray-100 p-2 rounded max-w-md mx-auto break-all">
        {value}
      </div>
    </div>
  )
}