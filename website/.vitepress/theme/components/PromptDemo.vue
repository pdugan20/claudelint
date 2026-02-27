<template>
  <section ref="sectionRef" class="prompt-demo-section">
    <div class="prompt-demo-header">
      <span class="prompt-demo-eyebrow">Claude Code Plugin</span>
      <h2 class="prompt-demo-title">Works where you already code</h2>
      <p class="prompt-demo-subtitle">
        Type what you need in plain English. claudelint skills handle the rest.
      </p>
    </div>

    <div class="prompt-demo-terminal">
      <!-- Claude Code header -->
      <div class="cc-header">
        <div class="cc-header-row">
          <pre class="cc-crab" aria-hidden="true">
 &#x2590;&#x259B;&#x2588;&#x2588;&#x2588;&#x259C;&#x258C;
&#x259D;&#x259C;&#x2588;&#x2588;&#x2588;&#x2588;&#x2588;&#x259B;&#x2598;
  &#x2598;&#x2598; &#x259D;&#x259D;</pre
          >
          <div class="cc-header-text">
            <span class="cc-version"><strong>Claude Code</strong> v2.1.34</span>
            <span class="cc-model">Opus 4.6 &middot; Claude API</span>
            <span class="cc-path">~/my-project</span>
          </div>
        </div>
      </div>

      <!-- Prompt line -->
      <div class="cc-prompt-line">
        <span class="cc-prompt-chevron">&#x276F;</span>
        <span class="cc-prompt-text">{{ displayText }}</span>
        <span v-if="showCursor" class="cc-cursor" />
      </div>

      <!-- Response area -->
      <div class="cc-response">
        <!-- Thinking spinner (cycling star characters) -->
        <div v-if="showThinking" class="cc-thinking">
          <span class="cc-spinner">{{ spinnerChar }}</span>
          <span class="cc-thinking-text">{{ thinkingVerb }}</span>
        </div>
        <!-- Response lines revealed one by one -->
        <div
          v-for="(line, i) in visibleResponseLines"
          :key="`${currentIndex}-${i}`"
          :class="['cc-response-line', line.type, 'cc-line-enter']"
        >
          <!-- eslint-disable-next-line vue/no-v-html -->
          <span v-html="line.html" />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

interface ResponseLine {
  type: 'tool' | 'detail' | 'output' | 'summary';
  html: string;
}

interface Scenario {
  prompt: string;
  response: ResponseLine[];
}

const scenarios: Scenario[] = [
  {
    prompt: 'can you check my projects claude.md',
    response: [
      {
        type: 'tool',
        html: '<span class="tool-dot"></span><strong>Skill</strong>(claudelint:validate-cc-md)',
      },
      {
        type: 'detail',
        html: '<span class="tree-branch"></span>Successfully loaded skill <span class="dim">&middot;</span> 1 tool allowed',
      },
      {
        type: 'tool',
        html: '<span class="tool-dot"></span><strong>Bash</strong>(npx claudelint validate-claude-md --verbose --explain 2>&amp;1)',
      },
      {
        type: 'output',
        html: 'Validating CLAUDE.md...\n<span class="pass">All checks passed!</span>',
      },
      {
        type: 'summary',
        html: '<span class="tool-dot"></span>Your project\u2019s CLAUDE.md looks good &mdash; all checks passed with no errors or warnings.',
      },
    ],
  },
  {
    prompt: "why isn't my skill loading?",
    response: [
      {
        type: 'tool',
        html: '<span class="tool-dot"></span><strong>Skill</strong>(claudelint:validate-skills)',
      },
      {
        type: 'detail',
        html: '<span class="tree-branch"></span>Successfully loaded skill <span class="dim">&middot;</span> 1 tool allowed',
      },
      {
        type: 'tool',
        html: '<span class="tool-dot"></span><strong>Bash</strong>(npx claudelint validate-skills --verbose --explain 2>&amp;1)',
      },
      {
        type: 'output',
        html: '1 error in deploy/SKILL.md\n<span class="err">skill-overly-generic-name</span>: Name &quot;deploy&quot; is overly generic',
      },
      {
        type: 'summary',
        html: '<span class="tool-dot"></span>The skill name &quot;deploy&quot; is too generic and won\u2019t trigger reliably. I can rename it to &quot;deploy-staging&quot; &mdash; want me to fix it?',
      },
    ],
  },
  {
    prompt: 'my CLAUDE.md is too long',
    response: [
      {
        type: 'tool',
        html: '<span class="tool-dot"></span><strong>Skill</strong>(claudelint:optimize-cc-md)',
      },
      {
        type: 'detail',
        html: '<span class="tree-branch"></span>Successfully loaded skill <span class="dim">&middot;</span> 1 tool allowed',
      },
      {
        type: 'tool',
        html: '<span class="tool-dot"></span><strong>Bash</strong>(npx claudelint validate-claude-md --verbose --explain 2>&amp;1)',
      },
      {
        type: 'output',
        html: 'CLAUDE.md is 42KB <span class="warn">(warning at 30KB)</span>\n3 sections could be extracted to @imports',
      },
      {
        type: 'summary',
        html: '<span class="tool-dot"></span>Your CLAUDE.md is 12KB over the limit. I can extract 3 sections into @import files to bring it under &mdash; want me to do that?',
      },
    ],
  },
];

