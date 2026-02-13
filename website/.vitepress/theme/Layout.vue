<script setup lang="ts">
import DefaultTheme from 'vitepress/theme';
import { useData } from 'vitepress';
import TerminalDemo from './components/TerminalDemo.vue';
import HomeFooter from './components/HomeFooter.vue';

const { Layout } = DefaultTheme;
const { frontmatter } = useData();
</script>

<template>
  <Layout>
    <template v-if="frontmatter.layout === 'home'" #home-hero-image>
      <TerminalDemo />
    </template>
    <template #layout-bottom>
      <HomeFooter />
    </template>
  </Layout>
</template>
