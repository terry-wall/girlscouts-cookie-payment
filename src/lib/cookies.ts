export interface CookieType {
  name: string
  description: string
  price: number
  image?: string
}

export const COOKIE_TYPES: CookieType[] = [
  {
    name: 'Thin Mints',
    description: 'Crispy cookies layered with chocolate and infused with a refreshing mint flavor',
    price: 5.00
  },
  {
    name: 'Caramel deLites/Samoas',
    description: 'Crispy cookies layered with caramel, sprinkled with toasted coconut and striped with chocolate',
    price: 5.00
  },
  {
    name: 'Peanut Butter Patties/Tagalongs',
    description: 'Crispy cookies layered with peanut butter and covered with chocolate',
    price: 5.00
  },
  {
    name: 'Do-si-dos/Peanut Butter Sandwich',
    description: 'Crispy oatmeal sandwich cookies with peanut butter filling',
    price: 5.00
  },
  {
    name: 'Trefoils/Shortbread',
    description: 'Traditional shortbread cookies inspired by the original Girl Scout recipe',
    price: 5.00
  },
  {
    name: 'Lemon-Ups',
    description: 'Crispy lemon cookies with inspiring messages to lift your spirits',
    price: 5.00
  },
  {
    name: 'Toast-Yay!',
    description: 'French toast-inspired cookies with cinnamon and sweet icing',
    price: 5.00
  },
  {
    name: 'Adventurefuls',
    description: 'Brownie-inspired cookies with caramel-flavored crème and sea salt',
    price: 5.00
  }
]

export function getCookieByName(name: string): CookieType | undefined {
  return COOKIE_TYPES.find(cookie => 
    cookie.name.toLowerCase() === name.toLowerCase()
  )
}

export function formatCookieName(name: string): string {
  return name.replace(/\b\w/g, l => l.toUpperCase())
}

export function generateQRCodeData(cookieType: string, quantity: number, price: number): string {
  return `COOKIE:${cookieType}:${quantity}:${price.toFixed(2)}`
}

export function parseQRCodeData(qrData: string): {
  cookieType: string
  quantity: number
  price: number
} | null {
  try {
    const parts = qrData.split(':')
    if (parts.length !== 4 || parts[0] !== 'COOKIE') {
      return null
    }

    const [, cookieType, quantityStr, priceStr] = parts
    const quantity = parseInt(quantityStr)
    const price = parseFloat(priceStr)

    if (isNaN(quantity) || isNaN(price) || quantity <= 0 || price <= 0) {
      return null
    }

    return { cookieType, quantity, price }
  } catch (error) {
    return null
  }
}

export function calculateOrderTotal(items: Array<{ quantity: number; price: number }>): number {
  return items.reduce((total, item) => total + (item.quantity * item.price), 0)
}