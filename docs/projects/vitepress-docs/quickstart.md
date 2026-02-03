# Quick Start Guide

How to get started with VitePress documentation development.

## Prerequisites

- Node.js 20+
- npm/pnpm/yarn
- claudelint repo cloned locally
- Familiarity with Vue 3 (for custom components)

## Phase 1: Setup (Week 1)

### Step 1: Install VitePress

```bash
cd /path/to/claudelint

# Install dependencies
npm install -D vitepress vue tsx

# Verify installation
npx vitepress --version
```

### Step 2: Create Directory Structure

```bash
# Create website folder
mkdir -p website/.vitepress/theme/components
mkdir -p website/.vitepress/plugins
mkdir -p website/public
mkdir -p website/guide
mkdir -p website/validators
mkdir -p website/rules
mkdir -p website/integrations
mkdir -p website/api
mkdir -p website/development
mkdir -p website/reference

# Create scripts folder
mkdir -p scripts/generators
```

### Step 3: Add npm Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "docs:generate": "tsx scripts/generate-rule-docs.ts",
    "docs:dev": "npm run docs:generate && vitepress dev website",
    "docs:build": "npm run docs:generate && vitepress build website",
    "docs:preview": "vitepress preview website"
  }
}
```

### Step 4: Create Basic Config

Create `website/.vitepress/config.ts`:

```typescript
import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'claudelint',
  description: 'Comprehensive linter for Claude Code projects',
  lang: 'en-US',

  base: '/',

  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { property: 'og:type', content: 'website' }],
    [
      'meta',
      {
        property: 'og:title',
        content: 'claudelint - Lint your Claude Code projects',
      },
    ],
    [
      'meta',
      {
        property: 'og:description',
        content:
          'Validate CLAUDE.md, skills, settings, hooks, MCP servers, and plugins',
      },
    ],
  ],

  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Validators', link: '/validators/overview' },
      { text: 'Rules', link: '/rules/overview' },
      { text: 'Integrations', link: '/integrations/overview' },
      { text: 'API', link: '/api/overview' },
      { text: 'Development', link: '/development/overview' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Introduction', link: '/guide/getting-started' },
            { text: 'Why claudelint?', link: '/guide/why-claudelint' },
            { text: 'Core Concepts', link: '/guide/core-concepts' },
          ],
        },
        {
          text: 'Usage',
          items: [
            { text: 'Configuration', link: '/guide/configuration' },
            { text: 'CLI Reference', link: '/guide/cli-reference' },
            { text: 'Auto-fix', link: '/guide/auto-fix' },
            { text: 'Inline Disables', link: '/guide/inline-disables' },
          ],
        },
        {
          text: 'Help',
          items: [{ text: 'Troubleshooting', link: '/guide/troubleshooting' }],
        },
      ],
      // Add other sidebars as needed
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/pdugan20/claudelint' },
      { icon: 'npm', link: 'https://www.npmjs.com/package/claude-code-lint' },
    ],

    editLink: {
      pattern:
        'https://github.com/pdugan20/claudelint/edit/main/website/:path',
      text: 'Edit this page on GitHub',
    },

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright (c) 2024-present Pat Dugan',
    },

    search: {
      provider: 'local',
    },
  },

  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark',
    },
    lineNumbers: true,
  },

  sitemap: {
    hostname: 'https://docs.claudelint.dev',
  },
});
```

### Step 5: Create Homepage

Create `website/index.md`:

```markdown
---
layout: home

hero:
  name: claudelint
  text: Comprehensive linter for Claude Code
  tagline: Validate CLAUDE.md, skills, settings, hooks, and more
  image:
    src: /logo.svg
    alt: claudelint
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/pdugan20/claudelint

features:
  - icon: 
    title: Fast & Efficient
    details: Parallel validation with smart caching for ~2.4x speedup
  - icon: 
    title: 105 Validation Rules
    details: Comprehensive checks across 10 validator categories
  - icon: 
    title: Auto-fix
    details: Automatically fix common issues with --fix flag
  - icon: 
    title: Developer-Friendly
    details: Interactive setup, inline disables, multiple output formats
  - icon: 
    title: Per-rule Documentation
    details: Detailed docs with examples for every rule
  - icon: 
    title: Extensible
    details: Create custom validators and rules
