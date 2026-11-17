import { storage } from './storage'

export function createBookingReference() {
  const stamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).slice(2, 7).toUpperCase()
  return `ST-${stamp}-${random}`
}

export function reserveSeats(eventId, seatIds, expiresAt) {
  const now = Date.now()
  const reservations = storage.getReservations().filter((item) => item.expiresAt > now)
  const existing = reservations.filter((item) => item.eventId === eventId)

  if (seatIds.some((seatId) => existing.some((item) => item.seatId === seatId))) {
    throw new Error('One or more seats are already temporarily reserved.')
  }

  seatIds.forEach((seatId) => {
    reservations.push({
      eventId,
      seatId,
      expiresAt
    })
  })

  storage.saveReservations(reservations)
  return reservations
}

export function releaseReservations(eventId, seatIds = []) {
  const ids = new Set(seatIds)
  const reservations = storage.getReservations().filter((item) => {
    const sameEvent = item.eventId === eventId
    const selected = ids.size === 0 || ids.has(item.seatId)
    return !(sameEvent && selected)
  })
  storage.saveReservations(reservations)
  return reservations
}

export function cleanupExpiredReservations() {
  const now = Date.now()
  const reservations = storage.getReservations()
  const active = reservations.filter((item) => item.expiresAt > now)
  const expired = reservations.filter((item) => item.expiresAt <= now)
  if (expired.length) storage.saveReservations(active)
  return expired
}

export function getActiveReservations(eventId) {
  const now = Date.now()
  cleanupExpiredReservations()
  return storage.getReservations().filter(
    (item) => item.eventId === eventId && item.expiresAt > now
  )
}

export function getSeatStatusOverrides(eventId) {
  const state = storage.getSeatState()
  return state[eventId] || {}
}

export function setSeatStatus(eventId, seatId, status) {
  const state = storage.getSeatState()
  if (!state[eventId]) state[eventId] = {}
  state[eventId][seatId] = status
  storage.saveSeatState(state)
}

export function validateSeatsBeforeConfirmation(eventId, seatIds, baseBlockedSeats) {
  cleanupExpiredReservations()
  const state = getSeatStatusOverrides(eventId)
  const activeReservations = getActiveReservations(eventId)

  const conflicts = seatIds.filter((seatId) => {
    if (baseBlockedSeats.includes(seatId)) return true
    if (state[seatId] === 'booked' || state[seatId] === 'blocked') return true
    return activeReservations.some((reservation) => reservation.seatId === seatId)
  })

  return {
    valid: conflicts.length === 0,
    conflicts
  }
}

export function confirmSeats(eventId, seatIds) {
  const state = storage.getSeatState()
  if (!state[eventId]) state[eventId] = {}
  seatIds.forEach((seatId) => {
    state[eventId][seatId] = 'booked'
  })
  storage.saveSeatState(state)
  releaseReservations(eventId, seatIds)
}

export function createStoredBooking(booking) {
  const bookings = storage.getBookings()
  bookings.unshift(booking)
  storage.saveBookings(bookings)
  return booking
}

export function cancelStoredBooking(bookingId) {
  const bookings = storage.getBookings()
  const index = bookings.findIndex((booking) => booking.id === bookingId)
  if (index === -1) throw new Error('Booking not found.')

  bookings[index] = {
    ...bookings[index],
    status: 'Cancelled',
    cancelledAt: new Date().toISOString()
  }
  storage.saveBookings(bookings)

  const state = storage.getSeatState()
  const eventId = bookings[index].eventId
  const seatIds = bookings[index].seatIds
  if (state[eventId]) {
    seatIds.forEach((seatId) => {
      if (state[eventId][seatId] === 'booked') delete state[eventId][seatId]
    })
    storage.saveSeatState(state)
  }

  return bookings[index]
}
