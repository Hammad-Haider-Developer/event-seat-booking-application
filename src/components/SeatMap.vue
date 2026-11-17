<template>
  <section class="seat-map-card">
    <div class="section-heading">
      <div>
        <p class="eyebrow">Choose your seats</p>
        <h2>Seat map</h2>
      </div>
      <div class="seat-legend">
        <span><i class="seat-dot available"></i> Available</span>
        <span><i class="seat-dot selected"></i> Selected</span>
        <span><i class="seat-dot reserved"></i> Reserved</span>
        <span><i class="seat-dot booked"></i> Booked</span>
        <span><i class="seat-dot blocked"></i> Blocked</span>
      </div>
    </div>

    <div class="stage">STAGE</div>

    <div class="seat-map">
      <div v-for="row in rows" :key="row" class="seat-row">
        <span class="row-label">{{ row }}</span>

        <button
          v-for="seat in seatsByRow(row)"
          :key="seat.id"
          class="seat"
          :class="[seat.status, { 'gap-seat': gapIds.includes(seat.id) }]"
          :disabled="!canInteract(seat)"
          :title="seatTitle(seat)"
          @click="toggleSeat(seat)"
        >
          {{ seat.number }}
        </button>

        <span class="row-label">{{ row }}</span>
      </div>
    </div>

    <div v-if="gapIds.length" class="notice notice-warning">
      <strong>Seat-gap rule:</strong> {{ gapIds.join(', ') }} {{ gapIds.length === 1 ? 'would' : 'would' }}
      become an unnecessary isolated seat. Choose a neighbouring seat instead.
    </div>

    <div class="category-prices">
      <span><b class="vip">VIP</b> {{ formatCurrency(prices.VIP) }}</span>
      <span><b class="premium">Premium</b> {{ formatCurrency(prices.Premium) }}</span>
      <span><b class="standard">Standard</b> {{ formatCurrency(prices.Standard) }}</span>
    </div>
  </section>
</template>

<script>
import { formatCurrency, getSeatPrice } from '../utils/pricing'
import { getSeatGapIds, wouldCreateIsolatedGap } from '../utils/seatUtils'

export default {
  name: 'SeatMap',
  props: {
    seats: {
      type: Array,
      required: true
    },
    selectedIds: {
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
    }
  },
  emits: ['select', 'deselect', 'invalid'],
  computed: {
    rows() {
      return [...new Set(this.seats.map((seat) => seat.row))]
    },
    gapIds() {
      return getSeatGapIds(this.seats, this.selectedIds)
    },
    prices() {
      return {
        VIP: getSeatPrice('VIP', this.event),
        Premium: getSeatPrice('Premium', this.event),
        Standard: getSeatPrice('Standard', this.event)
      }
    }
  },
  methods: {
    formatCurrency,
    seatsByRow(row) {
      return this.seats.filter((seat) => seat.row === row)
    },
    canInteract(seat) {
      return seat.status === 'available' || seat.status === 'selected'
    },
    seatTitle(seat) {
      if (seat.status === 'booked') return `${seat.id} is booked`
      if (seat.status === 'reserved') return `${seat.id} is temporarily reserved`
      if (seat.status === 'blocked') return `${seat.id} is blocked`
      if (this.gapIds.includes(seat.id)) return `${seat.id} is an isolated gap`
      return `${seat.id} — ${seat.category}`
    },
    toggleSeat(seat) {
      if (seat.status !== 'available' && seat.status !== 'selected') {
        this.$emit('invalid', { type: 'unavailable', seat })
        return
      }

      if (seat.status === 'selected') {
        this.$emit('deselect', seat)
        return
      }

      if (this.selectedIds.length >= this.maxSeats) {
        this.$emit('invalid', { type: 'limit', seat })
        return
      }

      if (wouldCreateIsolatedGap(this.seats, this.selectedIds, seat.id)) {
        this.$emit('invalid', { type: 'gap', seat })
        return
      }

      this.$emit('select', seat)
    }
  }
}
</script>
