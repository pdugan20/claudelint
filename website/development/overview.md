# Development

Learn how to extend claudelint with custom rules, understand the architecture, and contribute to the project.

## Sections

- [Architecture](/development/architecture) - System design and validator framework
- [Custom Rules](/development/custom-rules) - Build your own validation rules
- [Contributing](/development/contributing) - Contribution guidelines

## Rule Documentation Auto-Generation

Rule documentation pages on this site are **auto-generated from source code metadata**. Each rule's TypeScript source file includes a `meta.docs` property that drives the generation of its documentation page.

### How It Works

1. Rules define inline documentation via `meta.docs` (type: `RuleDocumentation`)
2. Running `npm run docs:generate` reads all rules from the registry
3. Rules with `meta.docs` generate pages from the template in `scripts/generators/rule-page.ts`
4. Rules without `meta.docs` fall back to copying existing docs from `docs/rules/`
5. A sidebar JSON file is auto-generated for navigation

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
