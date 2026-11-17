<template>
  <div class="page">
    <header class="page-header">
      <div>
        <p class="eyebrow">Your bookings</p>
        <h1>Booking history</h1>
        <p>Review confirmed bookings and cancel eligible reservations.</p>
      </div>
      <router-link class="btn btn-primary" to="/events">Book another event</router-link>
    </header>

    <div class="history-toolbar">
      <div class="field">
        <label for="status">Filter status</label>
        <select id="status" v-model="statusFilter">
          <option value="All">All</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>
      <span class="muted">{{ filteredBookings.length }} booking{{ filteredBookings.length === 1 ? '' : 's' }}</span>
    </div>

    <EmptyState
      v-if="!filteredBookings.length"
      icon="⌁"
      title="No bookings yet"
      message="Your confirmed and cancelled bookings will appear here."
    />

    <section v-else class="booking-list">
      <BookingCard
        v-for="booking in filteredBookings"
        :key="booking.id"
        :booking="booking"
        @view="viewBooking"
        @cancel="cancelBooking"
      />
    </section>

    <div v-if="selectedBooking" class="modal-backdrop" @click.self="selectedBooking = null">
      <div class="modal-card">
        <button class="modal-close" @click="selectedBooking = null">×</button>
        <p class="eyebrow">Booking details</p>
        <h2>{{ selectedBooking.eventName }}</h2>
        <div class="confirmation-details">
          <div><span>Reference</span><strong>{{ selectedBooking.reference }}</strong></div>
          <div><span>Status</span><strong>{{ selectedBooking.status }}</strong></div>
          <div><span>Date</span><strong>{{ selectedBooking.date }} · {{ selectedBooking.time }}</strong></div>
          <div><span>Seats</span><strong>{{ selectedBooking.seatIds.join(', ') }}</strong></div>
          <div><span>Total</span><strong>{{ formatCurrency(selectedBooking.total) }}</strong></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import EmptyState from '../components/EmptyState.vue'
import BookingCard from '../components/BookingCard.vue'
import { cancelStoredBooking } from '../services/bookingService'
import { storage } from '../services/storage'
import { formatCurrency } from '../utils/pricing'

export default {
  name: 'BookingHistoryView',
  components: { EmptyState, BookingCard },
  data() {
    return {
      bookings: [],
      statusFilter: 'All',
      selectedBooking: null
    }
  },
  computed: {
    filteredBookings() {
      if (this.statusFilter === 'All') return this.bookings
      return this.bookings.filter((booking) => booking.status === this.statusFilter)
    }
  },
  mounted() {
    this.loadBookings()
  },
  methods: {
    formatCurrency,
    loadBookings() {
      this.bookings = storage.getBookings()
    },
    viewBooking(booking) {
      this.selectedBooking = booking
    },
    cancelBooking(booking) {
      if (!window.confirm(`Cancel booking ${booking.reference}? The seats will become available again.`)) return

      try {
        cancelStoredBooking(booking.id)
        this.loadBookings()
        window.dispatchEvent(new CustomEvent('seatly:toast', {
          detail: {
            type: 'success',
            title: 'Booking cancelled',
            message: `${booking.reference} was cancelled and its seats are available again.`
          }
        }))
      } catch (err) {
        window.dispatchEvent(new CustomEvent('seatly:toast', {
          detail: {
            type: 'error',
            title: 'Cancellation failed',
            message: err.message
          }
        }))
      }
    }
  }
}
</script>
