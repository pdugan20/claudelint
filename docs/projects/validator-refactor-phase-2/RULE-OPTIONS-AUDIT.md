# Rule Options Audit & Implementation Plan

## Overview

During Task 2.7.13 (rule documentation), we discovered that rule options were not consistently documented or implemented. This audit identifies all gaps and creates an action plan.

## Problem Statement

1. **Undocumented Options**: 4 rules have options in code but docs say "no options"
2. **Missing Options**: 4 useful options were identified but never implemented
3. **No Enforcement**: No automated check to prevent option/doc drift

## Part 1: Document Existing Undocumented Options

### 1. claude-md-size-error

**Status**: UNDOCUMENTED - Has option in code, docs say "no options"

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

**Status**: UNDOCUMENTED - Has option in code, docs say "no options"

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

**Status**: UNDOCUMENTED - Has option in code, docs say "no options"

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

**Status**: UNDOCUMENTED - Has option in code, docs say "no options" (and wrong default!)

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

**Status**: NEW - To be implemented

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

**Status**: NEW - To be implemented

**Rule**: `src/rules/plugin/commands-in-plugin-deprecated.ts`

**Current behavior**: Warns about deprecated commands field

**Proposed option**:

```typescript
schema: z.object({
  warnOnly: z.boolean().optional(),
}),
defaultOptions: {
  warnOnly: true,
}
```

**Use case**: Allow downgrading to warning for gradual migration

**Implementation tasks**:
1. Add schema and defaultOptions to rule meta
2. Update severity based on option
3. Add tests for warnOnly: true and false
4. Document in rule docs

---

### 7. mcp-invalid-env-var (pattern validation)

**Status**: NEW - To be implemented

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

**Status**: NEW - To be implemented

**Rule**: `src/rules/skills/skill-time-sensitive-content.ts`

**Current behavior**: Detects time-sensitive references (dates, versions)

**Proposed option**:

```typescript
schema: z.object({
  ageThreshold: z.number().positive().int().optional(),
}),
defaultOptions: {
  ageThreshold: 365, // Days before warning
}
```

**Use case**: Configure how old time references can be before warning

**Implementation tasks**:
1. Add schema and defaultOptions to rule meta
2. Parse dates and calculate age
3. Compare against threshold
4. Add tests for various thresholds
5. Document in rule docs

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

## Implementation Order

### Phase 1: Documentation Updates (Quick wins)

1. Document `claude-md-size-error.maxSize`
2. Document `claude-md-size-warning.maxSize`
3. Document `skill-body-too-long.maxLines`
4. Document `skill-deep-nesting.maxDepth` (fix incorrect default)

**Estimated time**: 30 minutes (all 4 rules)

### Phase 2: New Option Implementation

1. Implement `settings-permission-empty-pattern.allowEmpty`
2. Implement `commands-in-plugin-deprecated.warnOnly`
3. Implement `mcp-invalid-env-var.pattern`
4. Implement `skill-time-sensitive-content.ageThreshold`

**Estimated time**: 2-3 hours (implementation + tests + docs for all 4)

### Phase 3: Automated Validation

1. Create `scripts/check-rule-option-docs.ts`
2. Add to package.json scripts
3. Test on current codebase
4. Add to pre-push hook
5. Add to CI workflow

**Estimated time**: 1-2 hours

---

## Success Criteria

- [ ] All 4 existing options documented with schema, defaults, examples
- [ ] All 4 new options implemented with tests
- [ ] All 4 new options documented
- [ ] Automated check script created and tested
- [ ] Check integrated into pre-push hook
- [ ] Check integrated into CI workflow
- [ ] All checks passing on current codebase

---

## Notes

- Keep documentation format consistent with existing documented options
- Follow established patterns from `agent-body-too-short`, `lsp-server-name-too-short`
- Use Zod schema for validation
- Include example configurations in docs
- Add tests for both default and custom option values
