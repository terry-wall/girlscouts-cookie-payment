'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'

interface ScannerProps {
  isScanning: boolean
  onResult: (data: string) => void
  onError: (error: string) => void
}

export default function Scanner({ isScanning, onResult, onError }: ScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)

  useEffect(() => {
    if (isScanning) {
      startScanning()
    } else {
      stopScanning()
    }

    return () => {
      stopScanning()
    }
  }, [isScanning])

  const startScanning = async () => {
    try {
      // Check camera permission
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      stream.getTracks().forEach(track => track.stop())
      setHasPermission(true)

      // Initialize scanner
      if (!scannerRef.current) {
        scannerRef.current = new Html5QrcodeScanner(
          'qr-reader',
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
          },
          false
        )
      }

      scannerRef.current.render(
        (decodedText: string) => {
          stopScanning()
          onResult(decodedText)
        },
        (error: string) => {
          // Ignore common scanning errors
          if (!error.includes('NotFoundException')) {
            console.warn('QR scan error:', error)
          }
        }
      )
    } catch (error) {
      setHasPermission(false)
      onError('Camera permission denied. Please allow camera access and try again.')
    }
  }

  const stopScanning = () => {
    if (scannerRef.current) {
      try {
        scannerRef.current.clear()
      } catch (error) {
        // Scanner might already be cleared
      }
      scannerRef.current = null
    }
  }

  if (hasPermission === false) {
    return (
      <div className="text-center p-8 bg-yellow-50 rounded-lg border border-yellow-200">
        <div className="text-4xl mb-4">📷</div>
        <div className="text-lg font-semibold text-yellow-800 mb-2">
          Camera Access Required
        </div>
        <div className="text-yellow-700 mb-4">
          Please allow camera access to scan QR codes
        </div>
        <button
          onClick={() => {
            setHasPermission(null)
            if (isScanning) {
              startScanning()
            }
          }}
          className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="w-full">
      {isScanning ? (
        <div className="bg-gray-100 rounded-lg p-4">
          <div id="qr-reader" className="w-full"></div>
          <div className="text-center mt-4 text-sm text-gray-600">
            Position the QR code within the scanning area
          </div>
        </div>
      ) : (
        <div className="text-center p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-4xl mb-4">📱</div>
          <div className="text-lg font-semibold text-gray-700 mb-2">
            QR Code Scanner Ready
          </div>
          <div className="text-gray-600">
            Click "Start Scanning" to begin
          </div>
        </div>
      )}
    </div>
  )
}