---

## Quick Start

```bash
npm install -g claude-code-lint
claudelint init
claudelint check-all
```

## Why claudelint?

claudelint ensures your Claude Code projects follow best practices and catch issues early in development.

```text
```

### Step 6: Create Sync Script (Temporary)

Create `scripts/sync-docs.ts`:

```typescript
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { globSync } from 'glob';

/**
 * Temporary script to copy existing docs to VitePress structure
 * This will be replaced by auto-generation in Phase 2
 */

const docsRoot = join(process.cwd(), 'docs');
const websiteRoot = join(process.cwd(), 'website');

// Copy guide docs
const guideDocs = ['getting-started.md', 'configuration.md', 'cli-reference.md', 'troubleshooting.md'];

for (const doc of guideDocs) {
  const source = join(docsRoot, doc);
  const dest = join(websiteRoot, 'guide', doc);

  try {
    const content = readFileSync(source, 'utf-8');
    // Add frontmatter if missing
    const withFrontmatter = content.startsWith('---')
      ? content
      : `---\ntitle: ${doc.replace('.md', '').replace(/-/g, ' ')}\n---\n\n${content}`;

    mkdirSync(join(websiteRoot, 'guide'), { recursive: true });
    writeFileSync(dest, withFrontmatter);
    console.log(`✓ Copied ${doc}`);
  } catch (error) {
    console.warn(` Could not copy ${doc}:`, error);
  }
}

console.log('\n✓ Docs sync complete!');
console.log('Run: npm run docs:dev');
```

### Step 7: Run Dev Server

```bash
# Create placeholder generator (will be replaced in Phase 2)
echo 'console.log("No rules to generate yet")' > scripts/generate-rule-docs.ts

# Sync existing docs
tsx scripts/sync-docs.ts

# Start dev server
npm run docs:dev
```

Visit `http://localhost:5173` - you should see your homepage!

## Phase 2: Auto-Generation (Week 2)

### Step 1: Create Type Definitions

Create `src/types/rule-metadata.ts`:

```typescript
export interface RuleMeta {
  name: string;
  severity: 'error' | 'warning' | 'info';
  category: string;
  description: string;
  docs?: RuleDocumentation;
}

export interface RuleDocumentation {
  recommended?: boolean;
  fixable?: boolean;
  summary: string;
  details: string;
  examples: {
    incorrect: ExampleBlock[];
    correct: ExampleBlock[];
  };
  options?: JSONSchemaDefinition;
  optionExamples?: ConfigExample[];
  whenNotToUse?: string;
  relatedRules?: string[];
  furtherReading?: Link[];
}

export interface ExampleBlock {
  description: string;
  code: string;
  language?: string;
}

export interface ConfigExample {
  description: string;
  config: Record<string, unknown>;
}

export interface Link {
  title: string;
  url: string;
}
```

### Step 2: Add Metadata to First Rule

Pick a high-priority rule (e.g., `skill-name.ts`) and add docs metadata:

```typescript
export const skillNameRule: Rule = {
  meta: {
    name: 'skill-name',
    severity: 'error',
    category: 'skills',
    description: 'Skill name is required in frontmatter',

    // NEW: Add docs metadata
    docs: {
      recommended: true,
      fixable: false,
      summary: 'Ensures all skills have a valid name in frontmatter',
      details: `Skills must declare a name in their SKILL.md frontmatter...`,
      examples: {
        incorrect: [
          {
            description: 'Missing name field',
            code: `---\ndescription: "My skill"\n---`,
          },
        ],
        correct: [
          {
            description: 'Valid skill name',
            code: `---\nname: "my-skill"\ndescription: "My skill"\n---`,
          },
        ],
      },
      relatedRules: ['skill-description', 'skill-name-directory-mismatch'],
    },
  },

  validate(context) {
    // ... existing implementation
  },
};
```

### Step 3: Create Generator

Update `scripts/generate-rule-docs.ts` - see [auto-generation-guide.md](./auto-generation-guide.md) for complete implementation.

