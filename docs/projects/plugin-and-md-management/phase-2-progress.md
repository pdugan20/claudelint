# Phase 2 Progress Report

**Date**: 2026-02-03
**Phase**: 2.2 - Build Automated Comparison
**Status**: Complete (dual-schema verification system fully automated)

## What We're Building

A dual-schema verification system to detect when our Zod schemas drift from official Claude Code specifications.

### The Approach

```text
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
   - Source: <https://code.claude.com/docs/en/plugins-reference#plugin-manifest-schema>
   - Status: Zod matches official spec
   - Fields: 15 (all present)

2. **SkillFrontmatterSchema** [COMPLETE] (DRIFT FOUND & FIXED)
   - Manual reference: `schemas/skill-frontmatter.schema.json`
   - Source: <https://code.claude.com/docs/en/skills#frontmatter-reference>
   - Status: Fixed - was missing 4 fields
   - Fields: 14/14 present
   - **Drift**: Missing argument-hint, disable-model-invocation, user-invocable, hooks (FIXED)

3. **HooksConfigSchema** [COMPLETE] (DRIFT FOUND & FIXED)
   - Manual reference: `schemas/hooks-config.schema.json`
   - Source: <https://code.claude.com/docs/en/hooks>
   - Status: Fixed - was missing 2 fields
   - Fields: 9/9 present in HookSchema
   - **Drift**: Missing timeout, async fields (FIXED)

4. **MCPConfigSchema** [COMPLETE] (CRITICAL DRIFT FOUND & FIXED)
   - Manual reference: `schemas/mcp-config.schema.json`
   - Source: <https://code.claude.com/docs/en/mcp>
   - Status: Fixed - ENTIRE STRUCTURE WAS WRONG
   - **Drift**: Schema had completely incorrect nesting:
     - Had: `{ name, transport: { type, ... } }`
     - Should be: `{ type, command, url, ... }` (flat)
   - **Impact**: Required complete restructure + fixing 13 validation rules + updating all tests
   - **Severity**: CRITICAL - validators were checking against wrong structure

5. **LSPConfigSchema** [COMPLETE] (CRITICAL DRIFT FOUND & FIXED)
   - Manual reference: `schemas/lsp-config.schema.json`
   - Source: <https://code.claude.com/docs/en/plugins-reference#lsp-servers>
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
   - Source: <https://code.claude.com/docs/en/sub-agents#supported-frontmatter-fields>
   - Status: Fixed - missing 1 field + had 1 extra field
   - **Drift**:
     - Missing: permissionMode (enum with 5 values)
     - Extra: events field (doesn't exist in official spec)
   - **Impact**: Added permissionMode enum, deleted agent-events rule and tests
   - **Severity**: Minor - one missing optional field, one extra field that should not exist

7. **OutputStyleFrontmatterSchema** [COMPLETE] (MAJOR drift - FIXED)
   - Manual reference: `schemas/output-style-frontmatter.schema.json`
   - Source: <https://code.claude.com/docs/en/output-styles#frontmatter>
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
   - Source: <https://code.claude.com/docs/en/memory#path-specific-rules>
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

**AgentFrontmatterSchema** - Minor drift (FIXED):

| Issue                 | Impact                                          |
|:----------------------|:------------------------------------------------|
| Missing permissionMode| Missing enum field for permission control       |
| Extra events field    | Field doesn't exist in official spec            |
| Impact                | Added permissionMode, deleted agent-events rule |

**OutputStyleFrontmatterSchema** - MAJOR drift (FIXED):

| Issue                        | Impact                                                      |
|:-----------------------------|:------------------------------------------------------------|
| Wrong name validation        | Required + kebab-case (should be optional + any string)     |
| Wrong description validation | Required + min 10 chars (should be optional + any string)   |
| Missing field                | keep-coding-instructions (boolean) was missing              |
| Extra examples field         | Field doesn't exist in official spec                        |
| Impact                       | Deleted 4 invalid rules enforcing non-existent constraints  |

**RulesFrontmatterSchema** - NO DRIFT (Clean):

| Status | Notes                                                                  |
|:-------|:-----------------------------------------------------------------------|
| Clean  | Schema matches official spec perfectly, renamed for clarity            |

**Drift Rate**: 75% of schemas had drift (6/8). Only PluginManifestSchema and RulesFrontmatterSchema were clean.

**Severity Breakdown**:

- **Clean (0 issues)**: PluginManifestSchema, RulesFrontmatterSchema
- **Minor drift** (missing/extra optional fields): SkillFrontmatterSchema (4 fields), HooksConfigSchema (2 fields), AgentFrontmatterSchema (1 missing + 1 extra)
- **MAJOR drift** (wrong validations): OutputStyleFrontmatterSchema (4 invalid rules deleted)
- **CRITICAL drift** (wrong structure): MCPConfigSchema, LSPConfigSchema (both completely restructured)

### Additional Schema Improvements

**JSON Schema Draft 2020-12 Migration**:

- Migrated all 8 schemas from Draft-07 to Draft 2020-12 (current stable version)
- No breaking changes affected our simple schemas
- Future-proofs schemas for better tooling support

**Source URL Extraction**:

- Added custom `source` and `sourceType` properties to all 8 schemas
- Extracted documentation URLs from description fields
- Improves machine-readability and enables automated source tracking
- Example:

  ```json
  {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "description": "Schema for hooks.json files...",
    "source": "https://code.claude.com/docs/en/hooks",
    "sourceType": "documentation"
  }
  ```

**LSP Config Test Fixes**:

- Updated all LSP config tests to match corrected flat schema structure
- Removed `servers` wrapper (server names are now direct keys)
- Added required `extensionToLanguage` field to all test cases
- Removed tests for deprecated `configFile` field
- Added tests for 7 new optional LSP server fields
- All 139 test suites passing (771 tests)

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

## Phase 2.2 Results - Automated Drift Detection

### What We Built

Dual-schema verification system that automatically detects drift:

```text
Manual JSON Schemas (source of truth from docs)
         ↓
