<template>
  <div class="validator-diagram">
    <div class="vd-input">
      <div class="vd-box vd-box-input">claudelint check-all</div>
    </div>
    <div class="vd-arrow">&#x2193;</div>
    <div class="vd-engine">
      <div class="vd-box vd-box-engine">Validation Engine</div>
    </div>
    <div class="vd-arrow">&#x2193;</div>
    <div class="vd-validators">
      <div
        v-for="v in validators"
        :key="v.name"
        class="vd-box vd-box-validator"
      >
        <a v-if="v.link" :href="v.link" class="vd-link">
          <strong>{{ v.name }}</strong>
          <span class="vd-count">{{ v.rules }} rules</span>
        </a>
        <template v-else>
          <strong>{{ v.name }}</strong>
          <span class="vd-count">{{ v.rules }} rules</span>
        </template>
      </div>
    </div>
    <div class="vd-arrow">&#x2193;</div>
    <div class="vd-output">
      <div class="vd-box vd-box-output">Results + Formatting</div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  validators: Array<{
    name: string;
    rules: number;
    link?: string;
  }>;
}>();
</script>

<style scoped>
.validator-diagram {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  margin: 24px 0;
  padding: 24px;
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
}

.vd-arrow {
  font-size: 1.25rem;
  color: var(--vp-c-text-3);
  line-height: 1;
}

.vd-box {
  padding: 10px 20px;
  border-radius: 8px;
  text-align: center;
  font-size: 0.875rem;
}

.vd-box-input,
.vd-box-output {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  font-weight: 600;
  font-family: var(--vp-font-family-mono);
}

.vd-box-engine {
  background: var(--vp-c-bg);
  border: 2px solid var(--vp-c-brand-1);
  color: var(--vp-c-text-1);
  font-weight: 600;
}

.vd-validators {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  max-width: 100%;
}

.vd-box-validator {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 100px;
  transition: border-color 0.2s;
}

.vd-box-validator:hover {
  border-color: var(--vp-c-brand-1);
}

.vd-link {
  display: flex;
  flex-direction: column;
  gap: 2px;
  text-decoration: none;
  color: inherit;
}

.vd-count {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
}
</style>
