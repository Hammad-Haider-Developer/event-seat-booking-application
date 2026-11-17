const KEYS = {
  bookings: 'seatly_bookings_v1',
  seats: 'seatly_seat_state_v1',
  reservations: 'seatly_reservations_v1'
}

function read(key, fallback) {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export const storage = {
  getBookings() {
    return read(KEYS.bookings, [])
  },
  saveBookings(bookings) {
    write(KEYS.bookings, bookings)
  },
  getSeatState() {
    return read(KEYS.seats, {})
  },
  saveSeatState(state) {
    write(KEYS.seats, state)
  },
  getReservations() {
    return read(KEYS.reservations, [])
  },
  saveReservations(reservations) {
    write(KEYS.reservations, reservations)
  },
  clearAll() {
    Object.values(KEYS).forEach((key) => localStorage.removeItem(key))
  }
}
