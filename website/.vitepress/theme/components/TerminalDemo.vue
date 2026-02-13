<template>
  <div ref="terminalRef" class="terminal">
    <div class="terminal-chrome">
      <div class="terminal-dots">
        <span class="dot dot-red" />
        <span class="dot dot-yellow" />
        <span class="dot dot-green" />
      </div>
      <span class="terminal-title">Terminal</span>
      <div class="terminal-dots-spacer" />
    </div>
    <div ref="bodyRef" class="terminal-body">
      <div v-for="(line, i) in visibleLines" :key="i" :class="['terminal-line', line.type]">
        <!-- eslint-disable-next-line vue/no-v-html -->
        <span v-html="line.html" />
      </div>
      <span v-if="done" class="terminal-cursor" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';

interface Line {
  type: string;
  html: string;
}

const lines: Line[] = [
  { type: 'input', html: '<span class="prompt">$</span> claudelint check-all' },
  { type: 'blank', html: '&nbsp;' },
  {
    type: 'pass',
    html: '<span class="check">&#10003;</span> CLAUDE.md Validator <span class="dim">(41ms)</span>',
  },
  {
    type: 'pass',
    html: '<span class="check">&#10003;</span> All checks passed!',
  },
  { type: 'blank', html: '&nbsp;' },
  {
    type: 'pass',
    html: '<span class="check">&#10003;</span> Skills Validator <span class="dim">(58ms)</span>',
  },
  {
    type: 'detail',
    html: '<span class="cross">&#10007;</span> <span class="err">Error: Skill directory lacks CHANGELOG.md</span> <span class="dim">[skill-missing-changelog]</span>',
  },
  {
    type: 'detail',
    html: '  <span class="dim">Fix: Create CHANGELOG.md</span>',
  },
  {
    type: 'detail',
    html: '<span class="warn-icon">!</span> <span class="warn">Warning: Skill name "deploy" is too generic</span> <span class="dim">[skill-overly-generic-name]</span>',
  },
  {
    type: 'detail',
    html: '  <span class="dim">Fix: Use descriptive names like "deploy-app"</span>',
  },
  { type: 'blank', html: '&nbsp;' },
  {
    type: 'summary',
    html: '<span class="err">1 error</span>, <span class="warn">1 warning</span>',
  },
  { type: 'blank', html: '&nbsp;' },
  {
    type: 'pass',
    html: '<span class="check">&#10003;</span> Hooks Validator <span class="dim">(12ms)</span>',
  },
  {
    type: 'pass',
    html: '<span class="check">&#10003;</span> All checks passed!',
  },
  { type: 'blank', html: '&nbsp;' },
  {
    type: 'pass',
    html: '<span class="check">&#10003;</span> MCP Validator <span class="dim">(8ms)</span>',
  },
  {
    type: 'pass',
    html: '<span class="check">&#10003;</span> All checks passed!',
  },
  { type: 'blank', html: '&nbsp;' },
  {
    type: 'section',
    html: 'Overall Summary',
  },
  {
    type: 'summary',
    html: 'Total errors: <span class="err">1</span>',
  },
  {
    type: 'summary',
    html: 'Total warnings: <span class="warn">1</span>',
  },
];

const visibleCount = ref(0);
const done = computed(() => visibleCount.value >= lines.length);
const visibleLines = computed(() => lines.slice(0, visibleCount.value));
const terminalRef = ref<HTMLElement | null>(null);
const bodyRef = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;
let timeouts: ReturnType<typeof setTimeout>[] = [];

// Auto-scroll terminal body as new lines are added to the DOM
watch(visibleCount, () => {
  nextTick(() => {
    if (bodyRef.value) {
      bodyRef.value.scrollTop = bodyRef.value.scrollHeight;
    }
  });
});

function startAnimation() {
  const baseDelay = 80;
  const inputDelay = 400;

  lines.forEach((line, i) => {
    let delay: number;
    if (i === 0) {
      delay = inputDelay;
    } else if (i === 1) {
      delay = inputDelay + 300;
    } else {
      delay = inputDelay + 300 + (i - 1) * baseDelay;
    }

    const t = setTimeout(() => {
      visibleCount.value = i + 1;
    }, delay);
    timeouts.push(t);
  });
}

onMounted(() => {
  if (typeof window === 'undefined') return;

  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting && visibleCount.value === 0) {
        startAnimation();
        observer?.disconnect();
      }
    },
    { threshold: 0.2 }
  );

  if (terminalRef.value) {
    observer.observe(terminalRef.value);
  }
});

onUnmounted(() => {
  observer?.disconnect();
  timeouts.forEach(clearTimeout);
});
</script>

<style scoped>
/* One Dark terminal palette */
.terminal {
  background: #282c34;
  border-radius: 10px;
  overflow: hidden;
  box-shadow:
    0 20px 68px rgba(0, 0, 0, 0.35),
    0 0 0 1px rgba(255, 255, 255, 0.06);
  font-family: 'SF Mono', 'Cascadia Code', 'Fira Code', 'Menlo', monospace;
  width: 720px;
  flex-shrink: 0;
  margin-left: auto;
  margin-right: -60px;
}

.terminal-chrome {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: #21252b;
}

.terminal-dots {
  display: flex;
  gap: 8px;
  width: 60px;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.dot-red {
  background: #e06c75;
}

.dot-yellow {
  background: #e5c07b;
}

.dot-green {
  background: #98c379;
}

.terminal-title {
  flex: 1;
  text-align: center;
  color: #5c6370;
  font-size: 0.8125rem;
  font-weight: 500;
  user-select: none;
}

.terminal-dots-spacer {
  width: 60px;
}

.terminal-body {
  padding: 20px 24px;
  font-size: 0.8125rem;
  line-height: 1.7;
  color: #abb2bf;
  height: 440px;
  overflow-y: auto;
  scrollbar-width: none;
}

.terminal-body::-webkit-scrollbar {
  display: none;
}

/* Lines fade+slide in when first rendered */
.terminal-line {
  white-space: pre;
  animation: lineIn 0.2s ease both;
}

@keyframes lineIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.terminal-line :deep(.prompt) {
  color: #5c6370;
  margin-right: 6px;
}

.terminal-line :deep(.check) {
  color: #98c379;
}

.terminal-line :deep(.cross) {
  color: #e06c75;
}

.terminal-line :deep(.err) {
  color: #e06c75;
}

.terminal-line :deep(.warn) {
  color: #e5c07b;
}

.terminal-line :deep(.warn-icon) {
  color: #e5c07b;
}

/* Overall Summary: bold white (chalk.bold in real CLI) */
.terminal-line.section {
  color: #e5e5e5;
  font-weight: 700;
}

.terminal-line :deep(.dim) {
  color: #5c6370;
}

.terminal-cursor {
  display: inline-block;
  width: 8px;
  height: 15px;
  background: #abb2bf;
  vertical-align: text-bottom;
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}

@media (max-width: 959px) {
  .terminal {
    width: 100%;
    margin-left: 0;
    margin-right: 0;
  }
}
</style>