Zod Schemas (our implementation)
         ↓ generate (zod-to-json-schema)
Generated JSON Schemas
         ↓ compare
Comparison Tool → Report drift
         ↓
CI fails if drift detected
```

### Completed Tasks

#### Task 2.2.1: Install zod-to-json-schema

- Installed `zod-to-json-schema` package
- Created `scripts/generate/json-schemas.ts` (103 lines)
- Generates JSON Schemas from all 8 Zod schemas
- Extracts schemas from wrapper structure
- Forces Draft 2020-12 compatibility
- Added `npm run generate:json-schemas` script

#### Task 2.2.2: Build schema comparison tool

- Created `scripts/verify/compare-schemas.ts` (255 lines)
- Compares manual reference vs generated schemas
- Detects: missing fields, wrong types, enum mismatches, missing required fields
- Allows Zod to be stricter (extra validations OK)
- Rejects Zod being looser (missing required fields = ERROR)
- Added `npm run verify:schemas` script
- **Result**: All 8 schemas match! No drift detected!

#### Task 2.2.3: Update schema-sync script

- Completely rewrote `scripts/check/schema-sync.ts`
- 66% code reduction (185 lines vs 540 lines)
- Removed 452 lines of outdated Ajv/Zod comparison code
- Now orchestrates: generate → compare → report
- Shows Phase 2.1 drift history for all 8 schemas
- Clear, actionable error messages

#### Task 2.2.4: CI/CD integration

- CI job already configured correctly ✓
- Updated `.github/workflows/ci.yml` documentation
- Runs on every PR and push to main
- Fails CI if drift detected
- Included in `complete-validation` dependencies

### Scripts Created

| Script | Purpose | Lines |
|:-------|:--------|------:|
| `scripts/generate/json-schemas.ts` | Generate JSON Schemas from Zod | 103 |
| `scripts/verify/compare-schemas.ts` | Compare and detect drift | 255 |
| `scripts/check/schema-sync.ts` | Orchestrate full workflow | 185 |

### NPM Scripts Added

```bash
npm run generate:json-schemas  # Generate JSON Schemas from Zod
npm run verify:schemas          # Compare and detect drift
npm run check:schema-sync       # Full verification (runs in CI)
```

### Current Status

- [DONE] All 8 schemas match their manual references
- [DONE] Zero drift detected
- [DONE] CI runs verification on every PR
- [DONE] Automated system prevents future drift
- [DONE] 66% code reduction in schema-sync script

## Next Steps

### Phase 2.1 - COMPLETE

- [x] All 8 manual reference schemas created
- [x] All drift detected and fixed (6/8 schemas had issues)
- [x] Migrated to JSON Schema Draft 2020-12
- [x] Extracted source URLs to custom properties
- [x] Fixed all LSP config tests
- [x] All 771 tests passing

### Phase 2.2 - COMPLETE

- [x] Install zod-to-json-schema
- [x] Build schema comparison tool
- [x] Update schema-sync script
- [x] CI/CD integration
- [x] All 8 schemas verified with 0 drift

### Phase 2.3 - COMPLETE

**Verification Audit**: All Phase 2.3 tasks completed via Phase 2.1/2.2 work

- [x] Plugin manifest component verification
  - All 15 fields verified against official spec
  - Component paths (skills, agents, commands) verified
  - Config paths (hooks, mcpServers, lspServers) verified
  - No drift detected

- [x] Hook events verification
  - 13 hook events match official spec
  - HookEvents constant ≡ hooks-config.schema.json enum
  - hooks-invalid-event rule uses correct list
  - No drift detected

- [x] MCP config structure verification
  - Transport types verified (stdio, sse, http, websocket)
  - Flat structure verified (not nested)
  - Server names as object keys verified
  - No drift detected

- [x] Hybrid verification framework created
  - Manual extraction: Read docs → JSON Schema
  - Automated generation: Zod → JSON Schema
  - Automated comparison: Reference vs Generated
  - CI integration: Runs on every PR
  - **Dual-schema system IS the hybrid framework**

**See**: `phase-2-3-verification.md` for complete audit

### Phase 2.4 - Manual Verification Support (Next)

- [ ] Tool names manual verification
- [ ] Model names manual verification
- [ ] Manual verification tracker
- [ ] Manual verification playbook

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