/* Spinner: exact Claude Code star sequence (blooms out then back) */
const SPINNER_FRAMES = ['·', '✢', '✳', '✶', '✻', '✽', '✻', '✶', '✳', '✢'];
const SPINNER_INTERVAL = 200;

const SCRAMBLE_CHARS = 'abcdefghijklmnopqrstuvwxyz ';
const TYPE_SPEED = 55;
const HOLD_DURATION = 3500;
const MORPH_DURATION = 800;
const MORPH_INTERVAL = 30;
const LINE_REVEAL_DELAY = 250;
const THINKING_DURATION = 1200;
const THINKING_VERBS = ['Thinking...', 'Reasoning...', 'Analyzing...'];

const sectionRef = ref<HTMLElement | null>(null);
const currentIndex = ref(0);
const displayText = ref('');
const showCursor = ref(true);
const showThinking = ref(false);
const thinkingVerb = ref('Thinking...');
const spinnerChar = ref(SPINNER_FRAMES[0]);
const visibleLineCount = ref(0);
const animationStarted = ref(false);

let observer: IntersectionObserver | null = null;
let timeouts: ReturnType<typeof setTimeout>[] = [];
let morphInterval: ReturnType<typeof setInterval> | null = null;
let spinnerInterval: ReturnType<typeof setInterval> | null = null;

const currentResponse = computed(() => scenarios[currentIndex.value].response);
const visibleResponseLines = computed(() => currentResponse.value.slice(0, visibleLineCount.value));

function scheduleTimeout(fn: () => void, ms: number) {
  const t = setTimeout(fn, ms);
  timeouts.push(t);
  return t;
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => scheduleTimeout(r, ms));
}

function startSpinner() {
  let frame = 0;
  spinnerChar.value = SPINNER_FRAMES[0];
  spinnerInterval = setInterval(() => {
    frame = (frame + 1) % SPINNER_FRAMES.length;
    spinnerChar.value = SPINNER_FRAMES[frame];
  }, SPINNER_INTERVAL);
}

function stopSpinner() {
  if (spinnerInterval) {
    clearInterval(spinnerInterval);
    spinnerInterval = null;
  }
}

function pickThinkingVerb() {
  thinkingVerb.value = THINKING_VERBS[Math.floor(Math.random() * THINKING_VERBS.length)];
}

function typePrompt(text: string): Promise<void> {
  return new Promise((resolve) => {
    let i = 0;
    function typeNext() {
      if (i < text.length) {
        displayText.value = text.slice(0, i + 1);
        i++;
        scheduleTimeout(typeNext, TYPE_SPEED);
      } else {
        resolve();
      }
    }
    typeNext();
  });
}

