<template>
  <span :class="['rule-badge', `rule-badge-${severity}`]">
    {{ severity === 'error' ? 'Error' : severity === 'info' ? 'Info' : 'Warning' }}
  </span>
</template>

<script setup lang="ts">
defineProps<{
  severity: 'error' | 'warning' | 'info';
}>();
</script>

<style scoped>
.rule-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  flex-shrink: 0;
  white-space: nowrap;
}

.rule-badge::before {
  content: '';
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.rule-badge-error::before {
  background: #dc2626;
}

.dark .rule-badge-error::before {
  background: #f87171;
}

.rule-badge-warning::before {
  background: #d97706;
}

.dark .rule-badge-warning::before {
  background: #fbbf24;
}

.rule-badge-info::before {
  background: #64748b;
}

.dark .rule-badge-info::before {
  background: #94a3b8;
}
</style>
