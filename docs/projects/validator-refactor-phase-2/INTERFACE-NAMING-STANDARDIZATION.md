# Rule Option Interface Naming Standardization

## Overview

All 17 rules with options currently use inconsistent interface naming patterns. This creates confusion and hurts maintainability.

## Problem Statement

### Current State

**Rules with Interfaces (8 total):**

1. **Generic "RuleOptions" pattern (4 files)** - Unclear which rule owns the interface:
   - `src/rules/lsp/lsp-server-name-too-short.ts`
   - `src/rules/agents/agent-body-too-short.ts`
   - `src/rules/output-styles/output-style-body-too-short.ts`
   - `src/rules/skills/skill-multi-script-missing-readme.ts`

2. **Partial rule name pattern (3 files)** - Missing namespace/prefix:
   - `src/rules/claude-md/claude-md-import-depth-exceeded.ts` → `ClaudeMdImportDepthOptions`
   - `src/rules/claude-md/claude-md-rules-circular-symlink.ts` → `CircularSymlinkOptions`
   - `src/rules/claude-md/claude-md-content-too-many-sections.ts` → `ContentTooManySectionsOptions`

3. **Full rule ID pattern (1 file)** - CORRECT:
   - `src/rules/claude-md/claude-md-size-error.ts` → `ClaudeMdSizeErrorOptions`

**Rules without Interfaces (9 total)** - Using inline type assertions:
- `src/rules/settings/settings-permission-empty-pattern.ts`
- `src/rules/mcp/mcp-invalid-env-var.ts`
- `src/rules/claude-md/claude-md-size-warning.ts`
- `src/rules/skills/skill-large-reference-no-toc.ts`
- `src/rules/skills/skill-missing-comments.ts`
- `src/rules/skills/skill-deep-nesting.ts`
- `src/rules/skills/skill-naming-inconsistent.ts`
- `src/rules/skills/skill-too-many-files.ts`
- `src/rules/skills/skill-body-too-long.ts`

### Issues

1. **Generic "RuleOptions" name collision** - Multiple rules define the same interface name
2. **Poor IDE support** - Can't distinguish between different rule options in autocomplete
3. **No type exports** - Users can't import option types for type-safe configuration
4. **Missing JSDoc** - No documentation on default values or parameter purposes
5. **Inconsistent patterns** - Mix of exported interfaces, private interfaces, and no interfaces

## Standard Pattern

### Naming Convention

All rules with options MUST:

1. **Export an interface** named `{RuleIdInPascalCase}Options`
2. **Include JSDoc comments** for each option with default value
3. **Use optional properties** (`?:`) for all options
4. **Place interface before rule export** for discoverability

### Pattern Template

```typescript
/**
 * Options for {rule-id} rule
 */
export interface {RuleIdInPascalCase}Options {
  /** {Description of option} (default: {value}) */
  {optionName}?: {type};
}

export const rule: Rule = {
  meta: {
    id: '{rule-id}',
    schema: z.object({
      {optionName}: z.{type}().optional(),
    }),
    defaultOptions: {
      {optionName}: {defaultValue},
    },
  },
  // ...
};
```

### Examples

**lsp-server-name-too-short:**

```typescript
/**
 * Options for lsp-server-name-too-short rule
 */
export interface LspServerNameTooShortOptions {
  /** Minimum server name length (default: 2) */
  minLength?: number;
}
```

**skill-deep-nesting:**

```typescript
/**
 * Options for skill-deep-nesting rule
 */
export interface SkillDeepNestingOptions {
  /** Maximum directory nesting depth (default: 3) */
  maxDepth?: number;
}
```

**settings-permission-empty-pattern:**

```typescript
/**
 * Options for settings-permission-empty-pattern rule
 */
export interface SettingsPermissionEmptyPatternOptions {
  /** Allow empty inline patterns (default: false) */
  allowEmpty?: boolean;
}
```

## Implementation Plan

### Phase 1: Rename Existing Interfaces

**Fix "RuleOptions" conflicts (4 files):**

1. `lsp-server-name-too-short.ts` → `LspServerNameTooShortOptions`
2. `agent-body-too-short.ts` → `AgentBodyTooShortOptions`
3. `output-style-body-too-short.ts` → `OutputStyleBodyTooShortOptions`
4. `skill-multi-script-missing-readme.ts` → `SkillMultiScriptMissingReadmeOptions`

**Fix partial names (3 files):**

5. `claude-md-import-depth-exceeded.ts` → `ClaudeMdImportDepthExceededOptions`
6. `claude-md-rules-circular-symlink.ts` → `ClaudeMdRulesCircularSymlinkOptions`
7. `claude-md-content-too-many-sections.ts` → `ClaudeMdContentTooManySectionsOptions`

**Already correct (1 file):**

8. `claude-md-size-error.ts` → `ClaudeMdSizeErrorOptions` ✓

### Phase 2: Add Missing Interfaces

**Add interfaces to 9 files without them:**

