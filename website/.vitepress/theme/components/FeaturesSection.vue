<template>
  <section class="features-section">
    <div class="features-inner">
      <span class="features-eyebrow">Validators</span>
      <h2 class="features-heading">What it catches</h2>
      <p class="features-subtitle">
        Circular CLAUDE.md imports, dangerous skill commands, misconfigured MCP servers.
        <a href="/rules/overview" class="features-rules-link"
          >{{ totalRules }} rules across {{ categoryCount }} categories</a
        >
        catch them before Claude does.
      </p>

      <!-- Tabs with sliding underline -->
      <div class="features-tabs-wrap" @mouseenter="onHoverEnter" @mouseleave="onHoverLeave">
        <div ref="tabsRef" class="features-tabs">
          <button
            v-for="(tab, i) in tabs"
            :key="tab.label"
            :class="['features-tab', { active: activeIndex === i }]"
            type="button"
            @click="selectTab(i)"
          >
            <span ref="tabTextRefs">{{ tab.label }}</span>
          </button>

          <!-- Sliding underline -->
          <span class="features-underline" :style="underlineStyle" />
        </div>
      </div>

      <!-- Cards -->
      <div class="features-cards">
        <ShowcaseCard
          v-for="(rule, i) in activeRules"
          :key="`${activeIndex}-${rule.id}`"
          :rule-id="rule.id"
          :description="rule.summary"
          :severity="rule.severity"
          :fixable="rule.fixable"
          :link="rule.link"
          class="features-card-animated"
          :style="{
            animationDelay: `${i * 200}ms`,
          }"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import ShowcaseCard from './ShowcaseCard.vue';
import showcaseTabs from '../../../data/showcase-rules.json';
import stats from '../../../data/rule-stats.json';

interface ShowcaseRule {
  id: string;
  summary: string;
  severity: 'error' | 'warn' | 'off';
  fixable: boolean;
  link: string;
}

interface ShowcaseTab {
  label: string;
  totalRules: number;
  rules: ShowcaseRule[];
}

const TIMER_DURATION = 8000;

const tabs = showcaseTabs as ShowcaseTab[];
const totalRules = stats.total;
const categoryCount = stats.categoryCount;

const activeIndex = ref(0);
const isPaused = ref(false);

const tabsRef = ref<HTMLElement | null>(null);
const tabTextRefs = ref<HTMLElement[]>([]);
const underlineLeft = ref(0);
const underlineWidth = ref(0);

let timer: ReturnType<typeof setTimeout> | null = null;
let timerStart = 0;
let remaining = TIMER_DURATION;

const activeRules = computed(() => tabs[activeIndex.value]?.rules || []);

const underlineStyle = computed(() => ({
  left: `${underlineLeft.value}px`,
  width: `${underlineWidth.value}px`,
}));

function measureTab() {
  const container = tabsRef.value;
  const el = tabTextRefs.value[activeIndex.value];
  if (!container || !el) return;
  const containerRect = container.getBoundingClientRect();
  const textRect = el.getBoundingClientRect();
  underlineLeft.value = textRect.left - containerRect.left;
  underlineWidth.value = textRect.width;
}

function startTimer() {
  stopTimer();
  remaining = TIMER_DURATION;
  timerStart = Date.now();
  timer = setTimeout(advance, TIMER_DURATION);
}

function stopTimer() {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
}

function advance() {
  const next = (activeIndex.value + 1) % tabs.length;
  activeIndex.value = next;
  startTimer();
}

function selectTab(index: number) {
  activeIndex.value = index;
  startTimer();
}

function onHoverEnter() {
  isPaused.value = true;
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  const elapsed = Date.now() - timerStart;
  remaining = Math.max(0, TIMER_DURATION - elapsed);
}

function onHoverLeave() {
  isPaused.value = false;
  if (remaining <= 0) {
    advance();
    return;
  }
  timerStart = Date.now();
  timer = setTimeout(advance, remaining);
}

watch(activeIndex, () => {
  nextTick(measureTab);
});

onMounted(() => {
  measureTab();
  startTimer();
});

onUnmounted(() => {
  stopTimer();
});
</script>

<style scoped>
.features-section {
  background: var(--vp-c-bg-alt);
  padding: 96px 24px;
}

.features-inner {
  max-width: 960px;
  margin: 0 auto;
  text-align: center;
}

.features-eyebrow {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--vp-c-text-3);
  margin-bottom: 12px;
}

.features-heading {
  font-family: var(--cl-font-heading);
  font-size: 2.25rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--vp-c-text-1);
  margin: 0 0 12px;
}

.features-subtitle {
  font-size: 1.05rem;
  line-height: 1.6;
  color: var(--vp-c-text-2);
  margin: 0 auto 40px;
  max-width: 640px;
}

.features-rules-link {
  display: inline;
  font-size: inherit;
  font-weight: 500;
  color: var(--vp-c-text-3);
  text-decoration: none;
  transition: color 0.2s;
}

.features-rules-link:hover {
  color: var(--vp-c-text-1);
}

/* --- Tabs --- */

.features-tabs-wrap {
  margin-bottom: 32px;
}

.features-tabs {
  position: relative;
  display: inline-flex;
  justify-content: center;
  gap: 0;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.features-tabs::-webkit-scrollbar {
  display: none;
}

.features-tab {
  padding: 10px 20px;
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--vp-c-text-2);
  background: none;
  border: none;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: color 0.2s;
}

.features-tab:hover {
  color: var(--vp-c-text-1);
}

.features-tab.active {
  color: var(--vp-c-text-1);
  font-weight: 600;
}

/* --- Sliding underline --- */

.features-underline {
  position: absolute;
  bottom: 0;
  height: 2px;
  background: var(--vp-c-text-1);
  border-radius: 1px;
  transition:
    left 0.35s cubic-bezier(0.4, 0, 0.2, 1),
    width 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

/* --- Card grid --- */

.features-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  text-align: left;
  min-height: 160px;
}

/* Stagger animation */
.features-card-animated {
  animation: cardFadeIn 400ms ease both;
}

@keyframes cardFadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* --- Responsive --- */

@media (max-width: 959px) {
  .features-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 639px) {
  .features-section {
    padding: 60px 24px;
  }

  .features-heading {
    font-size: 1.75rem;
  }

  .features-tabs {
    justify-content: flex-start;
  }

  .features-tab {
    padding: 10px 14px;
    font-size: 0.8125rem;
  }

  .features-cards {
    grid-template-columns: 1fr;
  }
}
</style>
