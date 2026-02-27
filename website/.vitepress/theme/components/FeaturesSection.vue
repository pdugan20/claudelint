<template>
  <section class="features-section">
    <div class="features-inner">
      <span class="features-eyebrow">Validators</span>
      <h2 class="features-heading">What it checks</h2>
      <p class="features-subtitle">
        claudelint validates every part of your Claude Code setup &mdash; from project memory to
        plugin manifests.
        <a href="/rules/overview" class="features-rules-link">
          {{ totalRules }} rules across {{ categoryCount }} categories &rarr;
        </a>
      </p>

      <!-- Tabs -->
      <div class="features-tabs-wrap" @mouseenter="onHoverEnter" @mouseleave="onHoverLeave">
        <div class="features-tabs">
          <button
            v-for="(tab, i) in tabs"
            :key="tab.label"
            :class="['features-tab', { active: activeIndex === i }]"
            type="button"
            @click="selectTab(i)"
          >
            {{ tab.label }}
          </button>
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

      <!-- Apple TV-style dots (below cards) -->
      <div class="features-dots">
        <span
          v-for="(_tab, i) in tabs"
          :key="`dot-${i}`"
          :class="['features-dot', { active: activeIndex === i }]"
        >
          <span
            v-if="activeIndex === i"
            :key="`fill-${animKey}`"
            :class="['features-dot-fill', { paused: isPaused }]"
            :style="{ animationDuration: `${timerDuration}ms` }"
            @animationend="advance"
          />
        </span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
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
const animKey = ref(0);
const timerDuration = ref(TIMER_DURATION);

const activeRules = computed(() => tabs[activeIndex.value]?.rules || []);

function advance() {
  const next = (activeIndex.value + 1) % tabs.length;
  activeIndex.value = next;
  timerDuration.value = TIMER_DURATION;
  animKey.value++;
}

function selectTab(index: number) {
  activeIndex.value = index;
  timerDuration.value = TIMER_DURATION;
  animKey.value++;
}

function onHoverEnter() {
  isPaused.value = true;
}

function onHoverLeave() {
  isPaused.value = false;
}

onMounted(() => {
  animKey.value++;
});
</script>

<style scoped>
.features-section {
  background: var(--vp-c-bg-alt);
  padding: 80px 24px;
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
  max-width: 540px;
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
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.features-tabs::-webkit-scrollbar {
  display: none;
}

.features-tab {
  padding: 6px 16px;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-elv);
  border: 1px solid var(--vp-c-divider);
  border-radius: 20px;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition:
    color 0.2s,
    background 0.2s,
    border-color 0.2s;
}

.features-tab:hover {
  color: var(--vp-c-text-1);
  border-color: var(--vp-c-border);
}

.features-tab.active {
  color: var(--vp-c-text-1);
  font-weight: 600;
  background: var(--vp-c-bg-soft);
  border-color: var(--vp-c-border);
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

/* --- Dot progress indicator (Apple TV style) --- */

.features-dots {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 24px;
}

.features-dot {
  width: 6px;
  height: 6px;
  border-radius: 3px;
  background: var(--vp-c-divider);
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  position: relative;
  flex-shrink: 0;
}

.features-dot.active {
  width: 32px;
}

.features-dot-fill {
  position: absolute;
  inset: 0;
  width: 0%;
  background: var(--vp-c-text-2);
  border-radius: 3px;
  animation: dotFill linear forwards;
}

.features-dot-fill.paused {
  animation-play-state: paused;
}

@keyframes dotFill {
  from {
    width: 0%;
  }
  to {
    width: 100%;
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
    flex-wrap: nowrap;
    padding: 0 4px;
  }

  .features-tab {
    padding: 5px 12px;
    font-size: 0.8125rem;
  }

  .features-cards {
    grid-template-columns: 1fr;
  }
}
</style>
