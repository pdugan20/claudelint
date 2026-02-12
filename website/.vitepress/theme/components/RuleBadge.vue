<template>
  <span :class="['rule-badge', `rule-badge-${severity}`]">
    {{ severity }}
  </span>
</template>

<script setup lang="ts">
defineProps<{
  severity: 'error' | 'warning' | 'info';
}>();
</script>

<style scoped>
.rule-badge {
  display: inline-block;
  padding: 0.2em 0.6em;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  flex-shrink: 0;
  white-space: nowrap;
}

.rule-badge-error {
  background: rgba(220, 38, 38, 0.1);
  color: #dc2626;
}

.rule-badge-warning {
  background: rgba(217, 119, 6, 0.1);
  color: #d97706;
}

.rule-badge-info {
  background: rgba(37, 99, 235, 0.1);
  color: #2563eb;
}
</style>
