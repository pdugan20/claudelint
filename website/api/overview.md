# API Reference

claudelint provides a programmatic API for integrating validation into your tools and scripts. Everything is available from the `claude-code-lint` package.

## Quick Start

```typescript
import { lint, formatResults } from 'claude-code-lint';

const results = await lint(['**/*.md']);
const output = await formatResults(results);
console.log(output);
```

## Choosing an API Style

claudelint offers two API styles. Both provide the same core linting functionality.

### Functional API

Stateless, one-call convenience functions. Each call creates a fresh `ClaudeLint` instance internally.

```typescript
import { lint, lintText, formatResults } from 'claude-code-lint';

const results = await lint(['**/*.md']);
const output = await formatResults(results);
```

Best for: build scripts, pre-commit hooks, CI pipelines, quick validation checks.

### ClaudeLint Class

Stateful instance you configure once and reuse across multiple operations.

```typescript
import { ClaudeLint } from 'claude-code-lint';

const linter = new ClaudeLint({
  fix: true,
  onProgress: (file, i, total) => console.log(`[${i + 1}/${total}] ${file}`),
});

const results = await linter.lintFiles(['**/*.md']);
const formatter = await linter.loadFormatter('stylish');
console.log(formatter.format(results));
```

Best for: IDE integrations, watch mode, custom progress tracking, selective auto-fix, reusing configuration across multiple operations.

### At a Glance

| Capability | Functional API | ClaudeLint Class |
|---|---|---|
| Lint files | `lint(patterns)` | `linter.lintFiles(patterns)` |
| Lint text | `lintText(code)` | `linter.lintText(code)` |
| Format results | `formatResults(results)` | `linter.loadFormatter(name)` |
| Resolve config | `resolveConfig(path)` | `linter.calculateConfigForFile(path)` |
| File info | `getFileInfo(path)` | `linter.isPathIgnored(path)` |
| Progress callbacks | Yes (via `LintOptions`) | Yes |
| Fix predicates | No | Yes |
| Shared configuration | No (new instance per call) | Yes |
| Static utilities | N/A | `outputFixes`, `getErrorResults`, etc. |

## API Sections

- [ClaudeLint Class](/api/claudelint-class) - Full class-based API reference
- [Functional API](/api/functional-api) - Stateless convenience functions
- [Types](/api/types) - TypeScript type definitions
- [Schemas](/api/schemas) - Configuration schema reference
- [Formatters](/api/formatters) - Built-in and custom formatters
- [Recipes](/api/recipes) - Practical usage patterns and examples
