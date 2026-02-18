<script setup lang="ts">
import DefaultTheme from 'vitepress/theme';
import { useData } from 'vitepress';
import { onMounted, watch, nextTick } from 'vue';
import TerminalDemo from './components/TerminalDemo.vue';
import HomeFooter from './components/HomeFooter.vue';

const { Layout } = DefaultTheme;
const { frontmatter } = useData();

function ensureMainLandmark() {
  if (typeof document === 'undefined') return;
  const el = document.querySelector('.VPHome');
  if (el && !document.querySelector('main')) {
    el.setAttribute('role', 'main');
  }
}

onMounted(() => {
  ensureMainLandmark();
  watch(
    () => frontmatter.value.layout,
    () => nextTick(ensureMainLandmark)
  );
});
</script>

<template>
  <Layout>
    <template v-if="frontmatter.layout === 'home'" #home-hero-image>
      <TerminalDemo />
    </template>
    <template v-if="frontmatter.layout === 'home'" #layout-bottom>
      <HomeFooter />
    </template>
  </Layout>
</template>
