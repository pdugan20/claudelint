<template>
  <div class="pipeline-diagram">
    <div v-for="(stage, i) in stages" :key="stage.label" class="pd-stage-row">
      <div class="pd-stage">
        <div class="pd-label">{{ stage.label }}</div>
        <div class="pd-desc">{{ stage.description }}</div>
      </div>
      <div v-if="i < stages.length - 1" class="pd-arrow">&#x2193;</div>
    </div>
  </div>
</template>

<script setup lang="ts">
const stages = [
  { label: 'CLI / API', description: 'claudelint check-all or programmatic call' },
  { label: 'Configuration', description: 'Merge CLI flags, .claudelintrc.json, defaults' },
  { label: 'File Discovery', description: 'Find files matching validator patterns' },
  { label: 'Parallel Validators', description: '10 validators run concurrently via Promise.all' },
  { label: 'Rule Execution', description: 'Each rule checks one aspect, reports violations' },
  { label: 'Formatters', description: 'stylish, json, compact, sarif, github' },
  { label: 'Exit Code', description: '0 = clean, 1 = warnings, 2 = errors' },
];
</script>

<style scoped>
.pipeline-diagram {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 24px 0;
  padding: 24px;
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
}

.pd-stage-row {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.pd-stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 10px 24px;
  border-radius: 8px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  text-align: center;
  width: 100%;
  max-width: 380px;
  transition: border-color 0.2s;
}

.pd-stage:hover {
  border-color: var(--vp-c-border);
}

.pd-label {
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--vp-c-text-1);
}

.pd-desc {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
}

.pd-arrow {
  font-size: 1.25rem;
  color: var(--vp-c-text-3);
  line-height: 1;
  padding: 4px 0;
}
</style>
