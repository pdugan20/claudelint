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
      <!-- Command line with typing animation -->
      <div v-if="animationStarted" class="terminal-line input">
        <!-- eslint-disable-next-line vue/no-v-html -->
        <span class="prompt">$</span> {{ typedText
        }}<span v-if="showTypingCursor" class="terminal-cursor terminal-cursor-inline" />
      </div>

      <!-- Output lines -->
      <div v-for="(line, i) in visibleOutputLines" :key="i" :class="['terminal-line', line.type]">
        <!-- eslint-disable-next-line vue/no-v-html -->
        <span v-html="line.html" />
      </div>

      <!-- Final blinking cursor after all output -->
      <span v-if="outputDone" class="terminal-cursor" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';

interface Line {
  type: string;
  html: string;
}

const command = 'claudelint check-all --verbose';

const outputLines: Line[] = [
  // ── File discovery ──
  {
    type: 'section',
    html: 'claude-md <span class="dim">(3 files)</span>',
  },
  {
    type: 'detail',
    html: '  CLAUDE.md',
  },
  {
    type: 'detail',
    html: '  src/CLAUDE.md',
  },
  {
    type: 'detail',
    html: '  website/CLAUDE.md',
  },
  { type: 'blank', html: '&nbsp;' },
  {
    type: 'section',
    html: 'skills <span class="dim">(4 files)</span>',
  },
  {
    type: 'detail',
    html: '  .claude/skills/deploy/SKILL.md',
  },
  {
    type: 'detail',
    html: '  .claude/skills/test-runner/SKILL.md',
  },
  {
    type: 'detail',
    html: '  <span class="dim">... and 2 more in tests/</span>',
  },
  { type: 'blank', html: '&nbsp;' },
  // ── Skipped validators ──
  {
    type: 'detail',
    html: 'Skipped <span class="dim">(4)</span>:',
  },
  {
    type: 'detail',
    html: '  settings  <span class="dim">no settings.json</span>',
  },
  {
    type: 'detail',
    html: '  hooks     <span class="dim">no hooks.json</span>',
  },
  {
    type: 'detail',
    html: '  mcp       <span class="dim">no .mcp.json</span>',
  },
  {
    type: 'detail',
    html: '  plugin    <span class="dim">no plugin.json</span>',
  },
  { type: 'blank', html: '&nbsp;' },
  // ── Problems ──
  {
    type: 'section',
    html: 'Problems:',
  },
  { type: 'blank', html: '&nbsp;' },
  {
    type: 'section',
    html: 'claude-md <span class="dim">(32ms)</span>',
  },
  { type: 'blank', html: '&nbsp;' },
  {
    type: 'detail',
    html: '<span class="underline">CLAUDE.md</span> <span class="dim">(1 warning)</span>',
  },
  {
    type: 'detail',
    html: '  14  <span class="warn">warning</span>  npm script "format" not in package.json  <span class="dim">claude-md-npm-script-not-found</span>',
  },
  { type: 'blank', html: '&nbsp;' },
  {
    type: 'section',
    html: 'skills <span class="dim">(58ms)</span>',
  },
  { type: 'blank', html: '&nbsp;' },
  {
    type: 'detail',
    html: '<span class="underline">.claude/skills/deploy/SKILL.md</span> <span class="dim">(1 error, 2 warnings)</span>',
  },
  {
    type: 'detail',
    html: '  0  <span class="err">error</span>    Name "deploy" is overly generic  <span class="dim">skill-overly-generic-name</span>',
  },
  {
    type: 'detail',
    html: '  3  <span class="warn">warning</span>  Description has only 3 words, minimum is 6  <span class="dim">skill-description-quality</span>',
  },
  {
    type: 'detail',
    html: '  3  <span class="warn">warning</span>  Description missing trigger phrases  <span class="dim">skill-description-missing-trigger</span>',
  },
  { type: 'blank', html: '&nbsp;' },
  {
    type: 'detail',
    html: '<span class="underline">.claude/skills/test-runner/SKILL.md</span> <span class="dim">(1 warning)</span>',
  },
  {
    type: 'detail',
    html: '  0  <span class="warn">warning</span>  Missing "## Usage" section  <span class="dim">skill-body-missing-usage-section</span>',
  },
  { type: 'blank', html: '&nbsp;' },
  // ── Summary + timing ──
  {
    type: 'summary',
    html: 'Checked 7 files across 2 categories <span class="dim">(claude-md, skills)</span> in 72ms.',
  },
  {
    type: 'summary',
    html: '<span class="err">5 problems</span> (1 error, 4 warnings)',
  },
  { type: 'blank', html: '&nbsp;' },
  {
    type: 'detail',
    html: 'Timing:',
  },
  {
    type: 'detail',
    html: '  claude-md  32ms',
  },
  {
    type: 'detail',
    html: '  skills     58ms',
  },
];

const animationStarted = ref(false);
const typedChars = ref(0);
const visibleCount = ref(0);
const terminalRef = ref<HTMLElement | null>(null);
const bodyRef = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;
let timeouts: ReturnType<typeof setTimeout>[] = [];

const typedText = computed(() => command.slice(0, typedChars.value));
const typingDone = computed(() => typedChars.value >= command.length);
const outputDone = computed(() => visibleCount.value >= outputLines.length);
const showTypingCursor = computed(() => animationStarted.value && !typingDone.value);
const visibleOutputLines = computed(() => outputLines.slice(0, visibleCount.value));

// Auto-scroll terminal body as new content appears
watch([typedChars, visibleCount], () => {
  nextTick(() => {
    if (bodyRef.value) {
      bodyRef.value.scrollTop = bodyRef.value.scrollHeight;
    }
  });
});

function startAnimation() {
  const typingSpeed = 60;
  const initialPause = 200;
  const enterPause = 300;
  const outputSpeed = 60;

  // Phase 0: Show prompt with cursor
  animationStarted.value = true;

  // Phase 1: Type command character by character
  for (let i = 0; i < command.length; i++) {
    const t = setTimeout(
      () => {
        typedChars.value = i + 1;
      },
      initialPause + i * typingSpeed
    );
    timeouts.push(t);
  }

  const typingEnd = initialPause + command.length * typingSpeed;

  // Phase 2: Output lines appear after enter pause
  const outputStart = typingEnd + enterPause;
  outputLines.forEach((_line, i) => {
    const t = setTimeout(
      () => {
        visibleCount.value = i + 1;
      },
      outputStart + i * outputSpeed
    );
    timeouts.push(t);
  });
}

onMounted(() => {
  if (typeof window === 'undefined') return;

  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting && !animationStarted.value) {
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
/* Terminal palette (switches via CSS vars in style.css) */
.terminal {
  background: var(--cl-terminal-bg);
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
  background: var(--cl-terminal-chrome);
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

/* Input line should not animate in */
.terminal-line.input {
  animation: none;
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

.terminal-line :deep(.underline) {
  text-decoration: underline;
  color: #e5e5e5;
}

.terminal-cursor {
  display: inline-block;
  width: 8px;
  height: 15px;
  background: #abb2bf;
  vertical-align: text-bottom;
  animation: blink 1s step-end infinite;
}

.terminal-cursor-inline {
  margin-left: 1px;
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
    display: none;
  }
}
</style>
