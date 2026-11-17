<template>
  <div class="state-card">
    <div class="state-icon">{{ icon }}</div>
    <h2>{{ title }}</h2>
    <p>{{ message }}</p>
    <button v-if="$slots.action" class="btn btn-primary" @click="$emit('action')">
      <slot name="action" />
    </button>
  </div>
</template>

<script>
export default {
  name: 'EmptyState',
  props: {
    icon: { type: String, default: '○' },
    title: { type: String, required: true },
    message: { type: String, required: true }
  },
  emits: ['action']
}
</script>
