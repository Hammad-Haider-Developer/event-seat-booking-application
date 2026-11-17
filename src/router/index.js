import { createRouter, createWebHistory } from 'vue-router'
import EventsView from '../views/EventsView.vue'
import EventDetailsView from '../views/EventDetailsView.vue'
import BookingConfirmationView from '../views/BookingConfirmationView.vue'
import BookingHistoryView from '../views/BookingHistoryView.vue'
import NotFoundView from '../views/NotFoundView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/events' },
    { path: '/events', name: 'events', component: EventsView },
    { path: '/events/:eventId', name: 'event-details', component: EventDetailsView, props: true },
    { path: '/booking/confirmation/:bookingId', name: 'booking-confirmation', component: BookingConfirmationView, props: true },
    { path: '/bookings', name: 'booking-history', component: BookingHistoryView },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundView }
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0, behavior: 'smooth' }
  }
})

export default router
