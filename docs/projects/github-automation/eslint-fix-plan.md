# TypeScript-ESLint Type Safety Fix Plan

**Created:** 2026-02-01
**Total Errors:** 168
**Estimated Time:** 2-3 hours

## Executive Summary

TypeScript-ESLint v8 exposed 168 type safety violations across 41 files. Analysis reveals these are NOT random issues but follow clear patterns that can be fixed systematically.

## Error Breakdown by Type

| Rule | Count | Severity | Difficulty |
|------|-------|----------|------------|
| `no-unsafe-member-access` | 48 | High | Medium |
| `no-unsafe-assignment` | 46 | High | Medium |
| `no-unsafe-argument` | 18 | High | Medium |
| `no-unused-vars` | 13 | Low | Easy |
| `no-unsafe-call` | 10 | High | Medium |
| `no-require-imports` | 8 | Medium | Easy |
| `restrict-template-expressions` | 6 | Low | Easy |
| `no-explicit-any` | 5 | Medium | Medium |
| `no-case-declarations` | 3 | Low | Easy |
| `no-base-to-string` | 3 | Medium | Easy |
| `require-await` | 2 | Low | Easy |
| `no-unsafe-return` | 2 | High | Medium |
| Other | 4 | Varies | Easy |

## Error Breakdown by Location

| Category | Errors | Files | Avg/File |
|----------|--------|-------|----------|
| `src/api/` | 44 | 2 | 22.0 |
| `src/rules/` | 97 | 30 | 3.2 |
| `src/cli/` | 14 | 4 | 3.5 |
| `src/utils/` | 13 | 3 | 4.3 |

### Hotspot Files (10+ errors)

