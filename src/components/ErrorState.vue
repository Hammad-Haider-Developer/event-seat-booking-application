<template>
  <div class="state-card state-card--error">
    <div class="state-icon">!</div>
    <h2>{{ title }}</h2>
    <p>{{ message }}</p>
    <button class="btn btn-primary" @click="$emit('retry')">Try again</button>
  </div>
</template>

<script>
export default {
  name: 'ErrorState',
  props: {
    title: { type: String, default: 'Something went wrong' },
    message: { type: String, default: 'Please try again.' }
  },
  emits: ['retry']
}
</script>
