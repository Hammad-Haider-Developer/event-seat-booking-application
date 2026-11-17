<template>
  <div class="page page--narrow">
    <div v-if="loading" class="state-card">
      <div class="spinner"></div>
      <h2>Preparing confirmation…</h2>
    </div>

    <ErrorState v-else-if="error" :message="error" @retry="initialize" />

    <section v-else-if="confirmedBooking" class="confirmation-card">
      <div class="confirmation-card__hero">
        <span class="success-mark">✓</span>
        <p class="eyebrow">Booking confirmed</p>
        <h1>You’re all set!</h1>
        <p>Your seats are confirmed. Keep your booking reference for your records.</p>
      </div>

      <div class="confirmation-details">
        <div>
          <span>Event</span>
          <strong>{{ confirmedBooking.eventName }}</strong>
        </div>
        <div>
          <span>Date & time</span>
          <strong>{{ formattedDate }} · {{ formattedTime }}</strong>
        </div>
        <div>
          <span>Venue</span>
          <strong>{{ confirmedBooking.venue }}</strong>
        </div>
        <div>
          <span>Selected seats</span>
          <strong>{{ confirmedBooking.seatIds.join(', ') }}</strong>
        </div>
        <div>
          <span>Booking reference</span>
          <strong>{{ confirmedBooking.reference }}</strong>
        </div>
        <div>
          <span>Status</span>
          <strong>{{ confirmedBooking.status }}</strong>
        </div>
      </div>

      <div class="price-breakdown">
        <div><span>Subtotal</span><strong>{{ formatCurrency(confirmedBooking.subtotal) }}</strong></div>
        <div v-if="confirmedBooking.discount"><span>Quantity discount</span><strong>-{{ formatCurrency(confirmedBooking.discount) }}</strong></div>
        <div class="price-total"><span>Total</span><strong>{{ formatCurrency(confirmedBooking.total) }}</strong></div>
      </div>

      <div class="confirmation-actions">
        <router-link class="btn btn-primary btn-lg" to="/bookings">View booking history</router-link>
        <router-link class="btn btn-ghost" to="/events">Book another event</router-link>
      </div>
    </section>

    <section v-else class="confirmation-card">
      <div class="confirmation-card__hero">
        <span class="success-mark">✓</span>
        <p class="eyebrow">Almost there</p>
        <h1>Confirm your booking</h1>
        <p>Your selected seats are held while you complete this confirmation.</p>
        <CountdownTimer v-if="expiresAt" :expires-at="expiresAt" @expired="handleExpiry" />
      </div>

      <div class="confirmation-details">
        <div>
          <span>Event</span>
          <strong>{{ event.name }}</strong>
        </div>
        <div>
          <span>Date & time</span>
          <strong>{{ formattedDate }} · {{ formattedTime }}</strong>
        </div>
        <div>
          <span>Venue</span>
          <strong>{{ event.venue }}</strong>
        </div>
        <div>
          <span>Seats</span>
          <strong>{{ seatIds.join(', ') }}</strong>
        </div>
      </div>

      <div class="price-breakdown">
        <div><span>Subtotal</span><strong>{{ formatCurrency(pricing.subtotal) }}</strong></div>
        <div v-if="pricing.discount"><span>Quantity discount</span><strong>-{{ formatCurrency(pricing.discount) }}</strong></div>
        <div class="price-total"><span>Total</span><strong>{{ formatCurrency(pricing.total) }}</strong></div>
      </div>

      <div class="confirmation-actions">
        <button class="btn btn-primary btn-lg" :disabled="isConfirming" @click="confirmBooking">
          {{ isConfirming ? 'Confirming…' : 'Confirm booking' }}
        </button>
        <button class="btn btn-ghost" :disabled="isConfirming" @click="goBack">Change seats</button>
      </div>
    </section>
  </div>
</template>

