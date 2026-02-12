<template>
  <p class="rule-header-description">{{ description }}</p>
  <div class="rule-header-badges">
    <span :class="['rule-header-badge', `rule-header-badge-${severity}`]">
      {{ severity === 'error' ? 'Error' : 'Warning' }}
    </span>
    <span
      :class="[
        'rule-header-badge',
        fixable ? 'rule-header-badge-fixable' : 'rule-header-badge-not-fixable',
      ]"
    >
      {{ fixable ? 'Fixable' : 'Not Fixable' }}
    </span>
    <span class="rule-header-badge rule-header-badge-category">
      {{ category }}
    </span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  description: string;
  severity: 'error' | 'warning';
  fixable: boolean;
  category: string;
}>();
</script>

<style scoped>
.rule-header-description {
  margin-top: -0.5rem;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}

.rule-header-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.rule-header-badge {
  display: inline-block;
  padding: 0.25em 0.75em;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.01em;
}

.rule-header-badge-error {
  background: rgba(220, 38, 38, 0.1);
  color: #dc2626;
}

.dark .rule-header-badge-error {
  background: rgba(248, 113, 113, 0.15);
  color: #f87171;
}

.rule-header-badge-warning {
  background: rgba(217, 119, 6, 0.1);
  color: #d97706;
}

.dark .rule-header-badge-warning {
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
}

.rule-header-badge-fixable {
  background: rgba(22, 163, 74, 0.1);
  color: #16a34a;
}

.dark .rule-header-badge-fixable {
  background: rgba(74, 222, 128, 0.15);
  color: #4ade80;
}

.rule-header-badge-not-fixable {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-3);
}

.rule-header-badge-category {
  background: rgba(37, 99, 235, 0.1);
  color: #2563eb;
}

.dark .rule-header-badge-category {
  background: rgba(96, 165, 250, 0.15);
  color: #60a5fa;
}
</style>
