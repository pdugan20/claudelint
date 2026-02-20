<template>
  <a :href="link" class="helper-card">
    <code class="helper-card-name">{{ name }}</code>
    <span class="helper-card-returns">{{ returns }}</span>
    <p class="helper-card-desc">{{ description }}</p>
  </a>
</template>

<script setup lang="ts">
defineProps<{
  name: string;
  returns: string;
  description: string;
  link: string;
}>();
</script>

<style scoped>
.helper-card {
  display: flex;
  flex-direction: column;
  padding: 16px;
  min-height: 145px;
  background: var(--vp-c-bg-elv);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  text-decoration: none;
  color: inherit;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.helper-card:hover {
  border-color: var(--vp-c-border);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.helper-card-name {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  background: none;
  padding: 0;
  margin-bottom: 4px;
}

.helper-card-returns {
  font-size: 0.75rem;
  font-family: var(--vp-font-family-mono);
  color: var(--vp-c-text-3);
  line-height: 1.3;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.helper-card-desc {
  margin: 0;
  font-size: 0.8125rem;
  color: var(--vp-c-text-2);
  line-height: 1.4;
  flex-grow: 1;
}
</style>
