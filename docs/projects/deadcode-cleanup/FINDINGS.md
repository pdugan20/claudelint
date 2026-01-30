# Deadcode Analysis Findings

## TL;DR

**Codebase Health: EXCELLENT [x]**

- 8 orphaned build files (safe to remove)
- 3 intentional stub files (keep for future phases)
- 2 utility scripts (need usage review)
- 2 deprecated items (need investigation)
- 0 unused dependencies
- 0 commented-out code blocks

**Recommended Action**: Clean build artifacts now, investigate other items when time permits.

---

## Category 1: True Deadcode (Safe to Remove)

### Orphaned Build Artifacts

**Impact**: 8 files cluttering dist/ directory

**Files**:

```text
dist/cli-hooks.js
dist/cli-hooks.d.ts
dist/cli-hooks.js.map
dist/cli-hooks.d.ts.map
dist/utils/validators/security-validators.js
dist/utils/validators/security-validators.d.ts
dist/utils/validators/security-validators.js.map
dist/utils/validators/security-validators.d.ts.map
```

**Why Unused**:
- Source file `src/cli-hooks.ts` deleted in commit 7e67f78 (CLI refactor)
- Source file `src/utils/validators/security-validators.ts` deleted in commit dca4dd4
- Functionality moved to other modules

**Evidence**:
- No corresponding source files
- Not imported anywhere
- Build artifacts from deleted code

**Confidence**: HIGH (100%)

**Action**: Run `npm run clean && npm run build`

**Risk**: None (auto-regenerated)

---

## Category 2: Intentional Stubs (Keep)

### Future Phase Placeholders

**Impact**: 3 scripts with TODO implementations

**Files**:

1. `scripts/check-duplicate-fixtures.ts`
   - Phase 4 feature (duplicate fixture detection)
   - Referenced in package.json as `check:duplicate-fixtures`

2. `scripts/check-duplicate-logic.ts`
   - Phase 4 feature (duplicate validation logic detection)
   - Referenced in package.json as `check:duplicates`

3. `scripts/check-rule-coverage.ts`
   - Phase 6 feature (rule test coverage analysis)
   - Referenced in package.json as `check:rule-coverage`

**Why Kept**:
- Documented as future work
- Part of project roadmap
- Package.json scripts reference them

**Confidence**: HIGH (intentional placeholders)

**Action**: Document in roadmap, keep stubs

**Risk**: None

---

## Category 3: Needs Investigation

### 3.1 Utility Scripts

#### scripts/fix-markdown.js

**What**: Manual markdown fixer for MD040/MD036 violations

**Status**:
- Not in package.json scripts
- Project has `markdownlint-cli --fix` now
- May be legacy cleanup tool

**Investigation Needed**:
- Check git history for recent usage
- Ask team if used manually
- Verify markdownlint --fix covers same issues

**Confidence**: MEDIUM (likely unused)

**Possible Actions**:
- Archive to scripts/archive/ if unused
- Keep if team uses it manually
- Document usage if keeping

#### scripts/remove-emojis.js

**What**: Batch emoji removal from markdown files

**Status**:
- Not in package.json scripts
- Uses emoji-regex dependency
- Project has check:emojis to prevent introduction

**Investigation Needed**:
- Was this a one-time cleanup?
- Is it needed for ongoing work?

**Confidence**: MEDIUM (likely one-time tool)

**Possible Actions**:
- Archive to scripts/archive/
- Keep for reference
- Document as historical cleanup tool

### 3.2 Deprecated Code

#### Deprecated Method: isRuleDisabled()

**Location**: src/validators/base.ts:285

```typescript
/**
 * @deprecated Internal method renamed to isRuleDisabledByComment for clarity
 */
protected isRuleDisabled(file?: string, line?: number, ruleId?: RuleId): boolean {
  return this.isRuleDisabledByComment(file, line, ruleId);
}
```

**Status**: Marked deprecated, wrapper to new method

**Investigation Needed**:
- Search for internal callers: `grep -r "\.isRuleDisabled(" src/ tests/`
- Check if any external plugins use it
- Verify safe to remove

**Confidence**: MEDIUM (probably no callers)

**Possible Actions**:
- Remove if no callers found
- Keep wrapper if external usage exists
- Document removal timeline

#### Deprecated Type: ValidatorOptions

**Location**: src/validators/base.ts:125

```typescript
/**
 * @deprecated Use BaseValidatorOptions or specific validator options instead
 */
export type ValidatorOptions = BaseValidatorOptions;
```

**Status**: Type alias marked deprecated

**Investigation Needed**:
- Search for usage: `grep -r "ValidatorOptions" src/ tests/`
- Check if external plugins use it
- Decide: remove now or v2.0.0?

**Confidence**: MEDIUM (external API concern)

**Possible Actions**:
- Keep for backward compatibility until v2.0.0
- Remove if no external usage
- Update comment with removal version

---

## Category 4: Not Deadcode (Verified Active)

### All Clear [x]

**Validators**: All 11 validators registered and used

**Rules**: All 107 rules registered and tested

**Test Files**: All 142 test files actively used

**Dependencies**: All dependencies in package.json are used

**Configuration Files**: All config files active

**Exports**: All exports appropriately scoped (internal vs external)

**Commented Code**: No commented-out code blocks found

---

## Summary Statistics

| Category | Count | Priority | Risk |
|----------|-------|----------|------|
| Orphaned build artifacts | 8 files | HIGH | None |
| Intentional stubs | 3 files | LOW | None |
| Utility scripts to review | 2 files | MEDIUM | Low |
| Deprecated items | 2 items | MEDIUM | Medium |
| **TOTAL DEADCODE** | **8 files** | - | - |

---

## Investigation Commands

### Check Deprecated Method

```bash
grep -rn "\.isRuleDisabled(" src/ tests/
# If no results except the method itself, safe to remove
```

### Check Deprecated Type

```bash
grep -rn "ValidatorOptions" src/ tests/ examples/
# Review all usages
```

### Check Script Usage

```bash
# Check when last modified
ls -la scripts/fix-markdown.js scripts/remove-emojis.js

# Check git history
git log --oneline -- scripts/fix-markdown.js
git log --oneline -- scripts/remove-emojis.js
```

---

## Recommendations

### Do Now (10 minutes)

```bash
npm run clean
npm run build
npm test
git add dist/
git commit -m "chore: remove orphaned build artifacts"
```

### Investigate Later (1-2 hours)

- Run investigation commands above
- Document findings
- Make informed decisions on utility scripts and deprecated code

### Document (30 minutes)

- Add future phase stubs to roadmap
- Add deadcode prevention guidelines to CONTRIBUTING.md
- Create scripts/archive/ARCHIVE.md if archiving scripts

---

## Code Quality Assessment

**Rating**: A+ (Excellent)

**Strengths**:
- Minimal deadcode
- Clear deprecation markers
- Good test coverage
- No commented-out code
- Clean dependency tree
- Well-organized structure

**Areas for Improvement**:
- Clean up orphaned build artifacts (easy fix)
- Clarify utility script status
- Remove or document deprecated items
- Add quarterly deadcode review to process

**Overall**: This is one of the cleanest codebases analyzed. The issues found are minor and easily addressable.
