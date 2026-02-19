<template>
  <div class="skill-card">
    <code class="skill-card-name">/{{ name }}</code>
    <p class="skill-card-desc">
      {{ description }}
    </p>
    <div class="skill-card-footer">
      <span class="skill-card-trigger"
        ><svg class="skill-card-icon" viewBox="0 0 16 16" fill="currentColor">
          <path
            d="M2 2.5A2.5 2.5 0 0 1 4.5 0h7A2.5 2.5 0 0 1 14 2.5v5A2.5 2.5 0 0 1 11.5 10H7l-3.5 3V10H4.5A2.5 2.5 0 0 1 2 7.5v-5Z"
            opacity="0.6"
          /></svg
        >{{ example }}</span
      >
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  name: string;
  description: string;
  example: string;
}>();
</script>

<style scoped>
.skill-card {
  display: flex;
  flex-direction: column;
  padding: 20px;
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

.skill-card:hover {
  border-color: var(--vp-c-border);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.skill-card-name {
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin-bottom: 8px;
  background: none;
  padding: 0;
}

.skill-card-desc {
  margin: 0 0 16px;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
  flex-grow: 1;
  min-height: calc(0.875rem * 1.5 * 3);
}

.skill-card-footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  font-size: 0.75rem;
}

.skill-card-trigger {
  font-size: 0.8125rem;
  font-weight: 400;
  color: var(--vp-c-text-3);
  line-height: 1.4;
}

.skill-card-icon {
  display: inline;
  width: 15px;
  height: 15px;
  vertical-align: -5px;
  margin-right: 4px;
}
</style>
