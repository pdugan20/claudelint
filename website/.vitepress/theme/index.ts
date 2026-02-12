import DefaultTheme from 'vitepress/theme';
import { useRoute } from 'vitepress';
import { watch } from 'vue';
import RuleBadge from './components/RuleBadge.vue';
import RuleCard from './components/RuleCard.vue';
import CodeTabs from './components/CodeTabs.vue';
import FeatureGrid from './components/FeatureGrid.vue';
import ValidatorDiagram from './components/ValidatorDiagram.vue';
import ConfigExample from './components/ConfigExample.vue';
import RuleCount from './components/RuleCount.vue';
import RuleHeader from './components/RuleHeader.vue';
import './style.css';

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('RuleBadge', RuleBadge);
    app.component('RuleCard', RuleCard);
    app.component('CodeTabs', CodeTabs);
    app.component('FeatureGrid', FeatureGrid);
    app.component('ValidatorDiagram', ValidatorDiagram);
    app.component('ConfigExample', ConfigExample);
    app.component('RuleCount', RuleCount);
    app.component('RuleHeader', RuleHeader);
  },
  setup() {
    const route = useRoute();
    const update = () => {
      if (typeof document !== 'undefined') {
        document.body.classList.toggle('rules-page', route.path.startsWith('/rules/'));
      }
    };
    update();
    watch(() => route.path, update);
  },
};