function revealResponseLines(): Promise<void> {
  const total = currentResponse.value.length;
  return new Promise((resolve) => {
    let i = 0;
    function showNext() {
      if (i < total) {
        visibleLineCount.value = i + 1;
        i++;
        scheduleTimeout(showNext, LINE_REVEAL_DELAY);
      } else {
        resolve();
      }
    }
    showNext();
  });
}

function morphPrompt(from: string, to: string): Promise<void> {
  return new Promise((resolve) => {
    const maxLen = Math.max(from.length, to.length);
    const padFrom = from.padEnd(maxLen);
    const padTo = to.padEnd(maxLen);

    const resolved = new Array(maxLen).fill(false);
    const totalSteps = Math.ceil(MORPH_DURATION / MORPH_INTERVAL);
    let step = 0;

    for (let i = 0; i < maxLen; i++) {
      if (padFrom[i] === padTo[i]) resolved[i] = true;
    }

    morphInterval = setInterval(() => {
      step++;
      const resolveUpTo = Math.floor((step / totalSteps) * maxLen);

      const chars: string[] = [];
      for (let i = 0; i < maxLen; i++) {
        if (i < resolveUpTo || resolved[i]) {
          resolved[i] = true;
          chars.push(padTo[i]);
        } else {
          chars.push(SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]);
        }
      }

      displayText.value = chars.join('').trimEnd();

      if (step >= totalSteps) {
        if (morphInterval) clearInterval(morphInterval);
        morphInterval = null;
        displayText.value = to;
        resolve();
      }
    }, MORPH_INTERVAL);
  });
}

async function runCycle() {
  // Phase 1: Type first prompt
  await typePrompt(scenarios[0].prompt);
  showCursor.value = false;

  // Phase 2: Show thinking spinner
  pickThinkingVerb();
  showThinking.value = true;
  startSpinner();
  await delay(THINKING_DURATION);
  stopSpinner();
  showThinking.value = false;

  // Phase 3: Reveal response lines one by one
  await revealResponseLines();

  // Hold so user can read
  await delay(HOLD_DURATION);

  // Phase 4: Loop through scenarios
  let idx = 0;
  while (animationStarted.value) {
    const nextIdx = (idx + 1) % scenarios.length;

    // Hide response lines
    visibleLineCount.value = 0;

    // Switch scenario and morph prompt text
    currentIndex.value = nextIdx;
    await morphPrompt(scenarios[idx].prompt, scenarios[nextIdx].prompt);

    // Show thinking spinner
    pickThinkingVerb();
    showThinking.value = true;
    startSpinner();
    await delay(THINKING_DURATION);
    stopSpinner();
    showThinking.value = false;

    // Reveal new response lines
    await revealResponseLines();

    // Hold
    await delay(HOLD_DURATION);

    idx = nextIdx;
  }
}

onMounted(() => {
  if (typeof window === 'undefined') return;

  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting && !animationStarted.value) {
        animationStarted.value = true;
        observer?.disconnect();
        runCycle();
      }
    },
    { threshold: 0.3 }
  );

  if (sectionRef.value) {
    observer.observe(sectionRef.value);
  }
});

onUnmounted(() => {
  animationStarted.value = false;
  observer?.disconnect();
  timeouts.forEach(clearTimeout);
  if (morphInterval) clearInterval(morphInterval);
  stopSpinner();
});
</script>

<style scoped>
.prompt-demo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #1e1b18;
  padding: 80px 24px;
}

.prompt-demo-header {
  text-align: center;
  margin-bottom: 40px;
  max-width: 520px;
}

.prompt-demo-eyebrow {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #6e6c64;
  margin-bottom: 12px;
}

.prompt-demo-title {
  font-family: var(--cl-font-heading);
  font-size: 2.25rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: #e5e5e5;
  margin: 0 0 12px;
}

.prompt-demo-subtitle {
  font-size: 1.05rem;
  line-height: 1.6;
  color: #a8a69d;
  margin: 0;
}

