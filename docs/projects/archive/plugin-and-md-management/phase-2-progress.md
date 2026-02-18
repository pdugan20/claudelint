# Phase 2 Progress Report

**Date**: 2026-02-03
**Phase**: 2.6 - Rule Deprecation System
**Status**: Phase Complete (All 6 tasks complete)

## What We're Building

An ESLint-style rule deprecation system to gracefully phase out old rules while guiding users to modern replacements.

### The Approach

```text
Rule Metadata
    ↓
deprecated: boolean | DeprecationInfo {
    reason: string
    replacedBy?: RuleId | RuleId[]
    deprecatedSince?: string
    removeInVersion?: string | null
    url?: string
}
    ↓
Validation Pipeline (FileValidator)
    ↓ track deprecated rules
ValidationResult { deprecatedRulesUsed }
    ↓
Reporter / Formatters
    ↓ display warnings
User sees deprecation info + migration guidance
```

## Progress

### Phase 2.6: Rule Deprecation System

#### Task 2.6.1: Research ✓

- Studied ESLint's deprecation format evolution
- Analyzed Prettier's deprecation lifecycle
- Documented best practices in `docs/architecture/rule-deprecation.md`

#### Task 2.6.2: Design ✓

- Designed backward-compatible deprecation metadata
- Created DeprecationInfo interface with rich metadata support
- Planned helper functions and migration tooling

#### Task 2.6.3: Implement Deprecation Metadata ✓

- Updated `RuleMetadata.deprecated` field to support both boolean and DeprecationInfo
- Implemented helper functions: `isRuleDeprecated()`, `getDeprecationInfo()`, `getReplacementRuleIds()`
- Updated config validation to warn about deprecated rules
- Created comprehensive test suite (22 tests)

#### Task 2.6.4: Implement Deprecation Warnings ✓

- **Tracking**: Added deprecation detection to `FileValidator.executeRule()`
- **API**: Extended `LintResult` type with `deprecatedRulesUsed` field
- **Output**: Updated `StylishFormatter` to display deprecation warnings
- **CLI Flags**:
  - `--no-deprecated-warnings`: Suppress deprecation warnings (default: show)
  - `--error-on-deprecated`: Treat deprecated rules as errors (default: warnings only)
- **Command**: Created `claudelint check-deprecated` to audit config files
- **Tests**: 17 tests for tracking and formatting (all passing)

1. **MCPConfigSchema** [COMPLETE] (CRITICAL DRIFT FOUND & FIXED)
   - Manual reference: `schemas/mcp-config.schema.json`
   - Source: <https://code.claude.com/docs/en/mcp>
   - Status: Fixed - ENTIRE STRUCTURE WAS WRONG
   - **Drift**: Schema had completely incorrect nesting:
     - Had: `{ name, transport: { type, ... } }`
     - Should be: `{ type, command, url, ... }` (flat)
   - **Impact**: Required complete restructure + fixing 13 validation rules + updating all tests
   - **Severity**: CRITICAL - validators were checking against wrong structure

2. **LSPConfigSchema** [COMPLETE] (CRITICAL DRIFT FOUND & FIXED)
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

3. **AgentFrontmatterSchema** [COMPLETE] (Minor drift - FIXED)
   - Manual reference: `schemas/agent-frontmatter.schema.json`
   - Source: <https://code.claude.com/docs/en/sub-agents#supported-frontmatter-fields>
   - Status: Fixed - missing 1 field + had 1 extra field
   - **Drift**:
     - Missing: permissionMode (enum with 5 values)
     - Extra: events field (doesn't exist in official spec)
   - **Impact**: Added permissionMode enum, deleted agent-events rule and tests
   - **Severity**: Minor - one missing optional field, one extra field that should not exist

4. **OutputStyleFrontmatterSchema** [COMPLETE] (MAJOR drift - FIXED)
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

5. **RulesFrontmatterSchema** [COMPLETE] (Clean - NO DRIFT)
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

## Previous Phases (Completed)

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

## Next Steps

### Phase 2.6 - Rule Deprecation System

**Status**: All Tasks 2.6.1-2.6.6 COMPLETE

#### Completed Tasks

**Task 2.6.6: Documentation and Examples** - COMPLETE

- Documented deprecation policy in CONTRIBUTING.md (180+ lines)
  - When and why to deprecate rules
  - How to mark rules as deprecated (boolean vs DeprecationInfo)
  - Deprecation lifecycle (deprecate → warn for 2+ minors → remove in major)
  - Version policy and timeline
  - Four replacement scenarios with examples
  - User-facing commands and workflow
  - Testing guidelines for deprecated rules

- Added deprecation examples to rule-development.md
  - New "Deprecation Field" section with comprehensive examples
  - Example 1: Single replacement (1:1) - auto-migration supported
  - Example 2: Multiple replacements (1:many) - manual intervention required
  - Example 3: No replacement - suggest removal
  - Example 4: Retained indefinitely - backward compatibility
  - Detailed field documentation (reason, replacedBy, deprecatedSince, removeInVersion, url)

- Documented migration tool in cli-reference.md
  - Added "Deprecation Management" section
  - `check-deprecated` command - list deprecated rules in config
  - `migrate` command - auto-update config files
  - How it works: 1:1 auto-replace, 1:many warn, no replacement suggest removal
  - Detailed usage examples with output samples
  - Exit codes and error handling
  - Supported formats (JSON config, package.json)

- Updated rule creation template
  - Added comment in rule structure pointing to Deprecation Field section
  - Clarified deprecated field is optional for new rules
  - Added note in Required Fields linking to deprecation documentation
  - Ensures new contributors understand deprecation from the start

**Task 2.6.5: Create Migration Tooling** - COMPLETE

- Created `src/utils/migrate/update-configs.ts` (migration logic with 150+ lines)
- Created `src/cli/commands/migrate.ts` (CLI command with 130+ lines)
- Implemented config file scanning and deprecated rule detection
- Auto-replace deprecated rules with single replacements (1:1)
- Warn about multiple replacements requiring manual intervention (1:many)
- Warn about deprecated rules with no replacements (suggest removal)
- Support dry-run mode with `--dry-run` flag
- Support JSON output with `--format json`
- Added `claudelint migrate` command to CLI
- Comprehensive error handling and migration reports
- 12 tests covering all scenarios (all passing)

**Key Features:**

- Preserves rule config (severity + options) when replacing
- Handles package.json with claudelint field
- Writes JSON with proper formatting and trailing newline
- Clear migration reports with colored output
- Exit codes: 0=success, 1=manual intervention needed, 2=error

#### Remaining Tasks

**Task 2.6.6: Documentation and Examples** - TODO

- Update CONTRIBUTING.md with deprecation policy
- Create rule deprecation guide for contributors
- Update rule creation template with deprecation examples
- Document migration tool usage for users

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

### Verification System

- [Schema Verification Workflow](./schema-verification-workflow.md) - Detailed approach
- [Schema Inventory](./schema-inventory.md) - All schemas with status
- [VERIFICATION-SYSTEM.md](./VERIFICATION-SYSTEM.md) - Complete system documentation
- [Verification Status Dashboard](./verification-status.md) - Auto-generated status

### Rule Deprecation

- [Rule Deprecation System](../../architecture/rule-deprecation.md) - Complete design and implementation plan

### Project Tracking

- [Tracker](./tracker.md) - Detailed task breakdown
