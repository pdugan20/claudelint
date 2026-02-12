<template>
  <a :href="link" class="rule-card">
    <div class="rule-card-header">
      <code class="rule-card-id">{{ ruleId }}</code>
      <RuleBadge :severity="severity" />
    </div>
    <p class="rule-card-desc">{{ description }}</p>
    <div class="rule-card-footer">
      <span v-if="fixable" class="rule-card-fixable">Auto-fixable</span>
      <span class="rule-card-category">{{ category }}</span>
    </div>
  </a>
</template>

<script setup lang="ts">
import RuleBadge from './RuleBadge.vue';

defineProps<{
  ruleId: string;
  description: string;
  severity: 'error' | 'warning' | 'info';
  category: string;
  link: string;
  fixable?: boolean;
}>();
</script>

<style scoped>
.rule-card {
  display: block;
  padding: 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  text-decoration: none;
  color: inherit;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.rule-card:hover {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.rule-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.rule-card-id {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--vp-c-brand-1);
}

.rule-card-desc {
  margin: 0 0 12px;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}

.rule-card-footer {
  display: flex;
  gap: 8px;
  font-size: 0.75rem;
}

.rule-card-fixable {
  padding: 2px 8px;
  background: rgba(22, 163, 74, 0.1);
  color: #16a34a;
  border-radius: 999px;
  font-weight: 500;
}

.rule-card-category {
  padding: 2px 8px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  border-radius: 999px;
  font-weight: 500;
}
</style>
