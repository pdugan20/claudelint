# Tooling Research: API Docs Verification

Research on modern approaches to keeping TypeScript API documentation in sync with code.

**Research Date:** 2026-02-16

## Tool Landscape

### TypeDoc

- Reads TypeScript source files and generates HTML docs or JSON model
- Plugin `typedoc-plugin-markdown` outputs Markdown for VitePress/Docusaurus
- Plugin `typedoc-plugin-coverage` generates doc coverage badge/threshold
- Best for: generated API reference alongside hand-written guides
- Tradeoff: less control over output quality, no API change tracking

### @microsoft/api-extractor

- Reads compiled `.d.ts` files, produces:
  - Rolled-up `.d.ts` bundle
  - API report file (`etc/<package>.api.md`) -- committed to git, diffed in PRs
  - JSON model for downstream doc generation
- Used by: Microsoft Rush Stack, Fluent UI, Teams SDK, Bot Framework
- Best for: strict API surface tracking and breaking change detection
- Tradeoff: heavier dependency, bundles its own TypeScript version
- Key feature: CI mode fails if committed report doesn't match current code

### TSDoc + eslint-plugin-tsdoc

- TSDoc: doc comment standard (`@param`, `@returns`, `@remarks`)
- eslint-plugin-tsdoc: validates doc comment syntax conforms to TSDoc spec
- Lightweight, runs as ESLint rule

### eslint-plugin-jsdoc

- Enforces doc comment presence and completeness
- Key rule: `require-jsdoc` with `publicOnly: true` -- flags public exports missing docs
- Can require `@param`, `@returns` descriptions

### tsd (Type Definition Testing)

- Write `.test-d.ts` files that assert type-level properties
- `expectType<string>(myFunction())` verifies return type at compile time
- Catches accidental type widening/narrowing without executing code

### publint + @arethetypeswrong/cli

- Verify `package.json` exports, main, module, types are correct
- Ensure consumers can resolve types under all module resolution strategies
- Already have `publint` in devDependencies

## Recommended Approach by Phase

### Phase 2: Lightweight CI guards

**Export snapshot test (Jest):**

```typescript
import * as api from '../src/index';

test('public API surface has not changed', () => {
  expect(Object.keys(api).sort()).toMatchSnapshot();
});
```

Forces deliberate `--updateSnapshot` when exports change.

**TSDoc lint enforcement:**

```bash
npm install --save-dev eslint-plugin-tsdoc eslint-plugin-jsdoc
```

Rules to add:

- `tsdoc/syntax: 'error'` -- valid doc comment syntax
- `jsdoc/require-jsdoc: ['error', { publicOnly: true }]` -- require docs on all public exports

**tsd type assertions:**

```bash
npm install --save-dev tsd
```

```typescript
// src/index.test-d.ts
import { expectType } from 'tsd';
import { lint, ClaudeLint, LintResult } from '.';

expectType<Promise<LintResult[]>>(lint(['**/*.md']));
expectType<Promise<LintResult[]>>(new ClaudeLint().lintFiles(['**/*.md']));
```

### Phase 3: API Extractor

**Setup:**

```bash
npm install --save-dev @microsoft/api-extractor
npx api-extractor init
```

**Configuration (`api-extractor.json`):**

```json
{
  "mainEntryPointFilePath": "dist/index.d.ts",
  "apiReport": {
    "enabled": true,
    "reportFolder": "etc/"
  },
  "docModel": {
    "enabled": false
  },
  "dtsRollup": {
    "enabled": false
  }
}
```

**CI integration:**

- Local: `npx api-extractor run --local --verbose` (updates report, commit changes)
- CI: `npx api-extractor run` (fails if report differs from committed version)
- Add `CODEOWNERS` entry for `etc/*.api.md` requiring API review

**npm scripts:**

```json
{
  "check:api-report": "api-extractor run",
  "check:api-report:update": "api-extractor run --local --verbose"
}
```

### Phase 4: Executable code samples

**Directory structure:**

```text
tests/api-examples/
  build-script.ts
  pre-commit-hook.ts
  ci-pipeline.ts
  text-validation.ts
  config-inspector.ts
  progress-tracking.ts
  selective-auto-fix.ts
  markdown-formatter.ts
  group-by-rule-formatter.ts
```

**Test harness:**

```typescript
// tests/api-examples/build-script.ts
// This file is referenced from website/api/recipes.md
// It must compile and pass type checking

import { lint, formatResults } from '../../src/index';

async function validateProject() {
  const results = await lint(['**/*.md']);
  const hasErrors = results.some(r => r.errorCount > 0);
  if (hasErrors) {
    const output = await formatResults(results, 'stylish');
    console.error(output);
    process.exit(1);
  }
}

// Exported so it type-checks without "unused" warnings
export { validateProject };
```

**CI check:**

```bash
npx tsc --noEmit tests/api-examples/*.ts
```

This verifies all code samples compile against the current API. If a function signature changes, the examples fail to compile.

## How Other Projects Handle This

| Project | Approach |
|---------|----------|
| ESLint | Hand-written docs, no automated sync. Historically has had docs drift. |
| Prettier | Generated docs from JSDoc. Tight coupling between code and docs. |
| Stylelint | Hand-written docs with manual review. |
| Microsoft Rush Stack | API Extractor reports committed to git, CI enforced. Gold standard. |
| Fluent UI | API Extractor + TypeDoc hybrid. Reports in PRs, generated reference. |
| Stripe SDKs | Executable code samples tested in CI. |
| Arcjet | Executable code samples imported into docs at build time. |

## Decision: Why Not Full TypeDoc Generation?

We already have high-quality hand-written VitePress docs with custom components, examples, and editorial voice. Replacing them with TypeDoc-generated output would lose that quality.

Instead, we use API Extractor for **change detection** (the report file) and TSDoc/JSDoc linting for **completeness enforcement** (every public export has a doc comment). The hand-written docs remain the source of truth for consumers, with CI checks ensuring they don't drift from code.
