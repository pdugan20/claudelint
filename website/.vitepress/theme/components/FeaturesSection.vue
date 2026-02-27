<template>
  <section class="features-section">
    <div class="features-inner">
      <span class="features-eyebrow">Validators</span>
      <h2 class="features-heading">What it checks</h2>
      <p class="features-subtitle">
        claudelint validates every part of your Claude Code setup &mdash; from project memory to
        plugin manifests.
      </p>
      <div class="features-grid">
        <div v-for="feature in features" :key="feature.title" class="features-card">
          <h3 class="features-card-title">{{ feature.title }}</h3>
          <p class="features-card-desc">{{ feature.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const features = [
  {
    title: 'CLAUDE.md',
    description: 'Size limits, @import chains, circular references, and section structure.',
  },
  {
    title: 'Skills',
    description: 'Frontmatter schema, naming, allowed-tools, security patterns, and docs coverage.',
  },
  {
    title: 'Hooks & Settings',
    description: 'Event types, permission rules, matcher patterns, and environment variables.',
  },
  {
    title: 'MCP Servers',
    description: 'Transport config, server URLs, environment variables, and protocol validation.',
  },
  {
    title: 'Plugins',
    description: 'Manifest schema, semantic versions, component paths, and marketplace metadata.',
  },
  {
    title: '114 Rules',
    description: 'Recommended and strict presets with configurable severity levels.',
  },
];
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
  margin: 0 auto 48px;
  max-width: 540px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  text-align: left;
}

.features-card {
  padding: 20px;
  background: var(--vp-c-bg-elv);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.features-card:hover {
  border-color: var(--vp-c-border);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.features-card-title {
  margin: 0 0 8px;
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.features-card-desc {
  margin: 0;
  font-size: 0.8125rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}

@media (max-width: 959px) {
  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 639px) {
  .features-section {
    padding: 60px 24px;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .features-heading {
    font-size: 1.75rem;
  }
}
</style>
