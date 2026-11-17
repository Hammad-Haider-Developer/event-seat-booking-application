<template>
  <div class="countdown" :class="{ urgent: remainingSeconds <= 60 }">
    <span class="countdown__label">Reservation expires in</span>
    <strong>{{ formattedTime }}</strong>
  </div>
</template>

<script>
export default {
  name: 'CountdownTimer',
  props: {
    expiresAt: {
      type: Number,
      required: true
    }
  },
  emits: ['expired'],
  data() {
    return {
      now: Date.now(),
      timer: null
    }
  },
  computed: {
    remainingSeconds() {
      return Math.max(0, Math.ceil((this.expiresAt - this.now) / 1000))
    },
    formattedTime() {
      const minutes = Math.floor(this.remainingSeconds / 60)
      const seconds = this.remainingSeconds % 60
      return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    }
  },
  watch: {
    remainingSeconds(value) {
      if (value === 0) {
        this.$emit('expired')
        this.stop()
      }
    }
  },
  mounted() {
    this.timer = window.setInterval(() => {
      this.now = Date.now()
    }, 1000)
  },
  beforeUnmount() {
    this.stop()
  },
  methods: {
    stop() {
      if (this.timer) {
        window.clearInterval(this.timer)
        this.timer = null
      }
    }
  }
}
</script>