/* Terminal container */
.prompt-demo-terminal {
  background: #1e1b18;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.06);
  font-family: 'SF Mono', 'Cascadia Code', 'Fira Code', 'Menlo', monospace;
  width: 100%;
  max-width: 760px;
}

/* Claude Code header */
.cc-header {
  padding: 24px 28px 16px;
}

.cc-header-row {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.cc-crab {
  color: #d97757;
  flex-shrink: 0;
  margin: 0;
  padding: 0;
  font-family: 'SF Mono', 'Cascadia Code', 'Fira Code', 'Menlo', monospace;
  font-size: 0.9375rem;
  line-height: 1;
  letter-spacing: 0;
  user-select: none;
}

.cc-header-text {
  display: flex;
  flex-direction: column;
  gap: 1px;
  font-size: 0.875rem;
  line-height: 1.6;
}

.cc-version {
  color: #e5e5e5;
}

.cc-version strong {
  font-weight: 700;
}

.cc-model {
  color: #6e6c64;
}

.cc-path {
  color: #6e6c64;
}

/* Prompt line */
.cc-prompt-line {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  line-height: 1.6;
  color: #e5e5e5;
  padding: 10px 28px;
}

.cc-prompt-chevron {
  color: #6e6c64;
  margin-right: 8px;
}

.cc-prompt-text {
  white-space: pre;
}

.cc-cursor {
  display: inline-block;
  width: 8px;
  height: 16px;
  background: #abb2bf;
  vertical-align: text-bottom;
  margin-left: 1px;
  animation: cursorBlink 1s step-end infinite;
}

@keyframes cursorBlink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}

/* Response area */
.cc-response {
  padding: 4px 28px 28px;
  min-height: 180px;
}

/* Thinking spinner */
.cc-thinking {
  font-size: 0.8125rem;
  line-height: 1.7;
}

.cc-spinner {
  color: #d97757;
  display: inline-block;
  width: 1.1em;
  text-align: center;
  margin-right: 4px;
}

.cc-thinking-text {
  color: #6e6c64;
}

/* Individual line enter animation */
.cc-line-enter {
  animation: lineReveal 0.25s ease both;
}

@keyframes lineReveal {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Response lines — base */
.cc-response-line {
  font-size: 0.8125rem;
  line-height: 1.7;
  color: #abb2bf;
  white-space: pre-wrap;
  overflow-wrap: break-word;
}

/* Tool line: green dot + bold tool name — hanging indent so wraps clear the dot */
.cc-response-line.tool {
  color: #e5e5e5;
  margin-top: 6px;
  padding-left: 16px;
  text-indent: -16px;
}

.cc-response-line.tool:first-child {
  margin-top: 0;
}

/* Detail line: indented with └ tree branch */
.cc-response-line.detail {
  color: #6e6c64;
  padding-left: 20px;
}

/* Output line: indented, same level as detail */
.cc-response-line.output {
  color: #abb2bf;
  padding-left: 20px;
  margin-top: 2px;
}

/* Summary line: green dot + text — same hanging indent as tool */
.cc-response-line.summary {
  color: #e5e5e5;
  margin-top: 6px;
  padding-left: 16px;
  text-indent: -16px;
}

/* Green dot for completed tool calls */
.cc-response-line :deep(.tool-dot) {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #98c379;
  vertical-align: middle;
  margin-right: 8px;
}

/* Tree branch — inline text, no fixed width */
.cc-response-line :deep(.tree-branch) {
  color: #4b4b45;
}

.cc-response-line :deep(.tree-branch)::before {
  content: '\2514\00a0';
}

.cc-response-line :deep(.dim) {
  color: #6e6c64;
}

.cc-response-line :deep(.err) {
  color: #e06c75;
}

.cc-response-line :deep(.warn) {
  color: #e5c07b;
}

.cc-response-line :deep(.pass) {
  color: #98c379;
}

@media (max-width: 639px) {
  .prompt-demo-section {
    display: none;
  }
}

@media (max-width: 959px) {
  .prompt-demo-terminal {
    max-width: 100%;
  }
}
</style>
