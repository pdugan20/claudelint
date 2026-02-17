# Core Package (NPM Linter)

## Commands

```bash
npm run build            # Compile TypeScript to dist/
npm run dev              # Watch mode (tsc --watch)
npm test                 # Full Jest suite
npm run test:watch       # Jest watch mode
npm run test:validators  # Validator tests with coverage
npm run test:schemas     # Schema tests with coverage
npm run generate:types   # Regenerate rule index and ID types
npm run check:self       # Build then run claudelint on itself
```

## Rule Authoring

Rules live in `src/rules/<category>/` and follow this structure:

```typescript
export const rule: Rule = {
  meta: {
    id: 'category-rule-name',        // Must match filename
    name: 'Human Readable Name',
    description: 'One-line summary',
    category: 'CategoryName',
    severity: 'error' | 'warning',
    fixable: boolean,
    deprecated: boolean,
    since: '0.2.0',                    // Required for built-in rules, optional for custom rules
    docs: {
      recommended: boolean,
      summary: 'Short summary for docs',
      details: 'Full explanation for docs page',
      examples: { incorrect: [...], correct: [...] },
    },
  },
  create(context: RuleContext) {
    // Validation logic — call context.report() for violations
  },
};
```

### Adding a New Rule

1. Create `src/rules/<category>/<rule-name>.ts` following the pattern above
2. Create `tests/rules/<rule-name>.test.ts` with passing/failing cases
3. Run `npm run generate:types` to register the rule in `src/rules/index.ts` and `src/rules/rule-ids.ts`
4. Run `npm run docs:generate` to create the website documentation page
5. Run `npm run check:rule-coverage` to verify docs/tests exist

**Do NOT hand-edit `src/rules/index.ts` or `src/rules/rule-ids.ts`** — these are auto-generated.

### Shared Utilities for Rule Authors

Rules that parse Markdown/YAML content **must** use shared utilities from `../../utils/formats/markdown`. Do not hand-roll parsing logic.

| Utility | Purpose | Import from |
|---|---|---|
| `extractFrontmatter<T>()` | Parse YAML frontmatter into typed object | `utils/formats/markdown` |
| `extractBodyContent()` | Get content after frontmatter closing `---` | `utils/formats/markdown` |
| `stripCodeBlocks()` | Remove fenced + inline code blocks (preserves line count) | `utils/formats/markdown` |
| `getFrontmatterFieldLine()` | Find line number for a specific frontmatter field | `utils/formats/markdown` |

**Anti-patterns (enforced by `npm run check:rule-patterns` and ESLint):**

- Do not use `lastIndex` with global regex -- use `matchAll()` instead
- Do not strip code blocks with `/```[\s\S]*?```/g` -- use `stripCodeBlocks()`
- Do not split frontmatter with `.split('---')` -- use `extractBodyContent()`
- Do not import `js-yaml` directly -- use `extractFrontmatter()`
- Do not use `url.includes('$')` for env var detection -- use `/\$\{[A-Z_]+\}|\$[A-Z_]+\b/`

Pre-parsed data is also available on `context.frontmatter`, `context.bodyContent`, and `context.contentWithoutCode` (lazy-computed).

## Schemas

- **Zod schemas**: `src/schemas/` — used at runtime for validation
- **JSON schemas**: `schemas/` — generated from Zod via `npm run generate:json-schemas`
- Keep in sync: `npm run check:schema-sync` verifies Zod and JSON schemas match

## Test Structure

```text
tests/
  rules/          # One test file per rule
  validators/     # Validator integration tests
  api/            # Public API tests
  schemas/        # Schema validation tests
  fixtures/       # Test project fixtures
  helpers/        # Shared test utilities
  integration/    # End-to-end CLI tests
```

Coverage thresholds: 70% branches, 80% functions/lines/statements.

## Key Directories

- `src/api/` — public programmatic API (`ClaudeLint` class, formatters). Keep stable.
- `src/cli/` — CLI commands (commander.js)
- `src/validators/` — orchestrate rules by component type (skills, hooks, settings, etc.)
- `src/utils/` — shared utilities (markdown parsing, frontmatter extraction, etc.)
- `src/types/` — TypeScript type definitions

## Rule Message Guidelines

Messages in `context.report({ message })` are shown in the default CLI table. They must be concise problem statements.

**Max length**: 100 characters (enforced by `npm run check:message-length`).

**Message content rules** (enforced by `npm run check:message-content`):

- State the problem only. No fix instructions, rationale, or examples.
- Do not start with imperative verbs (Add, Use, Create, Remove, Consider).
- Do not include "so that", "to ensure", "which means", "e.g.,", "for example".
- Do not dump lists of valid values. Put those in the `fix` field or `docs.howToFix`.

**Where content belongs**:

| Content type | Field | Shown in |
|---|---|---|
| Problem statement | `message` | Default table output |
| How to fix | `fix` or `docs.howToFix` | `--explain` mode (Fix:) |
| Why it matters | `docs.rationale` | `--explain` mode (Why:) |
| Full explanation | `docs.details` | `claudelint explain <rule>` |
| Code examples | `docs.examples` | `claudelint explain <rule>` |

**Good**: `File exceeds 40KB limit (50001 bytes)`

**Bad**: `File exceeds 40KB limit (50001 bytes). Split content into smaller files using @imports to keep the file manageable.`

## Conventions

- All rule IDs are kebab-case and prefixed by category: `skill-name`, `hook-event-type`
- Rules delegate to Zod schemas where possible (thin wrapper pattern)
- `context.report()` takes `{ message, line?, column?, fix? }`
- Fixable rules must provide a `fix` function in the report
