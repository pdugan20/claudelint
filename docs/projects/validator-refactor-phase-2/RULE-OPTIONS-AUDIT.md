# Rule Options Audit & Implementation Plan

## Overview

During Task 2.7.13 (rule documentation), we discovered that rule options were not consistently documented or implemented. This audit identifies all gaps and creates an action plan.

## Problem Statement

1. **Undocumented Options**: 4 rules have options in code but docs say "no options"
2. **Missing Options**: 4 useful options were identified but never implemented
3. **No Enforcement**: No automated check to prevent option/doc drift

## Part 1: Document Existing Undocumented Options

### 1. claude-md-size-error

**Status**: COMPLETE - Option documented

**Implementation**: `src/rules/claude-md/claude-md-size-error.ts`

```typescript
schema: z.object({
  maxSize: z.number().positive().int().optional(),
}),
defaultOptions: {
  maxSize: 40000, // 40KB
}
```

**Documentation**: `docs/rules/claude-md/claude-md-size-error.md`

Currently says: "This rule does not have configuration options."

**Action**: Add Options section with:
- `maxSize` parameter (number, default: 40000 bytes = 40KB)
- Schema documentation
- Example configuration in claudelint.config.json

---

### 2. claude-md-size-warning

**Status**: COMPLETE - Option documented

**Implementation**: `src/rules/claude-md/claude-md-size-warning.ts`

```typescript
const DEFAULT_MAX_SIZE = 35000;

schema: z.object({
  maxSize: z.number().positive().int().optional(),
}),
defaultOptions: {
  maxSize: DEFAULT_MAX_SIZE,
}
```

**Documentation**: `docs/rules/claude-md/claude-md-size-warning.md`

Currently says: "This rule does not have configuration options."

**Action**: Add Options section with:
- `maxSize` parameter (number, default: 35000 bytes = 35KB)
- Schema documentation
- Example configuration

---

### 3. skill-body-too-long

**Status**: COMPLETE - Option documented

**Implementation**: `src/rules/skills/skill-body-too-long.ts`

```typescript
schema: z.object({
  maxLines: z.number().positive().int().optional(),
}),
defaultOptions: {
  maxLines: 500,
}
```

**Documentation**: `docs/rules/skills/skill-body-too-long.md`

Currently says: "This rule does not have any configuration options."

**Action**: Add Options section with:
- `maxLines` parameter (number, default: 500)
- Schema documentation
- Example configuration

---

### 4. skill-deep-nesting

**Status**: COMPLETE - Option documented (corrected default from 4 to 3)

**Implementation**: `src/rules/skills/skill-deep-nesting.ts`

```typescript
const DEFAULT_MAX_DEPTH = 3;

schema: z.object({
  maxDepth: z.number().positive().int().optional(),
}),
defaultOptions: {
  maxDepth: DEFAULT_MAX_DEPTH,
}
```

**Documentation**: `docs/rules/skills/skill-deep-nesting.md`

Currently says: "This rule does not have configuration options. The maximum depth of 4 levels is fixed."

**ERROR**: Docs say 4, code uses 3!

**Action**: Add Options section with:
- `maxDepth` parameter (number, default: 3)
- Correct the depth value throughout the document
- Schema documentation
- Example configuration

---

## Part 2: Implement New Options

### 5. settings-permission-empty-pattern.allowEmpty

**Status**: COMPLETE - Implemented, tested, and documented

**Rule**: `src/rules/settings/settings-permission-empty-pattern.ts`

**Current behavior**: Errors on empty pattern strings

**Proposed option**:

```typescript
schema: z.object({
  allowEmpty: z.boolean().optional(),
}),
defaultOptions: {
  allowEmpty: false,
}
```

**Use case**: Some projects may want to allow empty patterns as placeholders

**Implementation tasks**:
1. Add schema and defaultOptions to rule meta
2. Update validate function to check option
3. Add tests for allowEmpty: true and false
4. Document in rule docs

---

### 6. commands-in-plugin-deprecated.warnOnly

**Status**: SKIPPED - Rule is already 'warn' severity

**Issue**: This rule already has severity: 'warn'. The proposed warnOnly option doesn't make sense since there's nothing to downgrade from. The rule is already non-blocking.

**Alternative**: Could add an option to suppress the warning entirely, but that's just disabling the rule which users can already do via config.

**Recommendation**: Skip this option as it provides no value.

---

### 7. mcp-invalid-env-var (pattern validation)

**Status**: COMPLETE - Implemented, tested, and documented

**Rule**: `src/rules/mcp/mcp-invalid-env-var.ts`

**Current behavior**: Validates ${VAR} syntax

**Proposed option**:

```typescript
schema: z.object({
  pattern: z.string().optional(),
}),
defaultOptions: {
  pattern: '^[A-Z_][A-Z0-9_]*$', // Standard env var naming
}
```

**Use case**: Enforce custom naming conventions (e.g., PROJECT_PREFIX_*)

**Implementation tasks**:
1. Add schema and defaultOptions to rule meta
2. Validate env var names against regex pattern
3. Add tests for default pattern and custom patterns
4. Document in rule docs with examples

---

### 8. skill-time-sensitive-content.ageThreshold

**Status**: SKIPPED - Implementation too complex for benefit

**Issue**: The rule currently detects time-sensitive *language* (patterns like "today", "last month", "January 15, 2024") but doesn't parse or calculate date ages. Implementing ageThreshold would require:
1. Parsing various date formats from text
2. Determining "current date" context (file modification time? execution time?)
3. Complex date calculation logic
4. Ambiguity for relative terms like "last month"

