import Link from 'next/link'

export default function Home() {
  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-girl-scout-green mb-2">
          Welcome to Cookie Sales!
        </h2>
        <p className="text-gray-600">
          Scan cookie boxes, create orders, and process payments
        </p>
      </div>
      
      <div className="space-y-4">
        <Link 
          href="/login" 
          className="block w-full bg-girl-scout-green text-white text-center py-3 px-4 rounded-lg font-semibold hover:bg-girl-scout-dark-green transition-colors"
        >
          Get Started
        </Link>
        
        <div className="text-center text-sm text-gray-500">
          New to the app? Login to start selling cookies!
        </div>
      </div>
      
      <div className="mt-8 grid grid-cols-3 gap-4 text-center">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-2xl mb-2">📱</div>
          <div className="text-sm font-medium">Scan Boxes</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-2xl mb-2">📋</div>
          <div className="text-sm font-medium">Create Orders</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-2xl mb-2">💳</div>
          <div className="text-sm font-medium">Process Payments</div>
        </div>
      </div>
    </div>
  )
}