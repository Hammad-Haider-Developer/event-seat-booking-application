<template>
  <article class="event-card">
    <div class="event-card__top">
      <span class="badge">{{ event.category }}</span>
      <span class="event-card__price">From {{ formatCurrency(event.startingPrice) }}</span>
    </div>

    <div class="event-card__body">
      <h3>{{ event.name }}</h3>
      <p class="muted">{{ event.description }}</p>

      <div class="event-meta">
        <span>📅 {{ formattedDate }}</span>
        <span>🕒 {{ formattedTime }}</span>
        <span>📍 {{ event.venue }}</span>
      </div>
    </div>

    <div class="event-card__footer">
      <span><strong>{{ availableSeats }}</strong> seats available</span>
      <router-link class="btn btn-primary btn-sm" :to="{ name: 'event-details', params: { eventId: event.id } }">
        View seats
      </router-link>
    </div>
  </article>
</template>

<script>
import { formatCurrency } from '../utils/pricing'

export default {
  name: 'EventCard',
  props: {
    event: {
      type: Object,
      required: true
    },
    availableSeats: {
      type: Number,
      default: 0
    }
  },
  computed: {
    formattedDate() {
      return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
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
  methods: {
    formatCurrency
  }
}
</script>
