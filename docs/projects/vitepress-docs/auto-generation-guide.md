# Auto-Generation System

How claudelint auto-generates rule documentation from source code metadata.

## Overview

claudelint uses a **metadata-driven approach** to keep rule documentation in sync with code. Rule metadata lives directly in the rule source files and is used to generate markdown documentation pages.

**Benefits:**

- [x] Single source of truth (metadata with code)
- [x] Type-safe documentation (TypeScript enforces schema)
- [x] Always in sync (docs auto-generated from code)
- [x] Less maintenance (no manual doc updates)
- [x] Enforced structure (consistent documentation)

## How It Works

### 1. Rule Metadata Schema

Each rule file contains a `docs` property in its `meta` object:

```typescript
// src/validators/skills/rules/skill-name.ts

export const skillNameRule: Rule = {
  meta: {
    // Required metadata
    name: 'skill-name',
    severity: 'error',
    category: 'skills',
    description: 'Skill name is required in frontmatter',

    // Documentation metadata
    docs: {
      // Recommended in default config
      recommended: true,

      // Auto-fixable rule
      fixable: false,

      // One-sentence description for search/indexes
      summary: 'Ensures all skills have a valid name in frontmatter',

      // Detailed explanation
      details: `
        Skills must declare a name in their SKILL.md frontmatter.
        The name should match the directory name and follow kebab-case naming.

        ## Why This Matters

        - Claude Code uses the skill name for command invocation
        - Name must match directory for proper resolution
        - Consistent naming improves discoverability
      `,

      // Code examples
      examples: {
        incorrect: [
          {
            description: 'Missing name field',
            code: `
---
description: "My skill"
---
            `.trim(),
          },
          {
            description: 'Empty name',
            code: `
---
name: ""
description: "My skill"
---
            `.trim(),
          },
        ],
        correct: [
          {
            description: 'Valid skill name',
            code: `
---
name: "my-skill"
description: "My skill"
---
            `.trim(),
          },
        ],
      },

      // Rule options schema
      options: {
        type: 'object',
        properties: {
          allowMissing: {
            type: 'boolean',
            default: false,
            description: 'Allow skills without names (not recommended)',
          },
        },
      },

      // Example configurations
      optionExamples: [
        {
          description: 'Default (error on missing name)',
          config: {
            rules: {
              'skill-name': 'error',
            },
          },
        },
        {
          description: 'Allow missing names (not recommended)',
          config: {
            rules: {
              'skill-name': [
                'error',
                {
                  allowMissing: true,
                },
              ],
            },
          },
        },
      ],

      // When to disable this rule
      whenNotToUse: `
        This rule should almost never be disabled. Skill names are required
        for Claude Code to invoke skills correctly. Only disable if you're
        creating a template or example skill that won't be used directly.
      `,

      // Related rules
      relatedRules: ['skill-description', 'skill-name-directory-mismatch'],

      // External links
      furtherReading: [
        {
          title: 'Skill Naming Conventions',
          url: '/guide/file-naming-conventions#skills',
        },
        {
          title: 'Skills Validator',
          url: '/validators/skills',
        },
      ],
    },
  },

  validate(context) {
    // Rule implementation
  },
};
```

### 2. Type Definitions

```typescript
// src/types/rule-metadata.ts

export interface RuleMeta {
  name: string;
  severity: 'error' | 'warning' | 'info';
  category: string;
  description: string;
  docs?: RuleDocumentation;
}

export interface RuleDocumentation {
  // Basic metadata
  recommended?: boolean;
  fixable?: boolean;
  summary: string;
  details: string;

  // Examples
  examples: {
    incorrect: ExampleBlock[];
    correct: ExampleBlock[];
  };

  // Options
  options?: JSONSchemaDefinition;
  optionExamples?: ConfigExample[];

  // Additional info
  whenNotToUse?: string;
  relatedRules?: string[];
  furtherReading?: Link[];
}

export interface ExampleBlock {
  description: string;
  code: string;
  language?: string; // Default: 'yaml'
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

### 3. Generation Script

```typescript
// scripts/generate-rule-docs.ts

