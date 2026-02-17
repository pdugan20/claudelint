<template>
  <div :class="['faq-list', `faq-list--${variant}`]">
    <div
      v-for="(item, i) in items"
      :key="i"
      :class="['faq-item', { 'faq-item--open': openIndex === i }]"
    >
      <button class="faq-question" @click="toggle(i)">
        <svg class="faq-chevron" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M6 4L10 8L6 12"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <span>{{ item.q }}</span>
      </button>
      <div v-show="openIndex === i" class="faq-answer">
        <slot :name="`answer-${i}`">
          <p>{{ item.a }}</p>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface FaqItem {
  q: string;
  a?: string;
}

defineProps<{
  items: FaqItem[];
  variant?: 'divider' | 'card' | 'flat';
}>();

const openIndex = ref<number | null>(null);

function toggle(i: number) {
  openIndex.value = openIndex.value === i ? null : i;
}
</script>

<style scoped>
/* ===== Base (shared) ===== */
.faq-list {
  margin: 16px 0;
}

.faq-item {
  overflow: hidden;
}

.faq-question {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  text-align: left;
  cursor: pointer;
  border: none;
  background: none;
  font-family: var(--vp-font-family-base);
  font-size: 0.925rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  line-height: 1.5;
}

.faq-question:hover {
  color: var(--vp-c-text-2);
}

.faq-chevron {
  flex-shrink: 0;
  color: var(--vp-c-text-3);
  transition: transform 0.2s ease;
}

.faq-item--open .faq-chevron {
  transform: rotate(90deg);
}

.faq-answer {
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
  line-height: 1.65;
}

.faq-answer :deep(p) {
  margin: 0;
}

.faq-answer :deep(p + p) {
  margin-top: 8px;
}

.faq-answer :deep(div[class*='language-']) {
  margin: 8px 0;
}

/* ===== Variant: divider ===== */
.faq-list--divider .faq-item {
  border-bottom: 1px solid var(--vp-c-divider);
}

.faq-list--divider .faq-item:last-child {
  border-bottom: none;
}

.faq-list--divider .faq-question {
  padding: 12px 0;
}

.faq-list--divider .faq-answer {
  padding: 0 0 14px 24px;
}

/* ===== Variant: card ===== */
.faq-list--card {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
}

.faq-list--card .faq-item {
  border-bottom: 1px solid var(--vp-c-divider);
}

.faq-list--card .faq-item:last-child {
  border-bottom: none;
}

.faq-list--card .faq-question {
  padding: 12px 16px;
}

.faq-list--card .faq-item--open .faq-question {
  background: var(--vp-c-bg-soft);
}

.faq-list--card .faq-answer {
  padding: 10px 16px 14px 40px;
}

/* ===== Variant: flat ===== */
.faq-list--flat .faq-question {
  padding: 10px 0;
}

.faq-list--flat .faq-answer {
  padding: 0 0 12px 24px;
}

.faq-list--flat .faq-item--open .faq-answer {
  border-left: 2px solid var(--vp-c-divider);
  margin-left: 7px;
  padding-left: 17px;
}
</style>
