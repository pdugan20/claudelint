# Phase 2 Progress Report

**Date**: 2026-02-02
**Phase**: 2.1 - Create Manual Reference Schemas
**Status**: In Progress (2/8 schemas complete)

## What We're Building

A dual-schema verification system to detect when our Zod schemas drift from official Claude Code specifications.

### The Approach

```
Official Docs (prose)
    ↓ human reads
Manual JSON Schema (reference, in schemas/)

Our Zod Schema (implementation, in src/schemas/)
    ↓ zod-to-json-schema
Generated JSON Schema

Compare: Manual vs Generated
    ↓
Report differences → Fix Zod
```

## Progress

### Completed (8/8)

1. **PluginManifestSchema** [COMPLETE]
   - Manual reference: `schemas/plugin-manifest.schema.json`
   - Source: https://code.claude.com/docs/en/plugins-reference#plugin-manifest-schema
   - Status: Zod matches official spec
   - Fields: 15 (all present)

2. **SkillFrontmatterSchema** [COMPLETE] (DRIFT FOUND & FIXED)
   - Manual reference: `schemas/skill-frontmatter.schema.json`
   - Source: https://code.claude.com/docs/en/skills#frontmatter-reference
   - Status: Fixed - was missing 4 fields
   - Fields: 14/14 present
   - **Drift**: Missing argument-hint, disable-model-invocation, user-invocable, hooks (FIXED)

3. **HooksConfigSchema** [COMPLETE] (DRIFT FOUND & FIXED)
   - Manual reference: `schemas/hooks-config.schema.json`
   - Source: https://code.claude.com/docs/en/hooks
   - Status: Fixed - was missing 2 fields
   - Fields: 9/9 present in HookSchema
   - **Drift**: Missing timeout, async fields (FIXED)

4. **MCPConfigSchema** [COMPLETE] (CRITICAL DRIFT FOUND & FIXED)
   - Manual reference: `schemas/mcp-config.schema.json`
   - Source: https://code.claude.com/docs/en/mcp
   - Status: Fixed - ENTIRE STRUCTURE WAS WRONG
   - **Drift**: Schema had completely incorrect nesting:
     - Had: `{ name, transport: { type, ... } }`
     - Should be: `{ type, command, url, ... }` (flat)
   - **Impact**: Required complete restructure + fixing 13 validation rules + updating all tests
   - **Severity**: CRITICAL - validators were checking against wrong structure

