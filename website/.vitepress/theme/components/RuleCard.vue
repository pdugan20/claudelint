<template>
  <a :href="link" class="rule-card">
    <code class="rule-card-id">{{ ruleId }}</code>
    <p class="rule-card-desc">{{ description }}</p>
    <div class="rule-card-footer">
      <span :class="['rule-card-severity', `rule-card-severity-${severity === 'warning' ? 'warning' : severity}`]">
        {{ severity === 'error' ? 'Error' : severity === 'info' ? 'Info' : 'Warning' }}
      </span>
      <span v-if="fixable" class="rule-card-fixable">Auto-fixable</span>
      <span class="rule-card-category">{{ category }}</span>
    </div>
  </a>
</template>

<script setup lang="ts">
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
  display: flex;
  flex-direction: column;
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

.rule-card-id {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  margin-bottom: 8px;
}

.rule-card-desc {
  margin: 0 0 12px;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
  flex-grow: 1;
}

.rule-card-footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  font-size: 0.75rem;
}

.rule-card-severity {
  padding: 2px 8px;
  border-radius: 999px;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.7rem;
  letter-spacing: 0.02em;
}

.rule-card-severity-error {
  background: rgba(220, 38, 38, 0.1);
  color: #dc2626;
}

.dark .rule-card-severity-error {
  background: rgba(248, 113, 113, 0.15);
  color: #f87171;
}

.rule-card-severity-warning {
  background: rgba(217, 119, 6, 0.1);
  color: #d97706;
}

.dark .rule-card-severity-warning {
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
}

.rule-card-severity-info {
  background: rgba(37, 99, 235, 0.1);
  color: #2563eb;
}

.dark .rule-card-severity-info {
  background: rgba(96, 165, 250, 0.15);
  color: #60a5fa;
}

.rule-card-fixable {
  padding: 2px 8px;
  background: rgba(22, 163, 74, 0.1);
  color: #16a34a;
  border-radius: 999px;
  font-weight: 500;
}

.dark .rule-card-fixable {
  background: rgba(74, 222, 128, 0.15);
  color: #4ade80;
}

.rule-card-category {
  padding: 2px 8px;
  background: rgba(37, 99, 235, 0.1);
  color: #2563eb;
  border-radius: 999px;
  font-weight: 500;
}

.dark .rule-card-category {
  background: rgba(96, 165, 250, 0.15);
  color: #60a5fa;
}
</style>
