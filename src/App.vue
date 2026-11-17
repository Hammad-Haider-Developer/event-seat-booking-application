<template>
  <div id="app-shell">
    <header class="app-header">
      <router-link class="brand" to="/events">
        <span class="brand-mark">S</span>
        <span>Seat<span>ly</span></span>
      </router-link>

      <nav>
        <router-link to="/events" active-class="active">Events</router-link>
        <router-link to="/bookings" active-class="active">My bookings</router-link>
      </nav>
    </header>

    <main>
      <router-view />
    </main>

    <footer class="app-footer">
      <span>Seatly · Frontend Event Seat Booking System</span>
      <span>Vue 3 · Options API · LocalStorage</span>
    </footer>

    <ToastContainer :toasts="toasts" @dismiss="removeToast" />
  </div>
</template>

<script>
import ToastContainer from './components/ToastContainer.vue'

export default {
  name: 'App',
  components: { ToastContainer },
  data() {
    return {
      toasts: [],
      toastCounter: 0,
      toastListener: null
    }
  },
  mounted() {
    this.toastListener = (event) => this.addToast(event.detail)
    window.addEventListener('seatly:toast', this.toastListener)
  },
  beforeUnmount() {
    window.removeEventListener('seatly:toast', this.toastListener)
  },
  methods: {
    addToast(toast) {
      const id = ++this.toastCounter
      this.toasts.push({
        id,
        type: toast.type || 'info',
        title: toast.title || 'Notice',
        message: toast.message || ''
      })

      window.setTimeout(() => this.removeToast(id), 4500)
    },
    removeToast(id) {
      this.toasts = this.toasts.filter((toast) => toast.id !== id)
    }
  }
}
</script>
