---
description: Learn how to extend claudelint with custom rules, understand rule documentation auto-generation, and navigate the architecture and contributing guides.
---

# Development

Learn how to extend claudelint with custom rules, understand the architecture, and contribute to the project.

## Quick Links

**Adding project-specific validation?**
Start with the [Custom Rules Guide](/development/custom-rules) to create rules in your `.claudelint/rules/` directory.

**Contributing a built-in rule?**
See [Contributing](/development/contributing#adding-validation-rules) for the rule checklist and `meta.docs` metadata format.

**Understanding the codebase?**
Read the [Architecture](/development/architecture) overview, then dive into the [Rule System](/development/rule-system) or [Internals](/development/internals) as needed.

## Sections

- [Architecture](/development/architecture) - System design, validation philosophy, project structure
- [Rule System](/development/rule-system) - Rule patterns, registries, and implementation details
- [Internals](/development/internals) - Caching, parallel validation, progress indicators, CLI
- [Custom Rules](/development/custom-rules) - Build your own validation rules
- [Helper Library](/development/helper-library) - Utility functions for custom rules
- [Contributing](/development/contributing) - Contribution guidelines

## Rule Documentation Auto-Generation

Rule documentation pages on this site are **auto-generated from source code metadata**. Each rule's TypeScript source file includes a `meta.docs` property that drives the generation of its documentation page.

### How It Works

1. Rules define inline documentation via `meta.docs` (type: `RuleDocumentation`)
2. Running `npm run docs:generate` reads all rules from the registry
3. Rules with `meta.docs` generate pages from the template in `scripts/generate/rule-docs.ts`
4. A sidebar JSON file is auto-generated for navigation

### RuleDocumentation Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `recommended` | `boolean` | No | Whether the rule is in the recommended config |
| `summary` | `string` | Yes | One-sentence summary for search and overviews |
| `details` | `string` | Yes | Detailed explanation (supports markdown) |
| `examples` | `object` | Yes | `{ incorrect: ExampleBlock[], correct: ExampleBlock[] }` |
| `howToFix` | `string` | No | Step-by-step fix instructions |
| `options` | `object` | No | JSON schema for configurable options |
| `optionExamples` | `ConfigExample[]` | No | Example configurations |
| `whenNotToUse` | `string` | No | Guidance on when to disable this rule |
| `relatedRules` | `string[]` | No | IDs of related rules |
| `furtherReading` | `Link[]` | No | External reference links |

### Supporting Types

**ExampleBlock**: `{ description: string, code: string, language?: string }`

**ConfigExample**: `{ description: string, config: Record<string, unknown> }`

**Link**: `{ title: string, url: string }`

### Commands

```bash
npm run docs:generate   # Generate rule pages and sidebar
npm run docs:dev        # Generate + start dev server
npm run docs:build      # Generate + production build
```

See the [Contributing guide](/development/contributing) for examples of good metadata.
