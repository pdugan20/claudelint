# Programmatic API - Quick Reference

**Version:** 0.2.0 (Draft)
**Last Updated:** 2026-01-30

## Project At a Glance

- **Status:**  Proposed
- **Timeline:** 6 weeks (Feb 3 - Mar 14, 2026)
- **Tasks:** 54 across 4 phases
- **Target:** v0.2.0 release
- **API Design:** Clean public API (follows ESLint/Prettier patterns)

## Key Links

| Document | Purpose | Lines |
|----------|---------|-------|
| [README.md](./README.md) | Project overview | 280 |
| [PROPOSAL.md](./PROPOSAL.md) | Complete proposal | 300 |
| [TASK_TRACKER.md](./TASK_TRACKER.md) | 54 discrete tasks | 431 |
| [API_DESIGN.md](./API_DESIGN.md) | API specification | 947 |
| [TESTING_STRATEGY.md](./TESTING_STRATEGY.md) | Testing plan | 592 |
| [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) | User migration | 625 |
| [EXAMPLES.md](./EXAMPLES.md) | 18 code examples | 765 |

**Total Documentation:** 3,940 lines

## API Quick Reference

### Class-Based API

```typescript
import { ClaudeLint } from 'claude-code-lint';

// Create instance
const linter = new ClaudeLint({
  fix: true,
  cache: true,
  cacheLocation: '.claude-code-lint-cache',
  onProgress: (file, idx, total) => { }
});

// Core methods
await linter.lintFiles(['**/*.md'])
await linter.lintText(code, { filePath: 'test.md' })
await linter.calculateConfigForFile(path)
linter.isPathIgnored(path)
await linter.loadFormatter('stylish')
linter.getRules()

// Static methods
await ClaudeLint.outputFixes(results)
ClaudeLint.getFixedContent(results)
ClaudeLint.getErrorResults(results)
await ClaudeLint.findConfigFile(cwd)
ClaudeLint.getVersion()
```

### Functional API

```typescript
import { lint, lintText, resolveConfig, formatResults } from 'claude-code-lint';

await lint(['**/*.md'], { fix: true })
await lintText(code, { filePath: 'test.md' })
await resolveConfig(filePath)
await formatResults(results, 'json')
```

## Type Reference

```typescript
interface LintResult {
  filePath: string;
  messages: LintMessage[];
  errorCount: number;
  warningCount: number;
  fixableErrorCount: number;
  fixableWarningCount: number;
  source?: string;
  output?: string;
}

interface LintMessage {
  ruleId: string | null;
  severity: 'error' | 'warning';
  message: string;
  line?: number;
  column?: number;
  fix?: FixInfo;
  suggestions?: SuggestionInfo[];
}
```

## Phase Overview

### Phase 1: Foundation (Week 1)

- **Tasks:** 12
- **Focus:** Core class structure, type definitions, basic lintFiles()
- **Key Deliverables:**
  - `src/api/claude-code-lint.ts`
  - `src/api/types.ts`
  - `src/api/result-builder.ts`

### Phase 2: Core Features (Week 2)

- **Tasks:** 15
- **Focus:** lintText(), config methods, formatter system
- **Key Deliverables:**
  - Configuration methods
  - Formatter system
  - Result utilities

### Phase 3: Advanced Features (Week 3)

- **Tasks:** 13
- **Focus:** Auto-fix, progress callbacks, functional API
- **Key Deliverables:**
  - Auto-fix support
  - Progress callbacks
  - Functional wrappers

### Phase 4: Documentation & Polish (Week 4)

- **Tasks:** 14
- **Focus:** Documentation, examples, testing, release prep
- **Key Deliverables:**
  - API documentation
  - Usage examples
  - Migration guide

## Task Status Legend

- PAUSED Not Started
- IN_PROGRESS In Progress
- [x] Complete
- SKIPPED Skipped
- BLOCKED Blocked

## Decision Summary

### Architecture: Hybrid Approach

**Class-Based (Primary):**

- For complex workflows
- State management (config, cache)
- Multiple operations on instance
- ESLint-like familiarity

**Functional (Secondary):**

- For simple operations
- Stateless utilities
- Tree-shakeable
- Modern patterns

### Why Not Pure Functional?

- Bundle size irrelevant (Node.js only)
- Complex state needed (cache, config)
- ESLint ecosystem alignment
- Existing class-based validators

### Why Not Pure Class-Based?

- Modern trends favor functional
- Simple operations shouldn't need instances
- Better for tree-shaking utilities
- Flexibility for users

