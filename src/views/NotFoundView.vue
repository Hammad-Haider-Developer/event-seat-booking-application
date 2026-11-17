<template>
  <div class="page">
    <div class="state-card">
      <div class="state-icon">404</div>
      <h1>Page not found</h1>
      <p>The page you requested does not exist.</p>
      <router-link class="btn btn-primary" to="/events">Back to events</router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotFoundView'
}
</script>