5. **LSPConfigSchema** [COMPLETE] (CRITICAL DRIFT FOUND & FIXED)
   - Manual reference: `schemas/lsp-config.schema.json`
   - Source: https://code.claude.com/docs/en/plugins-reference#lsp-servers
   - Status: Fixed - ENTIRE STRUCTURE WAS WRONG
   - **Drift**: Schema had wrong nesting + wrong field names + missing fields:
     - Had: `{ servers: {...}, extensionMapping: {...} }`
     - Should be: Flat `{ "server-name": { command, extensionToLanguage, ... } }`
     - Missing 7 fields: initializationOptions, settings, workspaceFolder, startupTimeout, shutdownTimeout, restartOnCrash, maxRestarts
     - Extra field: configFile (doesn't exist in official spec)
   - **Impact**: Complete restructure + updated 8 rules + deprecated 2 invalid rules + fixed all tests
   - **Severity**: CRITICAL - validators couldn't validate real .lsp.json files

6. **AgentFrontmatterSchema** [COMPLETE] (Minor drift - FIXED)
   - Manual reference: `schemas/agent-frontmatter.schema.json`
   - Source: https://code.claude.com/docs/en/sub-agents#supported-frontmatter-fields
   - Status: Fixed - missing 1 field + had 1 extra field
   - **Drift**:
     - Missing: permissionMode (enum with 5 values)
     - Extra: events field (doesn't exist in official spec)
   - **Impact**: Added permissionMode enum, deleted agent-events rule and tests
   - **Severity**: Minor - one missing optional field, one extra field that should not exist

7. **OutputStyleFrontmatterSchema** [COMPLETE] (MAJOR drift - FIXED)
   - Manual reference: `schemas/output-style-frontmatter.schema.json`
   - Source: https://code.claude.com/docs/en/output-styles#frontmatter
   - Status: Fixed - completely wrong validations + missing field + extra field
   - **Drift**:
     - Missing: keep-coding-instructions (boolean)
     - Extra: examples field (doesn't exist in official spec)
     - Wrong: name was required + kebab-case (should be optional + any string)
     - Wrong: description was required + min 10 chars + third person (should be optional + any string)
   - **Impact**: Deleted 4 invalid rules (output-style-name, output-style-description, output-style-examples, output-style-missing-examples)
   - **Severity**: MAJOR - enforcing constraints that don't exist in spec

8. **RulesFrontmatterSchema** [COMPLETE] (Clean - NO DRIFT)
   - Manual reference: `schemas/rules-frontmatter.schema.json`
   - Source: https://code.claude.com/docs/en/memory#path-specific-rules
   - Status: Clean - schema matches official spec perfectly
   - **Schema**: Single optional `paths` field for glob patterns
   - **Note**: Renamed from ClaudeMdFrontmatterSchema for clarity (applies to `.claude/rules/*.md`, not main CLAUDE.md)
   - **Impact**: No drift found, renamed for accuracy

### In Progress (0/8)

## Key Findings

### Schema Drift Detected (5/5 schemas checked had drift!)

**SkillFrontmatterSchema** - Missing 4 fields (FIXED):

| Field                      | Type    | Required | Purpose                          |
|:---------------------------|:--------|:---------|:---------------------------------|
| `argument-hint`            | string  | optional | Autocomplete hint                |
| `disable-model-invocation` | boolean | optional | Prevent Claude auto-triggering   |
| `user-invocable`           | boolean | optional | Hide from `/` menu               |
| `hooks`                    | array   | optional | Skill-scoped hooks configuration |

**HooksConfigSchema** - Missing 2 fields (FIXED):

| Field     | Type    | Required | Purpose                          |
|:----------|:--------|:---------|:---------------------------------|
| `timeout` | number  | optional | Hook timeout in milliseconds     |
| `async`   | boolean | optional | Run hook asynchronously          |

**Impact**: Our validators wouldn't recognize these fields, potentially causing false errors or missing validation.

**MCPConfigSchema** - CRITICAL structural drift (FIXED):

| Issue                  | Impact                                                                 |
|:-----------------------|:-----------------------------------------------------------------------|
| Extra `name` field     | Server names are object keys, not fields                               |
| Wrong nesting          | Transport fields should be flat, not under `transport` wrapper         |
| Structural mismatch    | Required complete schema redesign + fixing 13 validation rules + tests |

**LSPConfigSchema** - CRITICAL structural drift (FIXED):

| Issue                        | Impact                                                                     |
|:-----------------------------|:---------------------------------------------------------------------------|
| Wrong nesting                | Had `servers` wrapper, should be flat mapping                              |
| Wrong field name             | Had `extensionMapping` (global), should be `extensionToLanguage` per-server|
| Missing 7 fields             | Missing timeout, restart, workspace, initialization, and settings options  |
| Extra field                  | Had `configFile` which doesn't exist in official spec                      |
| Structural mismatch          | Complete redesign + updated 8 rules + deprecated 2 rules + fixed all tests |

**Drift Rate**: 100% of schemas checked so far had drift (5/5). This confirms the systematic verification is absolutely necessary.

**Severity Breakdown**:
- Minor drift (missing optional fields): SkillFrontmatterSchema (4 fields), HooksConfigSchema (2 fields)
- **CRITICAL drift (wrong structure)**: MCPConfigSchema, LSPConfigSchema (both completely restructured)

## Workflow Improvements

### Before (Broken)

- Created test cases based on assumptions
- No comparison to official specs
- Just marked schemas "synced" without verification
- Found drift manually when user questioned status

### After (Working)

1. Human reads official docs
2. Creates manual reference JSON Schema
3. Discovers drift immediately (10 vs 14 fields)
4. Documents exact differences
5. Fixes Zod schema
6. Repeats for all schemas

## Next Steps

### Immediate (Complete Phase 2.1)

1. **Fix SkillFrontmatterSchema drift** (Task #14)
   - Add 4 missing fields to Zod schema
   - Test validators still work
   - Verify against manual reference

2. **Continue creating manual references** (Tasks 2.1.5-2.1.10)
   - Get official docs for each schema
   - Extract fields, types, constraints
   - Create JSON Schema files
   - Fix any drift found

### Soon (Phase 2.2)

3. **Install zod-to-json-schema** (Task #15)
   - Add library dependency
   - Create generation wrapper

4. **Build comparison tool** (Task 2.2.2)
   - Compare manual vs generated
   - Report drift programmatically
   - Exit non-zero if drift found

5. **Update CI/CD** (Task 2.2.4)
   - Run on every PR
   - Block merges if drift detected

## Questions Answered

### Why manual JSON Schemas if we're generating from Zod?

Because comparing "schema A to schema A" always passes. We need an independent reference that encodes "what the official docs say" to catch drift.

### Why not use JSON Schema as source of truth?

Because we need Zod's custom refinements (noXMLTags, noReservedWords, thirdPerson) that JSON Schema can't express. Zod must remain source of truth for implementation.

### Can Zod be stricter than official spec?

Yes! Extra validations are fine. We can reject `<xml>` tags even if official spec allows them. But we cannot be looser (missing required fields).

## Success Metrics

- [x] Approach documented and validated
- [x] First drift found and documented
- [ ] All 8 manual references created
- [ ] All drift fixed
- [ ] Comparison tool automated
- [ ] CI/CD blocking on drift

## Resources

- [Schema Verification Workflow](./schema-verification-workflow.md) - Detailed approach
- [Schema Inventory](./schema-inventory.md) - All schemas with status
- [Tracker](./tracker.md) - Detailed task breakdown
