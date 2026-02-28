'use client'

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

interface OrderSummaryProps {
  order: Order
}

export default function OrderSummary({ order }: OrderSummaryProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Order Summary</h3>
      
      <div className="space-y-3">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-200">
            <div className="flex-1">
              <div className="font-medium">{item.cookie_type}</div>
              <div className="text-sm text-gray-600">
                Quantity: {item.quantity} × ${item.price.toFixed(2)}
              </div>
            </div>
            <div className="font-semibold">
              ${(item.quantity * item.price).toFixed(2)}
            </div>
          </div>
        ))}
      </div>
      
      <div className="border-t border-gray-300 pt-3">
        <div className="flex justify-between items-center text-lg font-bold">
          <span>Total:</span>
          <span className="text-girl-scout-green">${order.total.toFixed(2)}</span>
        </div>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-3">
        <div className="text-sm text-gray-600">
          <div>Order ID: {order.id.slice(0, 8)}</div>
          <div>Created: {new Date(order.created_at).toLocaleString()}</div>
          <div className="mt-1">
            Status: 
            <span className={`ml-1 px-2 py-1 rounded text-xs font-medium ${
              order.status === 'paid' ? 'bg-green-100 text-green-800' :
              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              order.status === 'failed' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {order.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}