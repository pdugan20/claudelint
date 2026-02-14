<template>
  <div class="schema-ref">
    <a v-if="validator" :href="validatorLink" class="schema-ref-pill">
      <span class="schema-ref-dot schema-ref-dot-validator" />
      <span class="schema-ref-label">Validator</span>
      <span class="schema-ref-value">{{ validator }}</span>
    </a>
    <a v-if="docs" :href="docsLink" class="schema-ref-pill" target="_blank" rel="noopener">
      <span class="schema-ref-dot schema-ref-dot-docs" />
      <span class="schema-ref-label">Official docs</span>
      <span class="schema-ref-value">{{ docs }}</span>
    </a>
    <a v-if="schema" :href="schemaLink" class="schema-ref-pill" target="_blank" rel="noopener">
      <span class="schema-ref-dot schema-ref-dot-schema" />
      <span class="schema-ref-label">JSON Schema</span>
      <span class="schema-ref-value">{{ schema }}</span>
    </a>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  validator?: string;
  validatorLink?: string;
  docs?: string;
  docsLink?: string;
  schema?: string;
  schemaLink?: string;
}>();
</script>

<style scoped>
.schema-ref {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 1rem 0 1.5rem;
}

.schema-ref-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  font-size: 0.85rem;
  line-height: 1.4;
  text-decoration: none !important;
  color: var(--vp-c-text-2) !important;
  transition:
    border-color 0.2s,
    background 0.2s;
}

.schema-ref-pill:hover {
  border-color: var(--vp-c-border);
  background: var(--vp-c-bg-alt);
}

.schema-ref-dot {
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.schema-ref-dot-validator {
  background: var(--cl-severity-info);
}

.schema-ref-dot-docs {
  background: var(--cl-severity-warning);
}

.schema-ref-dot-schema {
  background: var(--cl-status-fixable);
}

.schema-ref-label {
  font-weight: 500;
  color: var(--vp-c-text-3);
}

.schema-ref-value {
  font-weight: 500;
  color: var(--vp-c-text-1);
}
</style>
