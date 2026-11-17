<template>
  <div class="toast-container" aria-live="polite">
    <transition-group name="toast">
      <div v-for="toast in toasts" :key="toast.id" class="toast" :class="`toast--${toast.type}`">
        <div>
          <strong>{{ toast.title }}</strong>
          <p>{{ toast.message }}</p>
        </div>
        <button class="toast__close" @click="$emit('dismiss', toast.id)">×</button>
      </div>
    </transition-group>
  </div>
</template>

<script>
export default {
  name: 'ToastContainer',
  props: {
    toasts: {
      type: Array,
      default: () => []
    }
  },
  emits: ['dismiss']
}
</script>
