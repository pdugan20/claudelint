import DefaultTheme from 'vitepress/theme';
import RuleBadge from './components/RuleBadge.vue';

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('RuleBadge', RuleBadge);
  },
};
