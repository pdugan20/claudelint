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
  background: #1e1b18;
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
  color: #e5e5e5;
  margin: 0 0 12px;
}

.install-subtitle {
  font-size: 1rem;
  line-height: 1.6;
  color: #a8a69d;
  margin: 0 0 32px;
}

.install-command {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 14px 16px 14px 20px;
  cursor: pointer;
  transition: border-color 0.2s;
}

.install-command:hover {
  border-color: rgba(255, 255, 255, 0.2);
}

.install-code {
  font-family: 'SF Mono', 'Cascadia Code', 'Fira Code', 'Menlo', monospace;
  font-size: 0.9375rem;
  color: #e5e5e5;
  background: none;
  padding: 0;
  white-space: nowrap;
}

.install-copy {
  flex-shrink: 0;
  padding: 4px 12px;
  font-size: 0.75rem;
  font-weight: 500;
  color: #a8a69d;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  cursor: pointer;
  transition:
    color 0.2s,
    background 0.2s;
}

.install-copy:hover {
  color: #e5e5e5;
  background: rgba(255, 255, 255, 0.12);
}

.install-copy.copied {
  color: #98c379;
  border-color: rgba(152, 195, 121, 0.3);
}

.install-link {
  display: inline-block;
  margin-top: 24px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #a8a69d;
  text-decoration: none;
  transition: color 0.2s;
}

.install-link:hover {
  color: #e5e5e5;
}
</style>