**Complexity**: High - requires date parsing library, timezone handling, and significant new logic.

**Value**: Low - users can already disable the rule entirely. Adding threshold adds minimal value vs current "warn on any time-sensitive content" behavior.

**Recommendation**: Skip this option. The rule works well as-is for detecting potentially outdated content.

---

## Part 3: Automated Validation

### Create: scripts/check-rule-option-docs.ts

**Purpose**: Detect mismatches between rule options in code vs documentation

**Algorithm**:

1. **Parse rule implementations** (`src/rules/**/*.ts`):
   - Extract `schema` and `defaultOptions` from each rule
   - Build map of `ruleId -> { options: [...], defaults: {...} }`

2. **Parse rule documentation** (`docs/rules/**/*.md`):
   - Extract Options section content
   - Parse documented option names and defaults
   - Build map of `ruleId -> { documentedOptions: [...] }`

3. **Compare and report**:
   - Rules with options in code but not documented
   - Rules with documented options not in code
   - Rules where default values don't match
   - Rules where "no options" statement conflicts with code

4. **Output format**:

```text
[FAIL] claude-md-size-error
   Has option in code: maxSize (default: 40000)
   Documentation says: "no options"

[FAIL] skill-body-too-long
   Has option in code: maxLines (default: 500)
   Documentation says: "no options"

[PASS] agent-body-too-short
   Code matches documentation: minLength (default: 50)
```

**Integration**:
- Add to `package.json` scripts: `"check:option-docs": "ts-node scripts/check-rule-option-docs.ts"`
- Add to pre-push hook (`.git/hooks/pre-push`)
- Add to CI workflow (`.github/workflows/validate.yml`)

---

## Part 4: Standardize Resource Links

### Problem

Found inconsistent formatting in Resources sections across documentation:
- **Standard format** (105 files): `[Rule Implementation]` and `[Rule Tests]`
- **Non-standard format** (5 files): `[Implementation]` and `[Tests]`

### Offending Files

1. `docs/rules/settings/settings-invalid-schema.md`
2. `docs/rules/settings/settings-invalid-env-var.md`
3. `docs/rules/settings/settings-invalid-permission.md`
4. `docs/rules/skills/skill-dangerous-command.md`
5. `docs/rules/skills/skill-eval-usage.md`

### Standard Format

```markdown
## Resources

- [Rule Implementation](../../src/rules/category/rule-name.ts)
- [Rule Tests](../../tests/rules/category/rule-name.test.ts)
```

### Tasks

1. **Fix 5 files** to use "Rule Implementation" and "Rule Tests"
2. **Update audit script** (`scripts/audit-rule-docs.ts`) to check Resource link format
3. **Update TEMPLATE.md** to clearly specify the standard format

### Enforcement

Add validation to `scripts/audit-rule-docs.ts`:
- Check that Resources section contains `[Rule Implementation]`
- Check that Resources section contains `[Rule Tests]`
- Report files using non-standard formats (`[Implementation]` or `[Tests]`)

---

## Implementation Order

### Phase 1: Documentation Updates (Quick wins) - COMPLETE

1. ✓ Document `claude-md-size-error.maxSize` (default: 40000 bytes)
2. ✓ Document `claude-md-size-warning.maxSize` (default: 35000 bytes)
3. ✓ Document `skill-body-too-long.maxLines` (default: 500 lines)
4. ✓ Document `skill-deep-nesting.maxDepth` (default: 3, corrected from 4)

**Status**: All 4 options documented with schema, defaults, and examples

### Phase 2: New Option Implementation - COMPLETE

1. ✓ Implement `settings-permission-empty-pattern.allowEmpty` (COMPLETE)
2. ✗ Implement `commands-in-plugin-deprecated.warnOnly` (SKIPPED - rule already 'warn')
3. ✓ Implement `mcp-invalid-env-var.pattern` (COMPLETE)
4. ✗ Implement `skill-time-sensitive-content.ageThreshold` (SKIPPED - too complex, low value)

**Status**: 2 of 4 implemented, 2 skipped with justification
**Result**: All viable options have been implemented

### Phase 3: Automated Validation

1. Create `scripts/check-rule-option-docs.ts`
2. Add to package.json scripts
3. Test on current codebase
4. Add to pre-push hook
5. Add to CI workflow

**Estimated time**: 1-2 hours

### Phase 4: Standardize Resource Links - COMPLETE

1. ✓ Fix 5 files to use "Rule Implementation" / "Rule Tests" format
2. ✓ Update `scripts/audit-rule-docs.ts` to enforce standard format
3. ✓ Update `docs/rules/TEMPLATE.md` with clear formatting requirements
4. ✓ Verify all files pass new validation

**Status**: COMPLETE - All files standardized and enforcement added

---

## Success Criteria

- [x] All 4 existing options documented with schema, defaults, examples (Phase 1 COMPLETE)
- [x] All viable new options implemented with tests (Phase 2 COMPLETE - 2 of 4, 2 skipped)
- [x] All viable new options documented (Phase 2 COMPLETE)
- [ ] Automated option check script created and tested (Phase 3)
- [ ] Check integrated into pre-push hook (Phase 3)
- [ ] Check integrated into CI workflow (Phase 3)
- [x] All 5 files standardized to "Rule Implementation" / "Rule Tests" format (Phase 4)
- [x] Audit script enforces Resource link format (Phase 4)
- [ ] All checks passing on current codebase

---

## Notes

- Keep documentation format consistent with existing documented options
- Follow established patterns from `agent-body-too-short`, `lsp-server-name-too-short`
- Use Zod schema for validation
- Include example configurations in docs
- Add tests for both default and custom option values
