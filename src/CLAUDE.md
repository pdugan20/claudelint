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
    since: '0.2.0',
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

**Do NOT hand-edit `src/rules/index.ts` or `src/types/rule-ids.ts`** — these are auto-generated.

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

## Conventions

- All rule IDs are kebab-case and prefixed by category: `skill-name`, `hook-event-type`
- Rules delegate to Zod schemas where possible (thin wrapper pattern)
- `context.report()` takes `{ message, line?, column?, fix? }`
- Fixable rules must provide a `fix` function in the report
