<template>
  <article class="booking-card">
    <div class="booking-card__main">
      <div class="booking-ref">{{ booking.reference }}</div>
      <h3>{{ booking.eventName }}</h3>
      <div class="booking-meta">
        <span>📅 {{ formattedDate }}</span>
        <span>📍 {{ booking.venue }}</span>
        <span>🪑 {{ booking.seatIds.join(', ') }}</span>
      </div>
    </div>

    <div class="booking-card__side">
      <span class="status-pill" :class="statusClass">{{ booking.status }}</span>
      <strong>{{ formatCurrency(booking.total) }}</strong>
      <button class="btn btn-secondary btn-sm" @click="$emit('view', booking)">View</button>
      <button v-if="booking.status === 'Confirmed'" class="btn btn-danger btn-sm" @click="$emit('cancel', booking)">
        Cancel
      </button>
    </div>
  </article>
</template>

<script>
import { formatCurrency } from '../utils/pricing'

export default {
  name: 'BookingCard',
  props: {
    booking: {
      type: Object,
      required: true
    }
  },
  emits: ['view', 'cancel'],
  computed: {
    formattedDate() {
      return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }).format(new Date(`${this.booking.date}T12:00:00`))
    },
    statusClass() {
      return this.booking.status.toLowerCase()
    }
  },
  methods: {
    formatCurrency
  }
}
</script>
