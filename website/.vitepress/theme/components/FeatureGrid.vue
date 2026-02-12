<template>
  <div class="feature-grid">
    <div
      v-for="feature in features"
      :key="feature.title"
      class="feature-grid-item"
    >
      <div v-if="feature.icon" class="feature-grid-icon">{{ feature.icon }}</div>
      <h3 class="feature-grid-title">{{ feature.title }}</h3>
      <p class="feature-grid-desc">{{ feature.details }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  features: Array<{
    title: string;
    details: string;
    icon?: string;
  }>;
}>();
</script>

<style scoped>
.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin: 24px 0;
}

.feature-grid-item {
  padding: 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.feature-grid-item:hover {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.feature-grid-icon {
  font-size: 1.5rem;
  margin-bottom: 8px;
}

.feature-grid-title {
  margin: 0 0 8px;
  font-size: 1rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.feature-grid-desc {
  margin: 0;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}
</style>
