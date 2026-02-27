<template>
  <section class="install-cta">
    <div class="install-inner">
      <h2 class="install-heading">Start linting in 30 seconds</h2>
      <p class="install-subtitle">One command to validate your entire Claude Code setup.</p>
      <div class="install-command" @click="copy">
        <code class="install-code">npx claudelint check-all</code>
        <button class="install-copy" :class="{ copied }" type="button">
          {{ copied ? 'Copied!' : 'Copy' }}
        </button>
      </div>
      <a href="/guide/getting-started" class="install-link">Read the docs &rarr;</a>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const copied = ref(false);

function copy() {
  navigator.clipboard.writeText('npx claudelint check-all');
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 2000);
}
</script>

<style scoped>
.install-cta {
  background: var(--vp-c-bg-alt);
  padding: 60px 24px 80px;
}

.install-inner {
  max-width: 480px;
  margin: 0 auto;
  text-align: center;
}

.install-heading {
  font-family: var(--cl-font-heading);
  font-size: 2rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--vp-c-text-1);
  margin: 0 0 12px;
}

.install-subtitle {
  font-size: 1rem;
  line-height: 1.6;
  color: var(--vp-c-text-2);
  margin: 0 0 32px;
}

.install-command {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: var(--vp-c-bg-elv);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 14px 16px 14px 20px;
  cursor: pointer;
  transition: border-color 0.2s;
}

.install-command:hover {
  border-color: var(--vp-c-border);
}

.install-code {
  font-family: 'SF Mono', 'Cascadia Code', 'Fira Code', 'Menlo', monospace;
  font-size: 0.9375rem;
  color: var(--vp-c-text-1);
  background: none;
  padding: 0;
  white-space: nowrap;
}

.install-copy {
  flex-shrink: 0;
  padding: 4px 12px;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  cursor: pointer;
  transition:
    color 0.2s,
    background 0.2s;
}

.install-copy:hover {
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg);
}

.install-copy.copied {
  color: #16a34a;
  border-color: rgba(22, 163, 74, 0.3);
}

.install-link {
  display: inline-block;
  margin-top: 24px;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--vp-c-text-2);
  text-decoration: none;
  transition: color 0.2s;
}

.install-link:hover {
  color: var(--vp-c-text-1);
}
</style>
