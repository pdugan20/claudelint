# Programmatic API Project

**Status:**  Proposed
**Start Date:** 2026-01-30
**Target Completion:** 2026-03-14
**Owner:** @pdugan20

## Overview

This project adds a comprehensive programmatic API to claudelint, enabling developers to integrate linting capabilities directly into their applications, build tools, and automation workflows.

## Project Documents

### Core Documentation

1. **[PROPOSAL.md](./PROPOSAL.md)** - Full project proposal
   - Executive summary
   - Problem statement and goals
   - Technical decisions and rationale
   - Architecture overview
   - Success metrics and timeline

2. **[TASK_TRACKER.md](./TASK_TRACKER.md)** - Centralized task tracking
   - 54 discrete tasks across 4 phases
   - Progress tracking (PAUSED / IN_PROGRESS / [x])
   - Phase completion status
   - Task dependencies

3. **[API_DESIGN.md](./API_DESIGN.md)** - Detailed API specification
   - Complete API reference
   - Type definitions
   - Usage examples
   - Result formats
   - Error handling

4. **[TESTING_STRATEGY.md](./TESTING_STRATEGY.md)** - Testing plan
   - Test coverage requirements (>90%)
   - Testing layers (unit, integration, type, regression)
   - Performance benchmarks
   - Test fixtures

5. **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)** - User migration guide
   - Migration scenarios
   - Before/after examples
   - Common patterns
   - Troubleshooting

## Quick Links

### For Implementers