import { getAllRules } from '../src/registry';
import { generateRulePage } from './generators/rule-page';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

async function generateRuleDocs() {
  console.log('Generating rule documentation...');

  const rules = getAllRules();
  let generated = 0;
  let skipped = 0;

  for (const rule of rules) {
    const outputPath = join(
      'website',
      'rules',
      rule.meta.category,
      `${rule.meta.name}.md`
    );

    if (rule.meta.docs) {
      // Generate from metadata
      const markdown = generateRulePage(rule);
      await mkdir(join('website', 'rules', rule.meta.category), {
        recursive: true,
      });
      await writeFile(outputPath, markdown);
      generated++;
    } else {
      // Fall back to existing doc (Phase 1/2)
      const existingDocPath = join(
        'docs',
        'rules',
        rule.meta.category,
        `${rule.meta.name}.md`
      );
      try {
        const existingDoc = await readFile(existingDocPath, 'utf-8');
        await mkdir(join('website', 'rules', rule.meta.category), {
          recursive: true,
        });
        await writeFile(outputPath, existingDoc);
        skipped++;
      } catch {
        console.warn(
          `No docs found for rule: ${rule.meta.category}/${rule.meta.name}`
        );
      }
    }
  }

  console.log(`✓ Generated ${generated} rule pages`);
  console.log(`✓ Copied ${skipped} existing pages`);
}

generateRuleDocs().catch(console.error);
```

### 4. Page Template Generator

```typescript
// scripts/generators/rule-page.ts

import { Rule } from '../../src/types';

