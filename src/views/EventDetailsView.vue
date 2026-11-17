<template>
  <div class="page">
    <div v-if="loading" class="state-card">
      <div class="spinner"></div>
      <h2>Loading event…</h2>
    </div>

    <ErrorState v-else-if="error" :message="error" @retry="loadEvent" />

    <template v-else-if="event">
      <header class="details-header">
        <router-link class="back-link" to="/events">← Back to events</router-link>
        <div class="details-title">
          <div>
            <span class="badge">{{ event.category }}</span>
            <h1>{{ event.name }}</h1>
            <p>{{ event.description }}</p>
          </div>
          <div class="details-facts">
            <span>📅 {{ formattedDate }}</span>
            <span>🕒 {{ formattedTime }}</span>
            <span>📍 {{ event.venue }} · {{ event.location }}</span>
          </div>
        </div>
      </header>

      <div class="booking-layout">
        <div>
          <SeatMap
            :event="event"
            :seats="seats"
            :selected-ids="selectedIds"
            :max-seats="maxSeats"
            @select="selectSeat"
            @deselect="deselectSeat"
            @invalid="handleInvalidSeat"
          />

          <div v-if="reservationExpiresAt" class="reservation-bar">
            <CountdownTimer :expires-at="reservationExpiresAt" @expired="expireReservation" />
            <button class="btn btn-secondary btn-sm" @click="releaseCurrentReservation">Release seats</button>
          </div>
        </div>

        <BookingSummary
          :event="event"
          :selected-seats="selectedSeats"
          :max-seats="maxSeats"
          :is-reserving="isReserving"
          @remove="deselectSeat"
          @reserve="reserveSelection"
          @simulate-conflict="simulateConflict"
        />
      </div>
    </template>
  </div>
</template>

<script>
import { events } from '../data/events'
import SeatMap from '../components/SeatMap.vue'
import BookingSummary from '../components/BookingSummary.vue'
import CountdownTimer from '../components/CountdownTimer.vue'
import ErrorState from '../components/ErrorState.vue'
import {
  cleanupExpiredReservations,
  getActiveReservations,
  getSeatStatusOverrides,
  releaseReservations,
  reserveSeats,
  setSeatStatus,
  validateSeatsBeforeConfirmation
} from '../services/bookingService'
import { buildSeats } from '../utils/seatUtils'
import { calculatePricing } from '../utils/pricing'

const RESERVATION_MINUTES = 5
const MAX_SEATS = 6

