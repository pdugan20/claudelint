<template>
  <a :href="link" class="showcase-card">
    <code class="showcase-card-id">{{ ruleId }}</code>
    <p class="showcase-card-desc">{{ description }}</p>
    <div class="showcase-card-footer">
      <span
        :class="[
          'showcase-card-severity',
          `showcase-card-severity-${severity === 'warn' ? 'warning' : severity}`,
        ]"
      >
        {{ severity === 'error' ? 'Error' : severity === 'warn' ? 'Warning' : 'Info' }}
      </span>
      <span v-if="fixable" class="showcase-card-fixable">Fixable</span>
    </div>
  </a>
</template>

<script setup lang="ts">
defineProps<{
  ruleId: string;
  description: string;
  severity: 'error' | 'warn' | 'off';
  fixable: boolean;
  link: string;
}>();
</script>

<style scoped>
.showcase-card {
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
    box-shadow 0.2s,
    opacity 0.25s ease,
    transform 0.25s ease;
}

.showcase-card:hover {
  border-color: var(--vp-c-border);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.showcase-card-id {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin-bottom: 8px;
  background: none;
  padding: 0;
}

.showcase-card-desc {
  margin: 0 0 16px;
  font-size: 0.8125rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
  flex-grow: 1;
  height: 2.4375rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.showcase-card-footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  font-size: 0.75rem;
}

.showcase-card-severity {
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

.showcase-card-severity::before {
  content: '';
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.showcase-card-severity-error::before {
  background: var(--cl-severity-error);
}

.showcase-card-severity-warning::before {
  background: var(--cl-severity-warning);
}

.showcase-card-severity-info::before {
  background: var(--cl-severity-info);
}

.showcase-card-fixable {
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

.showcase-card-fixable::before {
  content: '';
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--cl-status-fixable);
  flex-shrink: 0;
}

/* Dark mode: lift pill bg above card bg */
.dark .showcase-card-severity,
.dark .showcase-card-fixable {
  background: rgba(255, 255, 255, 0.08);
}
</style>
