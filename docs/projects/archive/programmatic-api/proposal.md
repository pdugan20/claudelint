# Programmatic API Implementation Proposal

**Status:**  Proposed
**Created:** 2026-01-30
**Owner:** @pdugan20

## Executive Summary

Add a comprehensive programmatic API to claudelint, enabling developers to integrate linting capabilities directly into their applications, build tools, and automation workflows. This proposal follows modern Node.js API design patterns while maintaining compatibility with existing CLI functionality.

## Problem Statement

Currently, claudelint is primarily used as a CLI tool. Developers who want to:
- Integrate claudelint into build pipelines programmatically
- Create custom tooling that includes validation
- Build editor extensions or IDE integrations
- Automate complex validation workflows

...must either shell out to the CLI or directly import internal validators, which is not a supported use case and lacks proper documentation.

## Goals

1. **Provide a stable, documented programmatic API** for Node.js integration
2. **Match ESLint's API patterns** for familiarity and ecosystem alignment
3. **Support both simple and complex use cases** through hybrid design
4. **Design a clean public API** that exports only stable, documented interfaces
5. **Enable advanced features** like custom formatters, auto-fixing, and caching
6. **Deliver excellent TypeScript DX** with comprehensive types

## Non-Goals

- Changing the CLI interface (remains unchanged)
- Exporting internal validators (following ESLint/Prettier patterns)
- Browser support (Node.js only, like ESLint)
- Rewriting core validation logic (wrapper around existing validators)

## Decision: Hybrid Class-Based + Functional API

After extensive research into modern API design patterns (ESLint, Prettier, Zod, Valibot, tRPC), we've decided on a **hybrid approach**:

### Primary API: Class-Based (`ClaudeLint`)

**Rationale:**
- claudelint is a CLI/build tool where bundle size is irrelevant
- ESLint uses class-based API - users expect similar patterns
- Complex state management (configuration, caching, file discovery)
- Multiple related operations on a single instance (typical workflow)
- Existing codebase already uses class-based validators

### Secondary API: Functional Utilities

**Rationale:**
- Convenience for simple one-off operations
- Pure functions for stateless operations (config resolution, formatting)
- Better tree-shaking for users who only need specific utilities
- Modern functional patterns for simple use cases

## API Surface

### Main Class

```typescript
import { ClaudeLint } from '@pdugan20/claudelint';

const linter = new ClaudeLint({
  fix: true,
  cache: true,
  cacheLocation: '.claudelint-cache',
  config: { /* custom config */ }
});

const results = await linter.lintFiles(['**/*.md']);
const formatter = await linter.loadFormatter('stylish');
console.log(formatter.format(results));
```

### Functional Utilities

```typescript
import { lint, resolveConfig, formatResults } from '@pdugan20/claudelint';

// Simple one-off lint
const results = await lint(['CLAUDE.md'], { fix: true });

// Config resolution
const config = await resolveConfig('./project');

// Formatting
const output = await formatResults(results, 'json');
```

## Architecture

```
src/
├── api/
│   ├── claudelint.ts       # Main ClaudeLint class
│   ├── functions.ts        # Functional API utilities
│   ├── types.ts            # Shared API types
│   ├── formatter.ts        # Formatter interface/loading
│   └── result-builder.ts   # Build standardized results
├── validators/             # Existing validators (unchanged)
├── utils/                  # Existing utilities (unchanged)
└── index.ts                # Main exports (updated)
```

## Key Features

### 1. Standardized Result Format

```typescript
interface LintResult {
  filePath: string;
  messages: LintMessage[];
  errorCount: number;
  warningCount: number;
  fixableErrorCount: number;
  fixableWarningCount: number;
  output?: string; // Fixed content
  source?: string; // Original content
}
```

### 2. Configuration Discovery

```typescript
// Automatic config discovery
const linter = new ClaudeLint(); // Finds .claudelintrc.json

// Manual config
const linter = new ClaudeLint({
  config: { rules: { 'rule-id': 'error' } }
});

// Config file override
const linter = new ClaudeLint({
  overrideConfigFile: './custom-config.json'
});
```

### 3. Auto-Fix Support

```typescript
// Enable fixes
const linter = new ClaudeLint({ fix: true });
const results = await linter.lintFiles(['**/*.md']);

// Apply fixes to disk
await ClaudeLint.outputFixes(results);

// Get fixed content without writing
const fixed = ClaudeLint.getFixedContent(results);
```

### 4. Formatter System

```typescript
// Load built-in formatter
const formatter = await linter.loadFormatter('stylish');

// Load custom formatter
const formatter = await linter.loadFormatter('./my-formatter.js');

// Format results
const output = formatter.format(results);
```

### 5. Progress Callbacks

```typescript
const linter = new ClaudeLint({
  onStart: (fileCount) => console.log(`Linting ${fileCount} files...`),
  onProgress: (file, idx, total) => console.log(`[${idx}/${total}] ${file}`),
  onComplete: (results) => console.log('Done!')
});
```

## Implementation Phases

See [TASK_TRACKER.md](./TASK_TRACKER.md) for detailed task breakdown.

