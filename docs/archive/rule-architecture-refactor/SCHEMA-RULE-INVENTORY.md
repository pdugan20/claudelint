# Schema-Based Rule Inventory

**Date**: 2026-01-28
**Phase**: 5.0.1 - Inventory Complete
**Total**: 22 schema-based rule files needed

## Overview

Schema validations using `validateFrontmatterWithSchema()` generate rule IDs dynamically with unsafe type casting (`as RuleId`). We need to create rule files for these to make them type-safe and user-configurable.

## How Schema Rule IDs Are Generated

```typescript
// In schema-helpers.ts
const ruleId = (ruleIdPrefix ? `${ruleIdPrefix}-${path}` : path) as RuleId;
// Example: prefix='skill', path=['name'] → ruleId='skill-name'
```

## Validators Using validateFrontmatterWithSchema

Only 4 validators create phantom rule IDs:
1. SkillsValidator - prefix: 'skill'
2. AgentsValidator - prefix: 'agent'
3. ClaudeMdValidator - prefix: 'claude-md'
4. OutputStylesValidator - prefix: 'output-style'

**Note**: Settings, MCP, Hooks, and Plugin validators use `JSONConfigValidator` which does NOT generate rule IDs - they report errors without IDs. No action needed for those.

---

## Skills (10 rules)

**Schema**: `SkillFrontmatterWithRefinements`
**Prefix**: `skill`
**Validator**: `SkillsValidator.validateFrontmatter()`

| Field | Validations | Rule ID | Description |
|-------|-------------|---------|-------------|
| `name` | required, lowercaseHyphens, max(64), noXMLTags, noReservedWords | `skill-name` | Skill name must be lowercase-with-hyphens, under 64 chars, no XML/reserved words |
| `description` | required, string, min(10), noXMLTags, thirdPerson | `skill-description` | Description must be 10+ chars, no XML, written in third person |
| `version` | optional, semver | `skill-version` | Version must follow semantic versioning if provided |
| `model` | optional, enum('sonnet'\|'opus'\|'haiku'\|'inherit') | `skill-model` | Model must be valid model name |
| `context` | optional, enum('fork'\|'inline'\|'auto') | `skill-context` | Context mode must be valid value |
| `agent` | optional, string, required if context='fork' | `skill-agent` | Agent name required when context is 'fork' |
| `allowed-tools` | optional, array, mutex with disallowed-tools | `skill-allowed-tools` | Must be array of strings, can't use with disallowed-tools |
| `disallowed-tools` | optional, array | `skill-disallowed-tools` | Must be array of strings |
| `tags` | optional, array | `skill-tags` | Must be array of strings |
| `dependencies` | optional, array | `skill-dependencies` | Must be array of strings |

---

## Agents (8 rules)

**Schema**: `AgentFrontmatterWithRefinements`
**Prefix**: `agent`
**Validator**: `AgentsValidator.validateFrontmatter()`

| Field | Validations | Rule ID | Description |
|-------|-------------|---------|-------------|
| `name` | required, lowercaseHyphens, max(64), noXMLTags | `agent-name` | Agent name must be lowercase-with-hyphens, under 64 chars, no XML |
| `description` | required, string, min(10), noXMLTags, thirdPerson | `agent-description` | Description must be 10+ chars, no XML, written in third person |
| `model` | optional, enum | `agent-model` | Model must be valid model name |
| `tools` | optional, array, mutex with disallowed-tools | `agent-tools` | Must be array of strings, can't use with disallowed-tools |
| `disallowed-tools` | optional, array | `agent-disallowed-tools` | Must be array of strings |
| `skills` | optional, array | `agent-skills` | Must be array of strings |
| `events` | optional, array, max 3 items | `agent-events` | Must be array of strings with max 3 items |
| `hooks` | optional, array of HookSchema | `agent-hooks` | Must be array of valid hook objects |