- [Phase 1 Tasks](./TASK_TRACKER.md#phase-1-foundation-week-1) - Foundation (12 tasks)
- [Phase 2 Tasks](./TASK_TRACKER.md#phase-2-core-features-week-2) - Core Features (15 tasks)
- [Phase 3 Tasks](./TASK_TRACKER.md#phase-3-advanced-features-week-3) - Advanced Features (13 tasks)
- [Phase 4 Tasks](./TASK_TRACKER.md#phase-4-documentation--polish-week-4) - Documentation & Polish (14 tasks)

### For Reviewers

- [Technical Approach](./PROPOSAL.md#decision-hybrid-class-based--functional-api)
- [API Surface](./API_DESIGN.md#main-claudelint-class)
- [Type Definitions](./API_DESIGN.md#type-definitions)
- [Examples](./API_DESIGN.md#examples)

### For Users

- [Migration Guide](./MIGRATION_GUIDE.md)
- [Quick Start](./API_DESIGN.md#overview)
- [Common Patterns](./MIGRATION_GUIDE.md#common-patterns)

## Key Decisions

### Architecture: Hybrid Class-Based + Functional

After researching ESLint, Prettier, Zod, Valibot, and modern API design trends, we chose:

- **Primary API:** Class-based (`ClaudeLint`) - for complex workflows
- **Secondary API:** Functional utilities - for simple operations
- **Rationale:** Bundle size irrelevant (Node.js only), state management needed, ESLint familiarity

See [PROPOSAL.md - Decision](./PROPOSAL.md#decision-hybrid-class-based--functional-api) for full rationale.

### Public API Design

Following ESLint/Prettier patterns, only stable public APIs are exported.

```typescript
// Main programmatic API
import { ClaudeLint } from 'claudelint';

// Type definitions and utilities
import { loadFormatter, findConfigFile } from 'claudelint';
import type { LintResult, LintMessage } from 'claudelint';
```

Internal validators are NOT exported - use the ClaudeLint class instead.

## Timeline

| Phase | Dates | Tasks | Focus |
|-------|-------|-------|-------|
| **Phase 1** | Feb 3-7 | 12 | Foundation - Core class structure |
| **Phase 2** | Feb 10-14 | 15 | Core Features - Essential methods |
| **Phase 3** | Feb 17-21 | 13 | Advanced Features - Auto-fix, callbacks |
| **Phase 4** | Feb 24-28 | 14 | Documentation & Polish |
| **Beta** | Mar 3-7 | - | Testing, feedback, refinements |
| **Release** | Mar 10-14 | - | Release v0.2.0 |

## Progress Tracking

**Overall Progress:** 0/54 tasks (0%)

- Phase 1: 0/12 (0%)
- Phase 2: 0/15 (0%)
- Phase 3: 0/13 (0%)
- Phase 4: 0/14 (0%)

See [TASK_TRACKER.md](./TASK_TRACKER.md) for detailed task status.

## Success Metrics

- [x] >90% test coverage for new API
- [x] All existing tests pass (no regressions)
- [x] Comprehensive API documentation
- [x] At least 3 real-world usage examples
- [x] TypeScript types fully tested
- [x] Performance within 5% of CLI
- [x] Clean public API (follows ESLint/Prettier patterns)

## Getting Started (After Approval)

1. **Review proposal** - Read [PROPOSAL.md](./PROPOSAL.md)
2. **Approve approach** - Confirm technical decisions
3. **Start Phase 1** - Begin foundation tasks
4. **Update tracker** - Mark tasks as complete in [TASK_TRACKER.md](./TASK_TRACKER.md)

## Development Workflow

### Starting a Task

1. Open [TASK_TRACKER.md](./TASK_TRACKER.md)
2. Find next uncompleted task
3. Change status from PAUSED to IN_PROGRESS
4. Implement the task
5. Write tests
6. Update documentation

### Completing a Task

1. Mark task as [x] in tracker
2. Add completion date
3. Add PR number (if applicable)
4. Update phase progress percentage

### Example Task Completion

```markdown
- [x] [x] **Task 1.1.1:** Create src/api/types.ts with core interfaces
  - Completed: 2026-02-03
  - PR: #123
  - Notes: Added LintResult, LintMessage, ClaudeLintOptions
```

## API Preview

### Class-Based API

```typescript
import { ClaudeLint } from 'claudelint';

const linter = new ClaudeLint({
  fix: true,
  cache: true,
  onProgress: (file, idx, total) => {
    console.log(`[${idx}/${total}] ${file}`);
  }
});

const results = await linter.lintFiles(['**/*.md']);
const formatter = await linter.loadFormatter('stylish');
console.log(formatter.format(results));
```

### Functional API

```typescript
import { lint, formatResults } from 'claudelint';

const results = await lint(['**/*.md'], { fix: true });
const output = await formatResults(results, 'json');
console.log(output);
```

See [API_DESIGN.md](./API_DESIGN.md) for complete API reference.

## Testing

### Run Tests

```bash
# All API tests
npm test -- tests/api/

# Specific phase
npm test -- tests/api/claudelint.test.ts

# With coverage
npm test -- --coverage tests/api/

# Type tests
npm run test:types
```

See [TESTING_STRATEGY.md](./TESTING_STRATEGY.md) for full testing plan.

## Questions & Discussion

### Open Questions

- Should we support streaming results for very large projects?
- Do we need a plugin system for custom validators?
- Should the API support running specific validators only?
- Do we need a `--watch` mode API?

### Discussion

Please comment on:

- Technical approach
- API naming/design
- Migration concerns
- Testing strategy

## Related Projects

### Similar Implementations

- [ESLint Node.js API](https://eslint.org/docs/latest/integrate/nodejs-api)
- [Prettier Programmatic API](https://prettier.io/docs/api)
- [Markdownlint API](https://github.com/DavidAnson/markdownlint)

### Inspiration

- [Node.js Best Practices 2026](https://medium.com/@backendbyeli/node-js-best-practices-2026-what-every-backend-developer-must-know-144873cfc534)
- [Modern API Design](https://www.xano.com/blog/modern-api-design-best-practices/)
- [TypeScript Library Structures](https://www.typescriptlang.org/docs/handbook/declaration-files/library-structures.html)

## Contributing

### For This Project

1. Pick a task from [TASK_TRACKER.md](./TASK_TRACKER.md)
2. Implement following [API_DESIGN.md](./API_DESIGN.md)
3. Write tests per [TESTING_STRATEGY.md](./TESTING_STRATEGY.md)
4. Update documentation
5. Mark task complete

### Code Style

- Follow existing TypeScript conventions
- Add JSDoc comments to all public APIs
- Write descriptive test names
- Keep methods focused and single-purpose

## Approval Checklist

Before starting implementation:

- [ ] Technical approach reviewed and approved
- [ ] API design reviewed and approved
- [ ] Timeline and resource allocation confirmed
- [ ] Testing strategy approved
- [ ] Success metrics agreed upon
- [ ] Ready to begin Phase 1

## Contact

- **Project Owner:** @pdugan20
- **Questions:** Open an issue or discussion
- **Status Updates:** Check [TASK_TRACKER.md](./TASK_TRACKER.md)

---

**Last Updated:** 2026-01-30
**Next Review:** Start of Phase 1 (2026-02-03)
