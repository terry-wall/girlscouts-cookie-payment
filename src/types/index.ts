export interface User {
  id: string
  email: string
  name: string
  created_at: string
}

export interface Scout extends User {
  // Additional scout-specific properties can be added here
}

export interface OrderItem {
  id: string
  order_id: string
  cookie_type: string
  quantity: number
  price: number
  created_at: string
}

export interface Order {
  id: string
  scout_id: string
  total: number
  status: 'pending' | 'paid' | 'failed' | 'cancelled'
  stripe_payment_intent_id?: string
  created_at: string
  items: OrderItem[]
}

export interface CookieType {
  name: string
  description: string
  price: number
  image?: string
}

export interface PaymentIntent {
  id: string
  client_secret: string
  amount: number
  currency: string
  status: string
}

export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: User
}

export interface CreateOrderRequest {
  items: Array<{
    cookie_type: string
    quantity: number
    price: number
  }>
}

export interface CreateOrderResponse {
  orderId: string
}

export interface CheckoutResponse {
  clientSecret: string
  paymentIntentId: string
}

export interface QRCodeData {
  type: 'COOKIE'
  cookieType: string
  quantity: number
  price: number
}

export interface ScannerResult {
  data: string
  format: string
}

export interface PaymentFormData {
  cardNumber: string
  expiryDate: string
  cvv: string
  customerName: string
  customerEmail: string
}