<template>
  <div class="page">
    <section class="hero">
      <div>
        <p class="eyebrow">Find your next experience</p>
        <h1>Book your seat.<br /><span>Make the moment.</span></h1>
        <p>Explore events, choose the perfect seats and secure your booking in minutes.</p>
      </div>
      <div class="hero-stat">
        <strong>{{ filteredEvents.length }}</strong>
        <span>events to explore</span>
      </div>
    </section>

    <EventFilters
      :filters="filters"
      :categories="categories"
      @update="updateFilter"
      @reset="resetFilters"
    />

    <div v-if="loading" class="state-card">
      <div class="spinner"></div>
      <h2>Loading events…</h2>
      <p>Preparing the latest seat availability.</p>
    </div>

    <ErrorState v-else-if="error" :message="error" @retry="loadEvents" />

    <EmptyState
      v-else-if="!filteredEvents.length"
      icon="⌕"
      title="No events found"
      message="Try a different search term, category or sorting option."
    />

    <section v-else class="event-grid">
      <EventCard
        v-for="event in filteredEvents"
        :key="event.id"
        :event="event"
        :available-seats="availableSeatCount(event)"
      />
    </section>
  </div>
</template>

<script>
import { events } from '../data/events'
import EventCard from '../components/EventCard.vue'
import EventFilters from '../components/EventFilters.vue'
import EmptyState from '../components/EmptyState.vue'
import ErrorState from '../components/ErrorState.vue'
import { getActiveReservations, getSeatStatusOverrides } from '../services/bookingService'
import { buildSeats } from '../utils/seatUtils'

export default {
  name: 'EventsView',
  components: { EventCard, EventFilters, EmptyState, ErrorState },
  data() {
    return {
      loading: true,
      error: '',
      sourceEvents: [],
      filters: {
        search: '',
        category: 'All',
        sort: 'dateAsc'
      }
    }
  },
  computed: {
    categories() {
      return [...new Set(this.sourceEvents.map((event) => event.category))].sort()
    },
    filteredEvents() {
      const query = this.filters.search.trim().toLowerCase()
      const result = this.sourceEvents.filter((event) => {
        const matchesQuery = !query || [event.name, event.category, event.venue, event.location]
          .some((value) => value.toLowerCase().includes(query))
        const matchesCategory = this.filters.category === 'All' || event.category === this.filters.category
        return matchesQuery && matchesCategory
      })

      return [...result].sort((a, b) => {
        switch (this.filters.sort) {
          case 'dateDesc': return `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`)
          case 'priceAsc': return a.startingPrice - b.startingPrice
          case 'priceDesc': return b.startingPrice - a.startingPrice
          case 'nameAsc': return a.name.localeCompare(b.name)
          default: return `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)
        }
      })
    }
  },
  mounted() {
    this.loadEvents()
  },
  methods: {
    async loadEvents() {
      this.loading = true
      this.error = ''
      try {
        await new Promise((resolve) => window.setTimeout(resolve, 250))
        this.sourceEvents = events
      } catch {
        this.error = 'Unable to load event data.'
      } finally {
        this.loading = false
      }
    },
    updateFilter({ key, value }) {
      this.filters[key] = value
    },
    resetFilters() {
      this.filters = { search: '', category: 'All', sort: 'dateAsc' }
    },
    availableSeatCount(event) {
      const seats = buildSeats(event, getSeatStatusOverrides(event.id), getActiveReservations(event.id))
      return seats.filter((seat) => seat.status === 'available').length
    }
  }
}
</script>
