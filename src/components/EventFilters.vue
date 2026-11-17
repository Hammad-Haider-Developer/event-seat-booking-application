<template>
  <section class="filter-panel">
    <div class="field field--search">
      <label for="search">Search events</label>
      <input id="search" :value="filters.search" @input="update('search', $event.target.value)" placeholder="Search by event, venue or category..." />
    </div>

    <div class="field">
      <label for="category">Category</label>
      <select id="category" :value="filters.category" @change="update('category', $event.target.value)">
        <option value="All">All categories</option>
        <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
      </select>
    </div>

    <div class="field">
      <label for="sort">Sort by</label>
      <select id="sort" :value="filters.sort" @change="update('sort', $event.target.value)">
        <option value="dateAsc">Date: earliest</option>
        <option value="dateDesc">Date: latest</option>
        <option value="priceAsc">Price: low to high</option>
        <option value="priceDesc">Price: high to low</option>
        <option value="nameAsc">Name: A–Z</option>
      </select>
    </div>

    <button class="btn btn-secondary" @click="$emit('reset')">Reset</button>
  </section>
</template>

<script>
export default {
  name: 'EventFilters',
  props: {
    filters: {
      type: Object,
      required: true
    },
    categories: {
      type: Array,
      default: () => []
    }
  },
  emits: ['update', 'reset'],
  methods: {
    update(key, value) {
      this.$emit('update', { key, value })
    }
  }
}
</script>
