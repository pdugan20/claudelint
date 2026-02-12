<template>
  <span class="rule-count">{{ displayValue }}</span>
</template>

<script setup lang="ts">
import stats from '../../../data/rule-stats.json';

const props = defineProps<{
  /** 'total' for overall count, 'categories' for number of categories, or a category key like 'skills' */
  category: string;
}>();

const displayValue = (() => {
  if (props.category === 'total') return stats.total;
  if (props.category === 'categories') return stats.categoryCount;
  const cat = stats.categories[props.category as keyof typeof stats.categories];
  return cat ? cat.count : '?';
})();
</script>
