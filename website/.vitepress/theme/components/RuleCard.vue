<template>
  <a :href="link" class="rule-card">
    <code class="rule-card-id">{{ ruleId }}</code>
    <p class="rule-card-desc">{{ description }}</p>
    <div class="rule-card-footer">
      <span
        :class="[
          'rule-card-severity',
          `rule-card-severity-${severity === 'warning' ? 'warning' : severity}`,
        ]"
      >
        {{ severity === 'error' ? 'Error' : severity === 'info' ? 'Info' : 'Warning' }}
      </span>
      <span v-if="fixable" class="rule-card-fixable">Fixable</span>
      <span v-if="configurable" class="rule-card-configurable">Configurable</span>
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
  configurable?: boolean;
}>();
</script>

<style scoped>
.rule-card {
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

.rule-card:hover {
  border-color: var(--vp-c-border);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.rule-card-id {
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin-bottom: 8px;
  background: none;
  padding: 0;
}

.rule-card-desc {
  margin: 0 0 16px;
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

/* --- Dark mode: lift pill bg above card bg --- */

.dark .rule-card-severity,
.dark .rule-card-fixable,
.dark .rule-card-configurable {
  background: rgba(255, 255, 255, 0.08);
}

/* --- Severity pills: colored dot + neutral background --- */

.rule-card-severity {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.75rem;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
}

.rule-card-severity::before {
  content: '';
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.rule-card-severity-error::before {
  background: var(--cl-severity-error);
}

.rule-card-severity-warning::before {
  background: var(--cl-severity-warning);
}

.rule-card-severity-info::before {
  background: var(--cl-severity-info);
}

/* --- Fixable pill: green dot + neutral background --- */

.rule-card-fixable {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.75rem;
}

.rule-card-fixable::before {
  content: '';
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--cl-status-fixable);
  flex-shrink: 0;
}

/* --- Configurable pill: slate gray dot + neutral background --- */

.rule-card-configurable {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.75rem;
}

.rule-card-configurable::before {
  content: '';
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--cl-status-configurable);
  flex-shrink: 0;
}
</style>