<script>
import { events } from '../data/events'
import CountdownTimer from '../components/CountdownTimer.vue'
import ErrorState from '../components/ErrorState.vue'
import {
  createBookingReference,
  createStoredBooking,
  getActiveReservations,
  releaseReservations,
  confirmSeats,
  validateSeatsBeforeConfirmation
} from '../services/bookingService'
import { calculatePricing, formatCurrency } from '../utils/pricing'
import { buildSeats } from '../utils/seatUtils'

export default {
  name: 'BookingConfirmationView',
  components: { CountdownTimer, ErrorState },
  props: {
    bookingId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      loading: true,
      error: '',
      event: null,
      seatIds: [],
      expiresAt: 0,
      isConfirming: false,
      confirmedBooking: null
    }
  },
  computed: {
    seats() {
      if (!this.event) return []
      const overrides = {}
      const reservations = getActiveReservations(this.event.id)
      return buildSeats(this.event, overrides, reservations)
    },
    selectedSeats() {
      return this.seatIds.map((id) => this.seats.find((seat) => seat.id === id)).filter(Boolean)
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
  mounted() {
    this.initialize()
  },
  methods: {
    formatCurrency,
    initialize() {
      this.loading = true
      this.error = ''
      try {
        const eventId = this.$route.query.eventId
        const seats = String(this.$route.query.seats || '').split(',').filter(Boolean)
        const expiresAt = Number(this.$route.query.expiresAt)

        this.event = events.find((item) => item.id === eventId)
        if (!this.event) throw new Error('Event not found.')
        if (!seats.length) throw new Error('No seats were selected.')
        if (!expiresAt || expiresAt <= Date.now()) throw new Error('The temporary reservation has expired.')

        const active = getActiveReservations(this.event.id)
        const activeIds = new Set(active.map((item) => item.seatId))
        const missing = seats.filter((id) => !activeIds.has(id))
        if (missing.length) throw new Error(`The reservation for ${missing.join(', ')} is no longer active.`)

        this.seatIds = seats
        this.expiresAt = expiresAt
      } catch (err) {
        this.error = err.message || 'Unable to prepare the confirmation.'
      } finally {
        this.loading = false
      }
    },
    handleExpiry() {
      if (this.event) releaseReservations(this.event.id, this.seatIds)
      this.error = 'Your reservation expired before confirmation.'
      this.expiresAt = 0
    },
    goBack() {
      if (this.event) releaseReservations(this.event.id, this.seatIds)
      this.$router.push({ name: 'event-details', params: { eventId: this.event.id } })
    },
    confirmBooking() {
      if (this.isConfirming) return
      this.isConfirming = true

      try {
        const validation = validateSeatsBeforeConfirmation(
          this.event.id,
          this.seatIds,
          this.event.blockedSeats
        )

        if (!validation.valid) {
          releaseReservations(this.event.id, this.seatIds)
          this.error = `Booking conflict: ${validation.conflicts.join(', ')} became unavailable. Your reservation was released.`
          return
        }

        const now = new Date().toISOString()
        const booking = {
          id: `booking-${Date.now()}`,
          reference: createBookingReference(),
          eventId: this.event.id,
          eventName: this.event.name,
          date: this.event.date,
          time: this.event.time,
          venue: this.event.venue,
          location: this.event.location,
          seatIds: [...this.seatIds],
          total: this.pricing.total,
          subtotal: this.pricing.subtotal,
          discount: this.pricing.discount,
          status: 'Confirmed',
          createdAt: now
        }

        confirmSeats(this.event.id, this.seatIds)
        createStoredBooking(booking)
        this.confirmedBooking = booking
        this.expiresAt = 0
        window.dispatchEvent(new CustomEvent('seatly:toast', {
          detail: {
            type: 'success',
            title: 'Booking successful',
            message: `Reference ${booking.reference} has been created.`
          }
        }))
        this.$router.replace({ name: 'booking-confirmation', params: { bookingId: booking.id } })
      } finally {
        this.isConfirming = false
      }
    }
  }
}
</script>
