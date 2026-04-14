<template>
  <div class="vd-root">
    <div class="vd-card vd-card-landmark">claudelint check-all</div>
    <div class="vd-arrow">&#x2193;</div>

    <div class="vd-card vd-card-engine">
      <span class="vd-engine-label">Validation Engine</span>
      <span class="vd-engine-meta">{{ totalRules }} rules · parallel execution</span>
    </div>
    <div class="vd-arrow">&#x2193;</div>

    <div class="vd-grid">
      <component
        :is="v.link ? 'a' : 'div'"
        v-for="v in effectiveValidators"
        :key="v.name"
        :href="v.link"
        class="vd-card vd-card-validator"
      >
        <span class="vd-v-name">{{ v.name }}</span>
        <span class="vd-v-count">{{ v.rules }} {{ v.rules === 1 ? 'rule' : 'rules' }}</span>
      </component>
    </div>
    <div class="vd-arrow">&#x2193;</div>

    <div class="vd-card vd-card-landmark">Results + Formatting</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import stats from '../../../data/rule-stats.json';

interface ValidatorEntry {
  name: string;
  rules: number;
  link?: string;
}

const props = defineProps<{ validators?: ValidatorEntry[] }>();

const categoryLinks: Record<string, string> = {
  'claude-md': '/validators/claude-md',
  skills: '/validators/skills',
  settings: '/validators/settings',
  hooks: '/validators/hooks',
  mcp: '/validators/mcp',
  plugin: '/validators/plugin',
  agents: '/validators/agents',
  lsp: '/validators/lsp',
  'output-styles': '/validators/output-styles',
  commands: '/validators/commands',
};

const effectiveValidators: ValidatorEntry[] =
  props.validators ??
  Object.entries(stats.categories).map(([key, val]) => ({
    name: (val as { display: string; count: number }).display,
    rules: (val as { display: string; count: number }).count,
    link: categoryLinks[key],
  }));

const totalRules = computed(() => effectiveValidators.reduce((sum, v) => sum + v.rules, 0));
</script>

<style scoped>
.vd-root {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  margin: 24px 0;
  padding: 24px;
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
}

.vd-arrow {
  font-size: 1rem;
  line-height: 1;
  color: var(--vp-c-text-3);
}

.vd-card {
  padding: 8px 16px;
  border-radius: 8px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  text-align: center;
  text-decoration: none;
  color: inherit;
  font-size: 0.8125rem;
}

.vd-card-landmark {
  font-weight: 600;
  min-width: 180px;
}

.vd-card-engine {
  display: inline-flex;
  flex-direction: column;
  gap: 1px;
  padding: 8px 20px;
}

.vd-engine-label {
  font-weight: 600;
  font-size: 0.8125rem;
  color: var(--vp-c-text-1);
}

.vd-engine-meta {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
}

.vd-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 6px;
  width: 100%;
  max-width: 640px;
}

.vd-card-validator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  padding: 8px 10px;
  transition: border-color 0.15s;
}

.vd-card-validator:hover {
  border-color: var(--vp-c-brand-1);
}

.vd-v-name {
  font-weight: 600;
  font-size: 0.8125rem;
  color: var(--vp-c-text-1);
}

.vd-v-count {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
}

@media (max-width: 640px) {
  .vd-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