export default {
  name: 'EventDetailsView',
  components: { SeatMap, BookingSummary, CountdownTimer, ErrorState },
  props: {
    eventId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      loading: true,
      error: '',
      event: null,
      seats: [],
      selectedIds: [],
      reservationExpiresAt: null,
      isReserving: false,
      refreshTimer: null,
      maxSeats: MAX_SEATS
    }
  },
  computed: {
    selectedSeats() {
      return this.seats
        .filter((seat) => this.selectedIds.includes(seat.id))
        .map((seat) => ({ ...seat, status: 'selected' }))
    },
    pricing() {
      return calculatePricing(this.selectedSeats, this.event)
    },
    formattedDate() {
      return new Intl.DateTimeFormat('en-GB', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }).format(new Date(`${this.event.date}T12:00:00`))
    },
    formattedTime() {
      return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit'
      }).format(new Date(`${this.event.date}T${this.event.time}:00`))
    }
  },
  watch: {
    eventId: {
      immediate: true,
      handler() {
        this.loadEvent()
      }
    },
    selectedIds() {
      this.refreshSeats()
    }
  },
  beforeUnmount() {
    this.stopRefresh()
  },
  methods: {
    async loadEvent() {
      this.loading = true
      this.error = ''
      this.releaseCurrentReservation()
      try {
        await new Promise((resolve) => window.setTimeout(resolve, 200))
        this.event = events.find((item) => item.id === this.eventId)
        if (!this.event) throw new Error('Event not found.')
        cleanupExpiredReservations()
        this.refreshSeats()
        this.startRefresh()
      } catch (err) {
        this.error = err.message || 'Unable to load this event.'
      } finally {
        this.loading = false
      }
    },
    refreshSeats() {
      if (!this.event) return
      const overrides = getSeatStatusOverrides(this.event.id)
      const reservations = getActiveReservations(this.event.id)
      this.seats = buildSeats(this.event, overrides, reservations).map((seat) => ({
        ...seat,
        status: this.selectedIds.includes(seat.id) && seat.status === 'available'
          ? 'selected'
          : seat.status
      }))

      const stillAvailable = new Set(this.seats.filter((seat) => seat.status === 'selected' || seat.status === 'available').map((seat) => seat.id))
      this.selectedIds = this.selectedIds.filter((id) => stillAvailable.has(id))
    },
    startRefresh() {
      this.stopRefresh()
      this.refreshTimer = window.setInterval(() => {
        cleanupExpiredReservations()
        this.refreshSeats()
      }, 2000)
    },
    stopRefresh() {
      if (this.refreshTimer) {
        window.clearInterval(this.refreshTimer)
        this.refreshTimer = null
      }
    },
    selectSeat(seat) {
      if (this.selectedIds.length >= this.maxSeats) {
        this.notify('warning', 'Maximum reached', `You can select up to ${this.maxSeats} seats.`)
        return
      }
      this.selectedIds = [...this.selectedIds, seat.id]
      this.notify('success', 'Seat selected', `${seat.id} has been added to your booking.`)
    },
    deselectSeat(seat) {
      this.selectedIds = this.selectedIds.filter((id) => id !== seat.id)
      this.notify('info', 'Seat deselected', `${seat.id} has been removed.`)
    },
    handleInvalidSeat(payload) {
      if (payload.type === 'limit') {
        this.notify('warning', 'Maximum seat limit', `A booking can contain no more than ${this.maxSeats} seats.`)
      } else if (payload.type === 'gap') {
        this.notify('warning', 'Seat gap detected', `${payload.seat.id} would create an isolated seat.`)
      } else {
        this.notify('error', 'Seat unavailable', `${payload.seat.id} is no longer available.`)
        this.refreshSeats()
      }
    },
    reserveSelection() {
      if (!this.selectedIds.length || this.isReserving) return

      const validation = validateSeatsBeforeConfirmation(
        this.event.id,
        this.selectedIds,
        this.event.blockedSeats
      )

      if (!validation.valid) {
        this.releaseCurrentReservation()
        this.selectedIds = []
        this.refreshSeats()
        this.notify('error', 'Booking conflict', `These seats are no longer available: ${validation.conflicts.join(', ')}.`)
        return
      }

      this.isReserving = true
      try {
        const expiresAt = Date.now() + RESERVATION_MINUTES * 60 * 1000
        reserveSeats(this.event.id, this.selectedIds, expiresAt)
        this.reservationExpiresAt = expiresAt
        this.notify('success', 'Seats reserved', 'Your seats are temporarily held. Complete confirmation before the timer expires.')
        this.refreshSeats()
        this.$router.push({
          name: 'booking-confirmation',
          params: { bookingId: 'new' },
          query: { eventId: this.event.id, seats: this.selectedIds.join(','), expiresAt: this.reservationExpiresAt }
        })
      } catch (err) {
        this.notify('error', 'Reservation failed', err.message)
        this.refreshSeats()
      } finally {
        this.isReserving = false
      }
    },
    expireReservation() {
      if (!this.reservationExpiresAt) return
      releaseReservations(this.event.id, this.selectedIds)
      this.reservationExpiresAt = null
      this.selectedIds = []
      this.refreshSeats()
      this.notify('warning', 'Reservation expired', 'Your temporary reservation has been released.')
    },
    releaseCurrentReservation() {
      if (this.event && this.selectedIds.length) {
        releaseReservations(this.event.id, this.selectedIds)
      }
      this.reservationExpiresAt = null
      if (this.event) this.refreshSeats()
    },
    // Demo hook for the assignment's race-condition scenario.
    simulateConflict() {
      if (!this.selectedIds.length) return
      const target = this.selectedIds[0]
      setSeatStatus(this.event.id, target, 'booked')
      this.notify('info', 'Conflict simulated', `${target} was booked by another user. Confirmation will now reject it.`)
      this.confirmReservedBooking()
    },
    confirmReservedBooking() {
      if (!this.reservationExpiresAt) {
        this.reserveSelection()
        return
      }

      const validation = validateSeatsBeforeConfirmation(
        this.event.id,
        this.selectedIds,
        this.event.blockedSeats
      )

      if (!validation.valid) {
        const conflicted = validation.conflicts
        releaseReservations(this.event.id, this.selectedIds)
        this.reservationExpiresAt = null
        this.selectedIds = []
        this.refreshSeats()
        this.notify('error', 'Booking conflict', `${conflicted.join(', ')} became unavailable. Your temporary reservations were released.`)
        return
      }

      this.$router.push({
        name: 'booking-confirmation',
        params: { bookingId: 'new' },
        query: { eventId: this.event.id, seats: this.selectedIds.join(','), expiresAt: this.reservationExpiresAt }
      })
    },
    notify(type, title, message) {
      window.dispatchEvent(new CustomEvent('seatly:toast', { detail: { type, title, message } }))
    }
  }
}
</script>