### Phase 1: Foundation (Week 1)
- Design and implement core `ClaudeLint` class
- Standardize `LintResult` interface
- Basic `lintFiles()` method
- Configuration loading

### Phase 2: Core Features (Week 2)
- Implement `lintText()` method
- Add configuration methods
- Formatter system
- Result utilities

### Phase 3: Advanced Features (Week 3)
- Auto-fix support (`outputFixes()`)
- Progress callbacks
- Functional API wrappers
- Caching integration

### Phase 4: Documentation & Polish (Week 4)
- API documentation
- Usage examples
- Migration guide
- TypeScript type tests
- Performance benchmarks

## Success Metrics

- [x] All existing tests pass (no regressions)
- [x] New API has >90% test coverage
- [x] Comprehensive API documentation published
- [x] At least 3 real-world usage examples
- [x] TypeScript types exported and tested
- [x] Clean public API (follows ESLint/Prettier patterns)
- [x] Performance parity with CLI (within 5%)

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| API complexity creep | Medium | Follow ESLint patterns strictly, avoid over-engineering |
| Performance regression | Medium | Benchmark before/after, cache aggressively |
| Poor adoption | Low | Create compelling examples, document thoroughly |
| Maintenance burden | Medium | Keep API surface minimal, leverage existing code |
| API design mistakes | Medium | Package is unreleased (v0.1.0), can iterate freely |

## Public API Design

Following **ESLint and Prettier patterns**, we export only stable, documented public APIs while keeping internal implementation details private. This approach provides:

- **API Stability** - Internal validators can be refactored without breaking changes
- **Simplified Maintenance** - Only documented APIs need backward compatibility
- **Clear Boundaries** - Users know what's supported vs. internal
- **Future Flexibility** - Can change implementation without user impact

### What's Exported (Public API)

```typescript
// Main programmatic API class
import { ClaudeLint } from '@pdugan20/claudelint';

// Type definitions
import type {
  LintResult, LintMessage, ClaudeLintOptions,
  Formatter, RuleMetadata
} from '@pdugan20/claudelint';

// Formatter utilities
import { loadFormatter, BaseFormatter } from '@pdugan20/claudelint';

// Configuration utilities
import { findConfigFile, loadConfig } from '@pdugan20/claudelint';
```

### What's NOT Exported (Internal Implementation)

```typescript
// Internal validators - NOT exported
// - SkillsValidator, ClaudeMdValidator, etc.
// - ValidatorRegistry
// - Rule implementations
// - Internal utilities

// Users should use ClaudeLint class instead:
const linter = new ClaudeLint();
const results = await linter.lintFiles(['**/*.md']);
```

**Note:** Since claudelint v0.1.0 is unreleased, we have complete freedom to design the API correctly from the start, following industry-standard patterns without concern for breaking changes.

## Alternative Approaches Considered

### 1. Purely Functional API (like Prettier)
**Rejected** - Doesn't fit claudelint's use case:
- Complex state management (config, cache, file discovery)
- Multiple operations on same files (lint → fix → format)
- Bundle size irrelevant (Node.js only)

### 2. Keep CLI-Only
**Rejected** - Limits ecosystem integration:
- Can't build editor extensions easily
- Hard to integrate into build tools
- Users forced to shell out or use undocumented internals

### 3. Pure Refactor to Functional
**Rejected** - Too disruptive:
- Existing validators are class-based
- Massive refactor with limited benefit
- Risk of regressions

## Open Questions

- [ ] Should we support streaming results for very large projects?
- [ ] Do we need a plugin system for custom validators?
- [ ] Should the API support running specific validators only?
- [ ] Do we need a `--watch` mode API?

## References

- [ESLint Node.js API](https://eslint.org/docs/latest/integrate/nodejs-api)
- [Prettier API](https://prettier.io/docs/api)
- [Node.js Best Practices 2026](https://medium.com/@backendbyeli/node-js-best-practices-2026-what-every-backend-developer-must-know-144873cfc534)
- [Modern API Design Best Practices](https://www.xano.com/blog/modern-api-design-best-practices/)
- [TypeScript Library Structures](https://www.typescriptlang.org/docs/handbook/declaration-files/library-structures.html)

## Timeline

- **Week 1 (Feb 3-7):** Phase 1 - Foundation
- **Week 2 (Feb 10-14):** Phase 2 - Core Features
- **Week 3 (Feb 17-21):** Phase 3 - Advanced Features
- **Week 4 (Feb 24-28):** Phase 4 - Documentation & Polish
- **Week 5 (Mar 3-7):** Beta testing, feedback, refinements
- **Week 6 (Mar 10-14):** Release v0.2.0 with programmatic API

## Next Steps

1. Review and approve this proposal
2. Set up task tracker in `TASK_TRACKER.md`
3. Begin Phase 1 implementation
4. Create draft API documentation
5. Build proof-of-concept examples

---

**Approval Required:**
- [ ] Technical approach approved
- [ ] Timeline approved
- [ ] Resource allocation approved
- [ ] Ready to begin implementation