### Step 4: Test Generation

```bash
npm run docs:generate
npm run docs:dev
```

Navigate to the generated rule page and verify it looks good!

## Phase 3: Components (Week 5)

### Create First Component

Create `website/.vitepress/theme/components/RuleCard.vue`:

```vue
<template>
  <div class="rule-card" @click="navigate">
    <div class="rule-card-header">
      <h3>{{ rule.name }}</h3>
      <span :class="['badge', `badge-${rule.severity}`]">
        {{ rule.severity }}
      </span>
    </div>
    <p class="rule-card-description">{{ rule.description }}</p>
    <div class="rule-card-footer">
      <span class="rule-card-category">{{ rule.category }}</span>
      <span v-if="rule.fixable" class="badge badge-fixable">Auto-fixable</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vitepress';

interface Props {
  rule: {
    name: string;
    category: string;
    severity: 'error' | 'warning' | 'info';
    description: string;
    fixable: boolean;
    link: string;
  };
}

const props = defineProps<Props>();
const router = useRouter();

const navigate = () => {
  router.go(props.rule.link);
};
</script>

<style scoped>
.rule-card {
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.rule-card:hover {
  border-color: var(--vp-c-brand);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.rule-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.rule-card h3 {
  font-family: var(--vp-font-family-mono);
  font-size: 1.125rem;
  margin: 0;
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.badge-error {
  background: rgba(220, 38, 38, 0.1);
  color: #dc2626;
}

.badge-warning {
  background: rgba(217, 119, 6, 0.1);
  color: #d97706;
}

.rule-card-description {
  color: var(--vp-c-text-2);
  margin-bottom: 1rem;
}

.rule-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
}

.rule-card-category {
  color: var(--vp-c-text-3);
}
</style>
```

Register in `website/.vitepress/theme/index.ts`:

```typescript
import DefaultTheme from 'vitepress/theme';
import RuleCard from './components/RuleCard.vue';

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('RuleCard', RuleCard);
  },
};
```

Use in markdown:

```markdown
<RuleCard :rule="{
  name: 'skill-name',
  category: 'skills',
  severity: 'error',
  description: 'Skill name is required in frontmatter',
  fixable: false,
  link: '/rules/skills/skill-name'
}" />
```

## Phase 6: Deploy to Vercel

### Step 1: Connect Repository

1. Go to <https://vercel.com>
2. Sign in with GitHub
3. Click "Add New Project"
4. Import `pdugan20/claudelint`
5. Verify settings:
   - Framework: VitePress
   - Build Command: `npm run docs:build`
   - Output Directory: `website/.vitepress/dist`

### Step 2: Deploy

Click "Deploy" and wait ~1-2 minutes. Your site will be live at `claudelint.vercel.app`!

### Step 3: Custom Domain

1. Add domain in Vercel: `docs.claudelint.dev`
2. Configure DNS:

   ```text
   Type: CNAME
   Name: docs
   Value: cname.vercel-dns.com
   ```

3. Wait 5-30 minutes for DNS propagation
4. Site live at `https://docs.claudelint.dev`

## Troubleshooting

### Dev server won't start

```bash
# Clear cache and node_modules
rm -rf node_modules website/.vitepress/cache
npm install
npm run docs:dev
```

### Build fails

Check that:

- All frontmatter is valid YAML
- All internal links use absolute paths (`/guide/` not `../guide/`)
- All referenced files exist
- No TypeScript errors in components

### Components not rendering

Verify:

- Component is registered in `theme/index.ts`
- Component name is PascalCase in both file and usage
- Props are correctly typed with TypeScript

## Next Steps

- Read [plan.md](./plan.md) for complete implementation plan
- Follow [implementation-tracker.md](./implementation-tracker.md) for task-by-task progress
- See [auto-generation-guide.md](./auto-generation-guide.md) for metadata approach
- Check [information-architecture.md](./information-architecture.md) for site structure

## Resources

- VitePress Docs: <https://vitepress.dev>
- Vue 3 Docs: <https://vuejs.org>
- Vercel Docs: <https://vercel.com/docs>
