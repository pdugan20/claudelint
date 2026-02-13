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
  background: var(--cl-severity-error);
}

.rule-badge-warning::before {
  background: var(--cl-severity-warning);
}

.rule-badge-info::before {
  background: var(--cl-severity-info);
}
</style>
