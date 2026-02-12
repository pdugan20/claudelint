<template>
  <div class="config-example">
    <div class="config-header">
      <span class="config-filename">{{ filename }}</span>
      <button class="config-copy" title="Copy" @click="copyCode">
        {{ justCopied ? 'Copied!' : 'Copy' }}
      </button>
    </div>
    <div class="config-body">
      <pre><code>{{ code }}</code></pre>
    </div>
    <p v-if="caption" class="config-caption">{{ caption }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  filename: string;
  code: string;
  caption?: string;
}>();

const justCopied = ref(false);

function copyCode() {
  navigator.clipboard.writeText(props.code);
  justCopied.value = true;
  setTimeout(() => {
    justCopied.value = false;
  }, 2000);
}
</script>

<style scoped>
.config-example {
  margin: 16px 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
}

.config-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: var(--vp-c-bg-soft);
  border-bottom: 1px solid var(--vp-c-divider);
}

.config-filename {
  font-family: var(--vp-font-family-mono);
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
}

.config-copy {
  padding: 2px 8px;
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s;
}

.config-copy:hover {
  color: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
}

.config-body pre {
  margin: 0;
  padding: 16px;
  background: var(--vp-code-block-bg);
  overflow-x: auto;
}

.config-body code {
  font-family: var(--vp-font-family-mono);
  font-size: 0.875rem;
  line-height: 1.6;
  color: var(--vp-c-text-1);
}

.config-caption {
  margin: 0;
  padding: 8px 16px;
  font-size: 0.8rem;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-soft);
  border-top: 1px solid var(--vp-c-divider);
}
</style>
