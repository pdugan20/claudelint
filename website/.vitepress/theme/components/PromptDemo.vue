<template>
  <section ref="sectionRef" class="prompt-demo-section">
    <div class="prompt-demo-header">
      <span class="prompt-demo-eyebrow">Claude Code Plugin</span>
      <h2 class="prompt-demo-title">More than a linter</h2>
      <p class="prompt-demo-subtitle">
        Install the
        <a href="/integrations/claude-code-plugin" class="prompt-demo-link">claudelint plugin</a>
        and Claude can restructure bloated CLAUDE.md files, diagnose broken skills, and walk you
        through every fix.
      </p>
    </div>

    <div class="prompt-demo-terminal">
      <!-- Claude Code header -->
      <div class="cc-header">
        <div class="cc-header-row">
          <!-- Clawd mascot — 18×5 pixel grid from Unicode block art -->
          <svg
            class="cc-crab"
            viewBox="0 0 18 5"
            preserveAspectRatio="none"
            shape-rendering="crispEdges"
            role="img"
            aria-label="Clawd mascot"
          >
            <rect x="3" y="0" width="12" height="1" fill="currentColor" />
            <rect x="3" y="1" width="2" height="1" fill="currentColor" />
            <rect x="6" y="1" width="6" height="1" fill="currentColor" />
            <rect x="13" y="1" width="2" height="1" fill="currentColor" />
            <rect x="1" y="2" width="16" height="1" fill="currentColor" />
            <rect x="3" y="3" width="12" height="1" fill="currentColor" />
            <rect x="4" y="4" width="1" height="1" fill="currentColor" />
            <rect x="6" y="4" width="1" height="1" fill="currentColor" />
            <rect x="11" y="4" width="1" height="1" fill="currentColor" />
            <rect x="13" y="4" width="1" height="1" fill="currentColor" />
          </svg>
          <div class="cc-header-text">
            <span class="cc-version"
              ><strong>Claude Code</strong>{{ ccVersion ? ` ${ccVersion}` : '' }}</span
            >
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

    <!-- Install CTA (hidden for now, re-enable when install paths are finalized) -->
    <div v-if="false" class="prompt-demo-cta">
      <h3 class="prompt-demo-cta-heading">Try it now</h3>
      <div class="prompt-demo-cta-tabs">
        <button
          :class="['prompt-demo-cta-tab', { active: installTab === 'claude' }]"
          type="button"
          @click="installTab = 'claude'"
        >
          Set up with Claude
        </button>
        <button
          :class="['prompt-demo-cta-tab', { active: installTab === 'manual' }]"
          type="button"
          @click="installTab = 'manual'"
        >
          Manual install
        </button>
      </div>
      <div
        :class="[
          'prompt-demo-cta-command',
          { 'prompt-demo-cta-command--prompt': installTab === 'claude' },
        ]"
        @click="copyInstall"
      >
        <code class="prompt-demo-cta-code">{{ installCommand }}</code>
        <button class="prompt-demo-cta-copy" :class="{ copied: installCopied }" type="button">
          {{ installCopied ? 'Copied!' : 'Copy' }}
        </button>
      </div>
      <a href="/guide/getting-started" class="prompt-demo-cta-link">Read the docs &rarr;</a>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

const ccVersion = ref('');

async function fetchCCVersion() {
  try {
    const res = await fetch('https://api.github.com/repos/anthropics/claude-code/releases/latest');
    if (!res.ok) return;
    const data = await res.json();
    if (data.tag_name) {
      ccVersion.value = data.tag_name;
    }
  } catch {
    // silently fall back to no version shown
  }
}

const installTab = ref<'claude' | 'manual'>('claude');
const installCopied = ref(false);

const installCommand = computed(() =>
  installTab.value === 'claude'
    ? 'Set up claudelint for this project. Follow the setup guide at https://claudelint.com/setup-guide.md'
    : 'npm install --save-dev claude-code-lint'
);

function copyInstall() {
  navigator.clipboard.writeText(installCommand.value);
  installCopied.value = true;
  setTimeout(() => {
    installCopied.value = false;
  }, 2000);
}

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

  fetchCCVersion();

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
  padding: 96px 24px 48px;
}

.prompt-demo-header {
  text-align: center;
  margin-bottom: 48px;
  max-width: 640px;
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
  max-width: 640px;
}

.prompt-demo-link {
  color: #a8a69d;
  text-decoration: underline;
  text-underline-offset: 2px;
  transition: color 0.2s;
}

.prompt-demo-link:hover {
  color: #e5e5e5;
}

/* Terminal container */
.prompt-demo-terminal {
  background: #1e1b18;
  overflow: hidden;
  font-family: 'SF Mono', 'Cascadia Code', 'Fira Code', 'Menlo', monospace;
  width: 100%;
  max-width: 760px;
  min-height: 420px;
}

/* Claude Code header */
.cc-header {
  padding: 24px 28px 16px;
}

.cc-header-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.cc-crab {
  color: #da7756;
  width: 81px;
  height: 45px;
  flex-shrink: 0;
}

.cc-header-text {
  display: flex;
  flex-direction: column;
  gap: 0;
  font-size: 0.875rem;
  line-height: 1.4;
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

/* --- Install CTA --- */

.prompt-demo-cta {
  margin-top: 48px;
  text-align: center;
  max-width: 480px;
  width: 100%;
}

.prompt-demo-cta-heading {
  font-family: var(--cl-font-heading);
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: #e5e5e5;
  margin: 0 0 20px;
}

.prompt-demo-cta-tabs {
  display: inline-flex;
  gap: 4px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 6px;
  padding: 3px;
  margin-bottom: 20px;
}

.prompt-demo-cta-tab {
  padding: 5px 14px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #a8a69d;
  background: none;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition:
    color 0.2s,
    background 0.2s;
}

.prompt-demo-cta-tab:hover {
  color: #e5e5e5;
}

.prompt-demo-cta-tab.active {
  color: #e5e5e5;
  background: rgba(255, 255, 255, 0.1);
}

.prompt-demo-cta-command {
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

.prompt-demo-cta-command:hover {
  border-color: rgba(255, 255, 255, 0.2);
}

.prompt-demo-cta-command--prompt {
  flex-direction: column;
  align-items: stretch;
  gap: 10px;
}

.prompt-demo-cta-command--prompt .prompt-demo-cta-code {
  white-space: normal;
  text-align: left;
  font-family: inherit;
  font-size: 0.875rem;
  line-height: 1.5;
}

.prompt-demo-cta-command--prompt .prompt-demo-cta-copy {
  align-self: flex-end;
}

.prompt-demo-cta-code {
  font-family: 'SF Mono', 'Cascadia Code', 'Fira Code', 'Menlo', monospace;
  font-size: 0.9375rem;
  color: #e5e5e5;
  background: none;
  padding: 0;
  white-space: nowrap;
}

.prompt-demo-cta-copy {
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

.prompt-demo-cta-copy:hover {
  color: #e5e5e5;
  background: rgba(255, 255, 255, 0.12);
}

.prompt-demo-cta-copy.copied {
  color: #98c379;
  border-color: rgba(152, 195, 121, 0.3);
}

.prompt-demo-cta-link {
  display: inline-block;
  margin-top: 24px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #a8a69d;
  text-decoration: none;
  transition: color 0.2s;
}

.prompt-demo-cta-link:hover {
  color: #e5e5e5;
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