9. `settings-permission-empty-pattern.ts` → `SettingsPermissionEmptyPatternOptions`
10. `mcp-invalid-env-var.ts` → `McpInvalidEnvVarOptions`
11. `claude-md-size-warning.ts` → `ClaudeMdSizeWarningOptions`
12. `skill-large-reference-no-toc.ts` → `SkillLargeReferenceNoTocOptions`
13. `skill-missing-comments.ts` → `SkillMissingCommentsOptions`
14. `skill-deep-nesting.ts` → `SkillDeepNestingOptions`
15. `skill-naming-inconsistent.ts` → `SkillNamingInconsistentOptions`
16. `skill-too-many-files.ts` → `SkillTooManyFilesOptions`
17. `skill-body-too-long.ts` → `SkillBodyTooLongOptions`

### Phase 3: Add JSDoc Comments

Ensure all interfaces have JSDoc with default values:

```typescript
/** {Description} (default: {value}) */
```

### Phase 4: Create Enforcement Script

**Script: `scripts/check-rule-option-interfaces.ts`**

Validates:

1. Rules with `schema` MUST have an interface
2. Interface name MUST match `{RuleIdInPascalCase}Options` pattern
3. Interface MUST be exported
4. Interface MUST have JSDoc comment
5. Each option property MUST have JSDoc with default value
6. Interface properties MUST match schema properties

**Output format:**

```text
[FAIL] lsp-server-name-too-short
   Expected interface: LspServerNameTooShortOptions
   Found interface: RuleOptions
   Issue: Interface name does not match rule ID

[FAIL] skill-deep-nesting
   Expected interface: SkillDeepNestingOptions
   Found interface: none
   Issue: Missing interface definition

[WARN] claude-md-size-error
   Interface: ClaudeMdSizeErrorOptions ✓
   Missing JSDoc on property: maxSize
```

**Integration:**

- Add to `package.json` scripts: `"check:option-interfaces": "ts-node scripts/check-rule-option-interfaces.ts"`
- Add to `check:all` script
- Consider adding to pre-push hook

## Success Criteria

- [x] All 4 generic "RuleOptions" interfaces renamed to full rule IDs
- [x] All 3 partial name interfaces renamed to full rule IDs
- [x] All 9 missing interfaces added
- [x] All 17 interfaces have JSDoc comments with default values
- [x] All 17 interfaces are exported
- [x] Enforcement script created and passing
- [ ] Script integrated into check:all (optional - not requested)

## Benefits

1. **Type Safety** - Users can import and use option types
2. **Better IDE Support** - Clear autocomplete with documentation
3. **Searchability** - Can grep for rule ID to find interface
4. **Self-Documenting** - JSDoc explains options inline
5. **Consistency** - Single pattern across all rules
6. **Maintainability** - Easy to add new options following pattern
7. **No Name Collisions** - Each rule has unique interface name

## Completion Summary

**Status**: COMPLETE

All objectives achieved:

**Phase 1: Rename Existing Interfaces** - COMPLETE
- lsp-server-name-too-short: RuleOptions → LspServerNameTooShortOptions
- agent-body-too-short: RuleOptions → AgentBodyTooShortOptions
- output-style-body-too-short: RuleOptions → OutputStyleBodyTooShortOptions
- skill-multi-script-missing-readme: RuleOptions → SkillMultiScriptMissingReadmeOptions
- claude-md-import-depth-exceeded: ClaudeMdImportDepthOptions → ClaudeMdImportDepthExceededOptions
- claude-md-rules-circular-symlink: CircularSymlinkOptions → ClaudeMdRulesCircularSymlinkOptions
- claude-md-content-too-many-sections: ContentTooManySectionsOptions → ClaudeMdContentTooManySectionsOptions
- claude-md-size-error: ClaudeMdSizeErrorOptions (already correct)

**Phase 2: Add Missing Interfaces** - COMPLETE
- settings-permission-empty-pattern: Added SettingsPermissionEmptyPatternOptions
- mcp-invalid-env-var: Added McpInvalidEnvVarOptions
- claude-md-size-warning: Added ClaudeMdSizeWarningOptions
- skill-large-reference-no-toc: Added SkillLargeReferenceNoTocOptions
- skill-missing-comments: Added SkillMissingCommentsOptions
- skill-deep-nesting: Added SkillDeepNestingOptions
- skill-naming-inconsistent: Added SkillNamingInconsistentOptions
- skill-too-many-files: Added SkillTooManyFilesOptions
- skill-body-too-long: Added SkillBodyTooLongOptions

**Phase 3: Add JSDoc Comments** - COMPLETE
- All 17 interfaces have JSDoc comments
- All option properties have JSDoc with default values

**Phase 4: Create Enforcement Script** - COMPLETE
- Created `scripts/check-rule-option-interfaces.ts`
- Added to package.json as `check:rule-option-interfaces`
- Validates naming convention, exports, JSDoc, property matching
- Current status: PASSING (17/17 rules compliant)

**Validation Results**:
```
Total rules: 105
Rules with options: 17
Rules passing: 17
Rules with issues: 0

✓ All rule option interfaces follow naming standards!
```

**Optional Future Work**:
- Integrate into `check:all` script
- Add to pre-push hooks
- Add to CI workflow

---

## Notes

- Keep existing schema and defaultOptions unchanged
- Only add/rename TypeScript interfaces
- Ensure all interfaces are exported
- Follow PascalCase for interface names
- Use kebab-case to PascalCase conversion (e.g., `lsp-server-name` → `LspServerName`)
