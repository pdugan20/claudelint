<template>
  <p class="rule-header-description">
    {{ description }}
  </p>
  <div class="rule-header-badges">
    <span
      :class="[
        'rule-header-badge',
        severity === 'error' ? 'rule-header-badge-error' : 'rule-header-badge-warning',
      ]"
    >
      {{ severity === 'error' ? 'Error' : 'Warning' }}
    </span>
    <span v-if="fixable" class="rule-header-badge rule-header-badge-fixable"> Fixable </span>
    <span v-if="configurable" class="rule-header-badge rule-header-badge-configurable">
      Configurable
    </span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  description: string;
  severity: 'error' | 'warn' | 'warning';
  fixable: boolean;
  configurable: boolean;
  category: string;
}>();
</script>

<style scoped>
.rule-header-description {
  margin-top: 0.25rem;
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
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
}

/* --- Severity: colored dot --- */

.rule-header-badge-error::before,
.rule-header-badge-warning::before {
  content: '';
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.rule-header-badge-error::before {
  background: var(--cl-severity-error);
}

.rule-header-badge-warning::before {
  background: var(--cl-severity-warning);
}

/* --- Fixable: green dot --- */

.rule-header-badge-fixable::before {
  content: '';
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--cl-status-fixable);
  flex-shrink: 0;
}

/* --- Configurable: slate gray dot --- */

.rule-header-badge-configurable::before {
  content: '';
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--cl-status-configurable);
  flex-shrink: 0;
}
</style>
