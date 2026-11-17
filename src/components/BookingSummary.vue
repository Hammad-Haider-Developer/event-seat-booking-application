<template>
  <aside class="summary-card">
    <div class="summary-card__header">
      <div>
        <p class="eyebrow">Your booking</p>
        <h2>Summary</h2>
      </div>
      <span class="summary-count">{{ selectedSeats.length }}/{{ maxSeats }}</span>
    </div>

    <div v-if="selectedSeats.length" class="summary-seats">
      <div v-for="seat in selectedSeats" :key="seat.id" class="summary-seat">
        <span>
          <strong>{{ seat.id }}</strong>
          <small>{{ seat.category }}</small>
        </span>
        <span>{{ formatCurrency(getSeatPrice(seat.category, event)) }}</span>
        <button class="icon-btn" aria-label="Remove seat" @click="$emit('remove', seat)">×</button>
      </div>
    </div>

    <div v-else class="empty-mini">
      <span class="empty-mini__icon">🪑</span>
      <p>Select up to {{ maxSeats }} available seats to continue.</p>
    </div>

    <div class="summary-lines">
      <div><span>Seats</span><strong>{{ selectedSeats.length }}</strong></div>
      <div><span>Subtotal</span><strong>{{ formatCurrency(pricing.subtotal) }}</strong></div>
      <div v-if="pricing.discount" class="discount-line">
        <span>Quantity discount</span><strong>-{{ formatCurrency(pricing.discount) }}</strong>
      </div>
      <div class="summary-total"><span>Total</span><strong>{{ formatCurrency(pricing.total) }}</strong></div>
    </div>

    <button
      class="btn btn-primary btn-block"
      :disabled="!selectedSeats.length || isReserving"
      @click="$emit('reserve')"
    >
      {{ isReserving ? 'Reserving…' : 'Reserve seats' }}
    </button>

    <button
      v-if="selectedSeats.length"
      class="btn btn-ghost btn-block"
      :disabled="isReserving"
      @click="$emit('simulate-conflict')"
    >
      Simulate booking conflict
    </button>

    <p class="summary-note">Reservations are temporary and expire after {{ reservationMinutes }} minutes.</p>
  </aside>
</template>

<script>
import { calculatePricing, formatCurrency, getSeatPrice } from '../utils/pricing'

export default {
  name: 'BookingSummary',
  props: {
    selectedSeats: {
      type: Array,
      default: () => []
    },
    event: {
      type: Object,
      required: true
    },
    maxSeats: {
      type: Number,
      default: 6
    },
    reservationMinutes: {
      type: Number,
      default: 5
    },
    isReserving: {
      type: Boolean,
      default: false
    }
  },
  emits: ['remove', 'reserve', 'simulate-conflict'],
  computed: {
    pricing() {
      return calculatePricing(this.selectedSeats, this.event)
    }
  },
  methods: {
    formatCurrency,
    getSeatPrice
  }
}
</script>
