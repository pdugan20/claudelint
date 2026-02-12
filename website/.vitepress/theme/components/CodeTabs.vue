<template>
  <div class="code-tabs">
    <div class="code-tabs-nav" role="tablist">
      <button
        v-for="(tab, index) in tabs"
        :key="tab.label"
        :class="['code-tabs-tab', { active: activeTab === index }]"
        role="tab"
        :aria-selected="activeTab === index"
        @click="activeTab = index"
      >
        {{ tab.label }}
      </button>
    </div>
    <div class="code-tabs-content">
      <div
        v-for="(tab, index) in tabs"
        v-show="activeTab === index"
        :key="tab.label"
        class="code-tabs-panel"
        role="tabpanel"
      >
        <div class="code-tabs-code">
          <button class="code-tabs-copy" title="Copy" @click="copy(tab.code)">
            {{ copied === index ? 'Copied!' : 'Copy' }}
          </button>
          <pre><code>{{ tab.code }}</code></pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  tabs: Array<{ label: string; code: string }>;
}>();

const activeTab = ref(0);
const copied = ref(-1);

function copy(text: string) {
  navigator.clipboard.writeText(text);
  copied.value = activeTab.value;
  setTimeout(() => {
    copied.value = -1;
  }, 2000);
}
</script>

<style scoped>
.code-tabs {
  margin: 16px 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
}

.code-tabs-nav {
  display: flex;
  background: var(--vp-c-bg-soft);
  border-bottom: 1px solid var(--vp-c-divider);
}

.code-tabs-tab {
  padding: 8px 16px;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--vp-c-text-2);
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition:
    color 0.2s,
    border-color 0.2s;
}

.code-tabs-tab:hover {
  color: var(--vp-c-text-1);
}

.code-tabs-tab.active {
  color: var(--vp-c-brand-1);
  border-bottom-color: var(--vp-c-brand-1);
}

.code-tabs-content {
  position: relative;
}

.code-tabs-code {
  position: relative;
}

.code-tabs-code pre {
  margin: 0;
  padding: 16px;
  background: var(--vp-c-bg-soft);
  overflow-x: auto;
}

.code-tabs-code code {
  font-family: var(--vp-font-family-mono);
  font-size: 0.875rem;
  line-height: 1.6;
}

.code-tabs-copy {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 10px;
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
}

.code-tabs-code:hover .code-tabs-copy {
  opacity: 1;
}
</style>
