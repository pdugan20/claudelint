# Deadcode Cleanup - Next Steps

**Date**: 2026-01-30
**Status**: Knip analysis complete, ready for cleanup

## Quick Summary

Knip found **1 confirmed deadcode file** (rule-loader.ts) and **3 items needing investigation**.

Most findings (40/45) are **false positives** - intentional public API exports that Knip can't detect external usage for.

## Priority Actions

### * Priority 1: Remove Confirmed Deadcode (5 minutes)

**File**: `src/utils/rule-loader.ts` (206 lines)

**Confidence**: 100% - Not used anywhere, functionality replaced by RuleRegistry

**Action**:
```bash
# Remove the file
git rm src/utils/rule-loader.ts

# Run tests to confirm nothing breaks
npm test

# Commit
git commit -m "chore: remove obsolete RuleLoader (replaced by RuleRegistry)"
```

**Risk**: None

---

### * Priority 2: Investigate Remaining Items (30 minutes)

#### 2.1 Check setup-matchers.ts usage

```bash
# Check if used in Jest setup
grep -r "setup-matchers" jest.config.js tests/

# Check if file does anything
cat tests/helpers/setup-matchers.ts
```

**Expected outcome**:
- If not imported anywhere: Remove file
- If imported in Jest setup: Keep (false positive)

#### 2.2 Verify composition framework is active

```bash
# Check direct imports of composition modules
grep -r "from.*composition/" src/ | grep -v "composition/index" | wc -l
```

**Expected outcome**:
- If > 0 imports: Framework is active, exports are internal API (keep)
- If 0 imports: Framework is legacy code (investigate further)

#### 2.3 Check test helper usage

```bash
# Count usages in test files
grep -r "runValidator\|expectValidation" tests/**/*.test.ts | wc -l
```

**Expected outcome**:
- If > 0: False positive (Knip doesn't detect test usage well)
- If 0: Investigate why test helpers exist

---

### * Priority 3: Optimize Knip Config (15 minutes)

Update `knip.config.ts` to reduce false positives:

```typescript
import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  entry: [
    'src/index.ts',
    'src/cli.ts',
    'scripts/**/*.ts',
    'scripts/**/*.js',
  ],

  project: [
    'src/**/*.ts',
    'tests/**/*.ts',
  ],

  ignore: [
    'dist/**',
    'coverage/**',
    'examples/**',
    'packages/**',
    'docs/**',
    '**/*.test.ts',
  ],

  ignoreDependencies: [
    'zod-validation-error',
    '@commitlint/cli',
    'lint-staged',
  ],

  // NEW: Reduce false positives
  ignoreExportsUsedInFile: {
    interface: true,  // All interfaces are public API
    type: true,       // All types are public API
  },

  // NEW: Ignore test helper exports (Knip doesn't detect dynamic usage)
  ignore: [
    'dist/**',
    'coverage/**',
    'examples/**',
    'packages/**',
    'docs/**',
    '**/*.test.ts',
    'tests/helpers/**',  // <-- Add this line
  ],

  jest: {
    config: ['jest.config.js'],
  },
};

export default config;
```

**Test**:
```bash
# Re-run Knip with optimized config
npx knip

# Should see fewer false positives
```

---

### * Priority 4: Add to Package Scripts (5 minutes)

Make Knip easy to run:

```bash
# Add to package.json
npm pkg set scripts.check:deadcode="knip"
npm pkg set scripts.check:deadcode:production="knip --production"
```

**Usage**:
```bash
# Run full deadcode check
npm run check:deadcode

# Production dependencies only (for CI)
npm run check:deadcode:production
```

---

### * Priority 5: CI Integration (10 minutes)

Add deadcode check to CI workflow:

**Option A: Add to existing CI workflow**

Edit `.github/workflows/ci.yml`:

```yaml
# Add after existing lint/test jobs
- name: Check for deadcode
  run: npm run check:deadcode:production
  continue-on-error: true  # Don't fail CI (warning only for now)
```

**Option B: Separate workflow for weekly checks**

Create `.github/workflows/deadcode.yml`:

```yaml
name: Deadcode Check

on:
  schedule:
    - cron: '0 0 * * 0'  # Weekly on Sunday
  workflow_dispatch:     # Manual trigger

jobs:
  deadcode:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run check:deadcode
```

---

## Investigation Results Template

As you investigate, fill this in:

### setup-matchers.ts

**Found in**:
- [ ] Jest config
- [ ] Test setup files
- [ ] Not found anywhere

**Decision**:
- [ ] Keep (false positive)
- [ ] Remove (true deadcode)

**Action taken**:
```bash
# Command run and result
```

### Composition Framework

**Direct imports found**: ___ (count)

**Decision**:
- [ ] Active framework - keep exports (internal API)
- [ ] Legacy code - investigate further
- [ ] Mixed usage - review specific exports

**Action taken**:
```bash
# Command run and result
```

### Test Helpers

**Usage count**: ___ (number of test files using them)

**Decision**:
- [ ] Widely used - false positive
- [ ] Unused - investigate why they exist

**Action taken**:
```bash
# Command run and result
```

---

## Expected Timeline

| Task | Time | Who | Status |
|------|------|-----|--------|
| Remove rule-loader.ts | 5 min | - | [ ] Not started |
| Investigate setup-matchers | 10 min | - | [ ] Not started |
| Check composition framework | 10 min | - | [ ] Not started |
| Check test helpers | 10 min | - | [ ] Not started |
| Optimize Knip config | 15 min | - | [ ] Not started |
| Add package scripts | 5 min | - | [ ] Not started |
| CI integration | 10 min | - | [ ] Not started |
| **Total** | **65 min** | | |

---

## Success Criteria

- [x] Knip installed and configured
- [ ] rule-loader.ts removed
- [ ] False positives identified and documented
- [ ] Knip config optimized
- [ ] Added to package.json scripts
- [ ] CI integration (optional)
- [ ] Documentation updated

---

## Quick Commands Reference

```bash
# Remove confirmed deadcode
git rm src/utils/rule-loader.ts
npm test
git commit -m "chore: remove obsolete RuleLoader"

# Investigation commands
grep -r "setup-matchers" tests/ jest.config.js
grep -r "from.*composition/" src/ | grep -v "composition/index" | wc -l
grep -r "runValidator\|expectValidation" tests/**/*.test.ts | wc -l

# Add scripts
npm pkg set scripts.check:deadcode="knip"
npm pkg set scripts.check:deadcode:production="knip --production"

# Run Knip
npm run check:deadcode
```

---

## Notes

- Knip is now installed and configured [x]
- Most findings are false positives (public API types)
- Only 1 confirmed deadcode file found
- Codebase health is excellent
- This is a maintenance task, not urgent

---

## Questions?

- See [KNIP-FINDINGS.md](KNIP-FINDINGS.md) for detailed analysis
- See [TOOLS-AND-BEST-PRACTICES.md](TOOLS-AND-BEST-PRACTICES.md) for Knip documentation
- See [README.md](README.md) for project overview