## Success Metrics

- [x] Research complete (ESLint, Prettier, best practices)
- [x] Proposal approved
- [x] Documentation complete (3,940 lines)
- [ ] >90% test coverage
- [ ] All existing tests pass
- [ ] Performance within 5% of CLI
- [ ] Clean public API (follows ESLint/Prettier patterns)
- [ ] TypeScript types tested
- [ ] 3+ real-world examples
- [ ] API documentation published

## Implementation Checklist

### Before Starting

- [ ] Review [PROPOSAL.md](./PROPOSAL.md)
- [ ] Review [API_DESIGN.md](./API_DESIGN.md)
- [ ] Approve technical approach
- [ ] Approve timeline

### Phase 1 (Week 1)

- [ ] Create `src/api/` directory
- [ ] Implement type definitions
- [ ] Implement ClaudeLint class skeleton
- [ ] Implement basic lintFiles()
- [ ] Write unit tests
- [ ] Update exports

### Phase 2 (Week 2)

- [ ] Implement lintText()
- [ ] Implement config methods
- [ ] Implement formatter system
- [ ] Implement result utilities
- [ ] Update CLI to use new API
- [ ] Write integration tests

### Phase 3 (Week 3)

- [ ] Implement auto-fix
- [ ] Implement progress callbacks
- [ ] Implement functional API
- [ ] Add additional methods
- [ ] Write type tests

### Phase 4 (Week 4)

- [ ] Write API documentation
- [ ] Create usage examples
- [ ] Create migration guide
- [ ] Achieve >90% coverage
- [ ] Run performance benchmarks
- [ ] Update README
- [ ] Prepare release

## Common Commands

### Development

```bash
# Run API tests
npm test -- tests/api/

# Watch mode
npm test -- --watch tests/api/

# Coverage
npm test -- --coverage tests/api/

# Type check
npm run type-check

# Build
npm run build
```

### Testing

```bash
# Unit tests
npm test -- tests/api/

# Integration tests
npm test -- tests/integration/api/

# Type tests
npm run test:types

# Regression tests
npm test -- tests/regression/

# Performance tests
npm test -- tests/performance/
```

## File Structure

```
src/
├── api/
│   ├── claude-code-lint.ts       # Main ClaudeLint class
│   ├── types.ts            # Type definitions
│   ├── functions.ts        # Functional API
│   ├── formatter.ts        # Formatter interface
│   ├── result-builder.ts   # Result conversion
│   ├── message-builder.ts  # Message conversion
│   └── formatters/         # Built-in formatters
│       ├── stylish.ts
│       ├── json.ts
│       └── compact.ts
├── validators/             # Existing (unchanged)
├── utils/                  # Existing (unchanged)
└── index.ts                # Main exports (updated)

tests/
├── api/                    # Unit tests
├── integration/api/        # Integration tests
├── types/                  # Type tests
├── regression/             # Regression tests
└── performance/            # Performance tests

docs/
└── projects/programmatic-api/
    ├── README.md
    ├── PROPOSAL.md
    ├── TASK_TRACKER.md
    ├── API_DESIGN.md
    ├── TESTING_STRATEGY.md
    ├── MIGRATION_GUIDE.md
    ├── EXAMPLES.md
    └── QUICK_REFERENCE.md  # This file

examples/
├── basic-usage.js
├── auto-fix.js
├── custom-formatter.js
├── build-integration.js
└── editor-extension.js
```

## Resources

### Research Sources

- [ESLint Node.js API](https://eslint.org/docs/latest/integrate/nodejs-api)
- [Prettier API](https://prettier.io/docs/api)
- [Node.js Best Practices 2026](https://medium.com/@backendbyeli/node-js-best-practices-2026-what-every-backend-developer-must-know-144873cfc534)
- [Modern API Design](https://www.xano.com/blog/modern-api-design-best-practices/)
- [TypeScript Library Structures](https://www.typescriptlang.org/docs/handbook/declaration-files/library-structures.html)

### Similar Projects

- [ESLint](https://github.com/eslint/eslint)
- [Prettier](https://github.com/prettier/prettier)
- [markdownlint](https://github.com/DavidAnson/markdownlint)

## Contact & Support

- **Project Owner:** @pdugan20
- **Status Updates:** [TASK_TRACKER.md](./TASK_TRACKER.md)
- **Questions:** GitHub Issues
- **Discussions:** GitHub Discussions

---

**Ready to start?** Begin with [Phase 1 Tasks](./TASK_TRACKER.md#phase-1-foundation-week-1)