1. **src/api/claudelint.ts** - 34 errors (dynamic formatter loading)
2. **src/api/formatter.ts** - 9 errors (formatter resolution)
3. **src/rules/settings/settings-file-path-not-found.ts** - 9 errors
4. **src/rules/lsp/*.ts** - 8 files × 5-8 errors each (pattern: unsafe context.data access)

## Root Cause Analysis

### Pattern 1: Unsafe `context.data` Access (60% of errors)

**Problem:** Rules access `context.data` which is typed as `any`

```typescript
// Current (unsafe)
const server = context.data.mcpServers?.[serverName];  // any type
if (server.command) { ... }  // unsafe member access

// Root cause: RuleContext.data is `any`
```

**Files Affected:** Most rule files in `src/rules/mcp/`, `src/rules/lsp/`, `src/rules/plugin/`

**Impact:** 97 errors across 30 files

### Pattern 2: Dynamic `require()` for Formatters (12 errors)

**Problem:** Formatters loaded via `require()` at runtime

```typescript
// src/api/claudelint.ts
const formatter = require(formatterPath);  // no type safety
formatter.format(results);  // unsafe call
```

**Files Affected:**

- `src/api/claudelint.ts` (8 locations)
- `src/utils/rules/loader.ts` (1 location)
- `src/utils/workspace/detector.ts` (1 location)

**Impact:** 8 errors, but cascading effects cause 26 total errors

### Pattern 3: Unused Error Variables (13 errors)

**Problem:** Catch blocks with unused error variables

```typescript
try {
  // ...
} catch (error) {  // defined but never used
  // ignore
}
```

**Files Affected:** 7 files

**Impact:** 13 errors (simple fix)

### Pattern 4: Template Literal Type Safety (9 errors)

**Problem:** Template literals with potentially undefined/object values

```typescript
const name = frontmatter.name;  // type is {}
`Expected ${name}`;  // unsafe toString()
```

**Files Affected:**

- `src/rules/skills/skill-name-directory-mismatch.ts`
- `src/rules/output-styles/output-style-name-directory-mismatch.ts`
- Various agent rules

**Impact:** 9 errors

## Strategic Fix Plan

### Phase 1: Quick Wins (30 min, 20 errors)

**Goal:** Fix low-hanging fruit that don't require type system changes

**Tasks:**

1. **Fix unused error variables** (13 errors)
   - Replace `catch (error)` with `catch` or `catch (_error)`
   - Files: 7 files in `src/rules/skills/`, `src/utils/`
   - **Difficulty:** 1/5 (trivial)

2. **Fix template literal issues** (6 errors)
   - Add `String()` wrapper or null checks
   - Files: 3 files
   - **Difficulty:** 1/5 (trivial)

3. **Fix misc easy errors** (3 case-declarations, 1 prefer-const, 1 console)
   - **Difficulty:** 1/5 (trivial)

**Testing:** `npm run lint` should drop from 168 → 148 errors

### Phase 2: Dynamic Imports (45 min, 34 errors)

**Goal:** Replace `require()` with proper ES6 dynamic imports and add types

**Tasks:**

1. **Create formatter type definitions** (new file)

   ```typescript
   // src/types/formatters.ts
   export interface Formatter {
     format(results: LintResult[]): string;
   }
   ```

2. **Update src/api/claudelint.ts** (8 require calls, 26 total errors)
   - Replace `require()` with `await import()`
   - Add proper type guards
   - Make methods async where needed
   - **Difficulty:** 3/5 (requires refactoring)

3. **Update src/utils/rules/loader.ts** (1 require)
   - **Difficulty:** 2/5

4. **Update src/utils/workspace/detector.ts** (1 require, 6 errors)
   - **Difficulty:** 2/5

**Testing:** `npm run lint` should drop from 148 → ~114 errors

### Phase 3: Rule Context Type Safety (60 min, 97 errors)

**Goal:** Add proper typing for `context.data` in rules

**Option A: Type Guards (Conservative - RECOMMENDED)**

Keep `context.data` as `any` but add type guards in each rule:

```typescript
// src/rules/mcp/mcp-http-empty-url.ts
export default {
  check(context: RuleContext) {
    // Add type guard
    const servers = context.data?.mcpServers;
    if (!servers || typeof servers !== 'object') return;

    const server = servers[serverName];
    if (!server || typeof server !== 'object') return;

    // Now can safely access
    const transport = server.transport;
    // ...
  }
};
```

**Pros:**

- No breaking changes to RuleContext interface
- Each rule validates its own data assumptions
- Incremental fixes possible
- Catches runtime data issues

**Cons:**

- More boilerplate per rule
- Repetitive

**Estimated effort:** ~97 errors across 30 files, but pattern is identical

- Create helper functions for common checks
- Apply pattern systematically
- **Difficulty:** 3/5 (repetitive but straightforward)

**Option B: Typed Context Data (Aggressive - NOT RECOMMENDED YET)**

Create specific context data types:

```typescript
interface MCPRuleContext extends RuleContext {
  data: {
    mcpServers?: Record<string, MCPServer>;
  };
}
```

**Pros:**

- Better type safety
- Less runtime checking needed

**Cons:**

- Requires changing RuleContext interface
- Breaking change to rule API
- All rules need updating at once
- Higher risk

**Recommendation:** Use Option A for this fix session

**Testing:** `npm run lint` should drop from ~114 → ~17 errors

### Phase 4: Remaining Type Safety (30 min, 17 errors)

**Goal:** Fix remaining scattered errors

**Tasks:**

1. **src/api/formatter.ts** (9 errors after Phase 2 fixes)
   - Add proper type assertions
   - Type guard for formatter resolution

2. **src/utils/formats/json.ts** (2 errors)
   - Replace explicit `any` with `unknown`

3. **Remaining edge cases** (6 errors)
   - Case-by-case fixes

**Difficulty:** 2/5

**Testing:** `npm run lint` should pass with 0 errors

## Implementation Order

### Step 1: Create Support Infrastructure

Before fixing anything, create helper utilities:

```typescript
// src/utils/type-guards.ts (NEW FILE)
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function hasProperty<K extends string>(
  obj: unknown,
  key: K
): obj is Record<K, unknown> {
  return isObject(obj) && key in obj;
}

// Helper for rule context data
export function getMCPServers(data: unknown): Record<string, unknown> | null {
  if (!hasProperty(data, 'mcpServers')) return null;
  if (!isObject(data.mcpServers)) return null;
  return data.mcpServers;
}

// Similar helpers for LSP, Plugin, etc.
```

### Step 2: Execute Phases in Order

1. **Day 1, Session 1** - Phase 1 (Quick Wins)
2. **Day 1, Session 2** - Phase 2 (Dynamic Imports)
3. **Day 2, Session 1** - Phase 3 Part 1 (MCP rules - 10 files)
4. **Day 2, Session 2** - Phase 3 Part 2 (LSP rules - 10 files)
5. **Day 2, Session 3** - Phase 3 Part 3 (Plugin + remaining rules)
6. **Day 2, Session 4** - Phase 4 (Cleanup)

### Step 3: Test After Each Phase

After each phase:

```bash
npm run lint              # Check error count
npm test                  # Ensure no regressions
npm run build             # Verify TypeScript compilation
git commit -m "fix: ..."  # Commit the phase
```

## Risk Assessment

### Low Risk (Phases 1, 4)

- Simple mechanical changes
- No behavior changes
- Easy to verify

### Medium Risk (Phase 2)

- Requires async/await changes
- Dynamic imports behavior slightly different
- Need careful testing of formatter loading

### Medium-High Risk (Phase 3)

- Adding runtime type checks
- Could expose hidden bugs (GOOD!)
- Need comprehensive testing

## Success Criteria

- [ ] All 168 lint errors resolved
- [ ] `npm run lint` passes with 0 errors
- [ ] `npm test` passes (777+ tests)
- [ ] `npm run build` successful
- [ ] No behavioral changes (existing tests pass)
- [ ] Type safety improved throughout codebase
- [ ] Pre-commit hook passes

## Rollback Plan

If any phase causes issues:

1. **Each phase is a separate commit** - easy to revert
2. **Tests validate behavior** - catch regressions immediately
3. **Can pause between phases** - don't have to do all at once

## Future Improvements

After this fix:

1. **Add stricter ESLint rules** - Re-enable rules we temporarily disabled
2. **Create proper type definitions** - MCPServer, LSPServer, etc.
3. **Refactor RuleContext** - Make context.data properly typed
4. **Add runtime validation** - Use Zod schemas for context.data
5. **Migrate to ESLint flat config** - Remove compatibility layer

## Time Estimate

| Phase | Time | Errors Fixed | Risk |
|-------|------|--------------|------|
| Phase 1 | 30 min | 20 | Low |
| Phase 2 | 45 min | 34 | Medium |
| Phase 3 | 90 min | 97 | Med-High |
| Phase 4 | 30 min | 17 | Low |
| **Total** | **3.25 hours** | **168** | - |

## Recommendation

**Proceed with phased approach:**

- Do Phase 1 immediately (quick confidence builder)
- Phase 2 in same session if time permits
- Phases 3-4 can be done in follow-up session(s)

This systematic approach:

- Minimizes risk (small commits)
- Shows progress (error count drops steadily)
- Builds momentum (easy wins first)
- Improves actual type safety (not just silencing errors)