**Note**: These schema rules are DIFFERENT from the existing custom logic rules:
- `agent-skills` (schema) validates type → `agent-skills-not-found` (logic) validates file existence
- `agent-hooks` (schema) validates type → `agent-hooks-invalid-schema` (logic) validates hook business rules

---

## Claude MD (1 rule)

**Schema**: `ClaudeMdFrontmatterSchema`
**Prefix**: `claude-md`
**Validator**: `ClaudeMdValidator.validateFrontmatter()`

| Field | Validations | Rule ID | Description |
|-------|-------------|---------|-------------|
| `paths` | optional, array, min 1 item, each string min 1 char | `claude-md-paths` | If provided, must be array with at least one non-empty path pattern |

---

## Output Styles (3 rules)

**Schema**: `OutputStyleFrontmatterSchema`
**Prefix**: `output-style`
**Validator**: `OutputStylesValidator.validateFrontmatter()`

| Field | Validations | Rule ID | Description |
|-------|-------------|---------|-------------|
| `name` | required, lowercaseHyphens, max(64), noXMLTags | `output-style-name` | Style name must be lowercase-with-hyphens, under 64 chars, no XML |
| `description` | required, string, min(10), noXMLTags, thirdPerson | `output-style-description` | Description must be 10+ chars, no XML, written in third person |
| `examples` | optional, array | `output-style-examples` | Must be array of strings if provided |

---

## Summary by Category

| Validator | Rule Count | Prefix | Schema |
|-----------|------------|--------|--------|
| Skills | 10 | `skill` | SkillFrontmatterWithRefinements |
| Agents | 8 | `agent` | AgentFrontmatterWithRefinements |
| Claude MD | 1 | `claude-md` | ClaudeMdFrontmatterSchema |
| Output Styles | 3 | `output-style` | OutputStyleFrontmatterSchema |
| **Total** | **22** | | |

---

## Implementation Notes

### Rule File Structure

All schema-based rules follow this template:

```typescript
/**
 * Rule: skill-name
 *
 * Validates that skill frontmatter name field follows required format.
 *
 * This validation is implemented in SkillFrontmatterSchema which validates
 * the name field using lowercaseHyphens() refinement, max(64) length check,
 * noXMLTags() refinement, and noReservedWords() refinement.
 */

import { Rule } from '../../types/rule';

export const rule: Rule = {
  meta: {
    id: 'skill-name',
    name: 'Skill Name Format',
    description: 'Skill name must be lowercase-with-hyphens, under 64 characters, with no XML tags or reserved words',
    category: 'Skills',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/skills/skill-name.md',
  },
  validate: () => {
    // No-op: Validation implemented in SkillFrontmatterSchema
    // Schema validates name using lowercaseHyphens(), max(64), noXMLTags(), noReservedWords()
  },
};
```

### Key Points

1. **No custom validation logic** - Schema rules just register metadata
2. **Actual validation happens in Zod schema** - The schema does the work
3. **No-op validate() function** - Just documents where validation lives
4. **Full metadata required** - id, name, description, category, severity, etc.
5. **Clear documentation** - Comments explain which schema/refinement does validation

### Next Steps

1. Create generation script that produces these 22 files
2. Run script to generate all files
3. Remove `as RuleId` casting from schema-helpers.ts
4. Regenerate types (should have 66 rule IDs: 44 logic + 22 schema)
5. Update RULE-TRACKER.md to reflect new totals

---

## Cleanup Tasks (Phase 5.0 Final Step)

After creating schema rule files, clean up:

1. **Remove unsafe type casting**
   - File: `src/utils/schema-helpers.ts`
   - Change: Remove `as RuleId` from line 20
   - Result: TypeScript will validate rule IDs exist

2. **No other dead code**
   - Schema validation logic stays in schemas (it's not dead code)
   - validateFrontmatterWithSchema() stays (needed for frontmatter extraction)
   - All existing code remains functional

