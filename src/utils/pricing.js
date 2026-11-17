export const BASE_PRICES = {
  VIP: 5000,
  Premium: 3500,
  Standard: 2500
}

export function getSeatBasePrice(category, event) {
  return event?.seatPrices?.[category] ?? BASE_PRICES[category] ?? event.startingPrice
}

export function isWeekend(dateString) {
  const day = new Date(`${dateString}T12:00:00`).getDay()
  return day === 0 || day === 6
}

export function getSeatPrice(category, event) {
  const base = getSeatBasePrice(category, event)
  return isWeekend(event.date) ? Math.round(base * 1.1) : base
}

export function getQuantityDiscount(count) {
  if (count >= 6) return 0.1
  if (count >= 4) return 0.05
  return 0
}

export function calculatePricing(seats, event) {
  const subtotal = seats.reduce((sum, seat) => sum + getSeatPrice(seat.category, event), 0)
  const discountRate = getQuantityDiscount(seats.length)
  const discount = Math.round(subtotal * discountRate)
  const total = subtotal - discount

  return {
    subtotal,
    discount,
    discountRate,
    total
  }
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0
  }).format(value)
}