export function generateRulePage(rule: Rule): string {
  const { meta } = rule;
  const { docs } = meta;

  if (!docs) {
    throw new Error(`Rule ${meta.name} missing docs metadata`);
  }

  const badges = [
    `<Badge type="${meta.severity === 'error' ? 'danger' : 'warning'}">${capitalizeFirst(meta.severity)}</Badge>`,
    docs.fixable
      ? `<Badge type="tip">Auto-fixable</Badge>`
      : `<Badge type="info">Not fixable</Badge>`,
  ];

  if (docs.recommended) {
    badges.push(`<Badge type="tip">Recommended</Badge>`);
  }

  const parts = [
    `---`,
    `title: ${meta.name}`,
    `description: ${docs.summary}`,
    `---`,
    ``,
    `# ${meta.name}`,
    ``,
    badges.join(' '),
    ``,
    docs.summary,
    ``,
    `## Rule Details`,
    ``,
    docs.details,
    ``,
    `## Examples`,
    ``,
  ];

  // Incorrect examples
  if (docs.examples.incorrect.length > 0) {
    parts.push(`### [ ] Incorrect`, ``);
    for (const example of docs.examples.incorrect) {
      parts.push(
        example.description,
        ``,
        '```' + (example.language || 'yaml'),
        example.code,
        '```',
        ``
      );
    }
  }

  // Correct examples
  if (docs.examples.correct.length > 0) {
    parts.push(`### [x] Correct`, ``);
    for (const example of docs.examples.correct) {
      parts.push(
        example.description,
        ``,
        '```' + (example.language || 'yaml'),
        example.code,
        '```',
        ``
      );
    }
  }

  // Options
  if (docs.options) {
    parts.push(`## Options`, ``);

    if (docs.optionExamples && docs.optionExamples.length > 0) {
      for (const example of docs.optionExamples) {
        parts.push(
          example.description,
          ``,
          '```json',
          JSON.stringify(example.config, null, 2),
          '```',
          ``
        );
      }
    }

    parts.push(
      `### Schema`,
      ``,
      '```json',
      JSON.stringify(docs.options, null, 2),
      '```',
      ``
    );
  }

  // When not to use
  if (docs.whenNotToUse) {
    parts.push(`## When Not To Use It`, ``, docs.whenNotToUse, ``);
  }

  // Related rules
  if (docs.relatedRules && docs.relatedRules.length > 0) {
    parts.push(`## Related Rules`, ``);
    for (const relatedRule of docs.relatedRules) {
      const category = getCategoryForRule(relatedRule);
      parts.push(`- [\`${relatedRule}\`](/rules/${category}/${relatedRule})`);
    }
    parts.push(``);
  }

  // Further reading
  if (docs.furtherReading && docs.furtherReading.length > 0) {
    parts.push(`## Further Reading`, ``);
    for (const link of docs.furtherReading) {
      parts.push(`- [${link.title}](${link.url})`);
    }
    parts.push(``);
  }

  return parts.join('\n');
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
```

## Migration Strategy

### Phase 1: Manual Sync (Week 1)

Start with manual doc copying to get site up quickly:

```bash
# Quick start - copy existing docs
node scripts/sync-docs.js
npm run docs:dev
```

**Goal:** Get VitePress site running with existing content.

### Phase 2: Gradual Metadata Addition (Weeks 2-4)

Add `docs` metadata to high-priority rules:

```typescript
// Priority 1: Most commonly violated rules
// Priority 2: Auto-fixable rules
// Priority 3: All remaining rules

// Example PR:
// 1. Add docs metadata to 5-10 rules
// 2. Run generator
// 3. Verify output
// 4. Commit both code and generated docs
```

**Goal:** 25% of rules have metadata by end of week 2, 100% by end of week 4.

### Phase 3: Full Auto-Generation (Week 5+)

Once all rules have metadata:

```json
// package.json
{
  "scripts": {
    "docs:generate": "tsx scripts/generate-rule-docs.ts",
    "docs:dev": "npm run docs:generate && vitepress dev website",
    "docs:build": "npm run docs:generate && vitepress build website"
  }
}
```

**Goal:** 100% auto-generated, docs/ folder can be removed.

## Validation

### Pre-commit Hook

```yaml
# .pre-commit-config.yaml
- repo: local
  hooks:
    - id: generate-docs
      name: Generate rule docs
      entry: npm run docs:generate
      language: node
      pass_filenames: false
      files: '^src/validators/.*/rules/.*\.ts$'
```

Automatically regenerates docs when rule files change.

### CI Validation

```yaml
# .github/workflows/docs-validation.yml
name: Validate Docs

on: [pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6

      - name: Install dependencies
        run: npm ci

      - name: Generate docs
        run: npm run docs:generate

      - name: Check for uncommitted changes
        run: |
          git diff --exit-code website/rules/ || {
            echo "Error: Generated docs don't match committed docs"
            echo "Run 'npm run docs:generate' and commit the changes"
            exit 1
          }
```

Ensures generated docs are always committed.

## Developer Workflow

### Adding a New Rule

```bash
# 1. Create rule file with docs metadata
src/validators/skills/rules/new-rule.ts

# 2. Generate docs
npm run docs:generate

# 3. Preview
npm run docs:dev

# 4. Commit everything together
git add src/ website/
git commit -m "feat(skills): add new-rule"
```

### Updating Rule Documentation

```typescript
// 1. Update docs metadata in rule file
export const myRule: Rule = {
  meta: {
    // ... update docs.details, docs.examples, etc.
  },
};

// 2. Regenerate
// npm run docs:generate

// 3. Verify changes
// git diff website/rules/category/my-rule.md
```

**Important:** NEVER edit generated markdown files directly. Always update the source metadata.

## Metadata Best Practices

### 1. Write Clear Examples

```typescript
// [ ] Bad: Vague example
examples: {
  incorrect: [{
    description: "Wrong",
    code: "..."
  }]
}

// [x] Good: Specific example with context
examples: {
  incorrect: [{
    description: "Missing name field in frontmatter",
    code: `
---
description: "My skill"
---
    `.trim()
  }]
}
```

### 2. Include Why It Matters

```typescript
// [ ] Bad: No context
details: "Skills must have names."

// [x] Good: Explain why
details: `
Skills must declare a name in their SKILL.md frontmatter.

## Why This Matters

- Claude Code uses the skill name for command invocation
- Name must match directory for proper resolution
- Consistent naming improves discoverability
`
```

### 3. Provide Actionable Options

```typescript
// [ ] Bad: Unclear options
optionExamples: [{
  config: { rules: { "my-rule": ["error", { foo: true }] } }
}]

// [x] Good: Describe what each option does
optionExamples: [{
  description: "Allow skills without names (not recommended)",
  config: { rules: { "my-rule": ["error", { allowMissing: true }] } }
}]
```

### 4. Link Related Content

```typescript
// Always include related rules and further reading
docs: {
  relatedRules: ['skill-description', 'skill-name-directory-mismatch'],
  furtherReading: [
    { title: 'Skill Naming Conventions', url: '/guide/file-naming-conventions#skills' },
    { title: 'Skills Validator', url: '/validators/skills' }
  ]
}
```

## Performance Considerations

### Generation Speed

- **~117 rules**: <1 second to generate all docs
- **Incremental**: Only changed rules regenerated (future optimization)
- **CI/CD**: <30 seconds total build time

### File Size

- **Average rule page**: ~3-5KB markdown
- **Total rule docs**: ~300-500KB (117 rules)
- **Built HTML**: ~1-2MB total (gzipped: ~200KB)

## Comparison to ESLint

ESLint uses the same approach:

```javascript
// ESLint rule file
module.exports = {
  meta: {
    docs: {
      description: 'Disallow use of console',
      recommended: false,
      url: 'https://eslint.org/docs/rules/no-console',
    },
  },
  create(context) {
    /* ... */
  },
};
```

Then they run a script that generates the docs website from this metadata.

**Differences:**

- ESLint: JavaScript-based, looser typing
- claudelint: TypeScript-based, type-safe metadata
- ESLint: Separate docs repo (in the past)
- claudelint: Monorepo approach

## Future Enhancements

### Auto-generate Validator Pages

Similar approach for validator overview pages:

```typescript
export const skillsValidator: Validator = {
  meta: {
    docs: {
      summary: 'Validates skill files and directory structure',
      // ...
    },
  },
};
```

### Type Definitions from Schema

Generate TypeScript types from JSON schemas:

```typescript
// Auto-generated from rule options schema
export interface SkillNameRuleOptions {
  allowMissing?: boolean;
}
```

### Interactive Examples

Embed live validation in documentation:

```vue
<!-- Auto-generated from rule metadata -->
<RulePlayground :rule="skillNameRule" />
```

## Troubleshooting

### Problem: Generated docs don't match

**Cause:** Rule metadata was updated but docs not regenerated.

**Solution:**

```bash
npm run docs:generate
git add website/rules/
git commit --amend --no-edit
```

### Problem: Type errors in metadata

**Cause:** Metadata doesn't match `RuleDocumentation` type.

**Solution:** Check type definitions and fix metadata:

```typescript
// Error: Property 'summary' is missing
docs: {
  // Add missing required fields
  summary: 'One-sentence description',
  details: 'Detailed explanation',
  examples: { incorrect: [], correct: [] },
}
```

### Problem: Missing related rule

**Cause:** Referenced rule doesn't exist or has wrong name.

**Solution:** Verify rule names in registry:

```bash
npm run list-rules | grep "rule-name"
```

## Summary

**Single source of truth:** Docs live with code as metadata.

**Type-safe:** TypeScript enforces documentation schema.

**Automated:** Docs auto-generated, always in sync.

**Scalable:** Works for 117 rules across 10 categories, will work for 500+.

**Industry-proven:** ESLint uses the same approach.

This approach eliminates sync issues and ensures documentation quality through type checking and automated generation.
