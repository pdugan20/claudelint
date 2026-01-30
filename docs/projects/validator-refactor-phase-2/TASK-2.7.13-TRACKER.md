# Task 2.7.13: Fill Out Rule Documentation - Progress Tracker

## Overview

Total Rules: 105
- Started: 99 rules needing work
- Current: 77 rules needing work
- Completed: 28 rules (27%)

## Batch Status

### BATCH A: Small Categories (COMPLETE)

**Status: 10/10 rules complete**

#### Commands (2 rules) - 95/100 avg
- [x] commands-deprecated-directory (85→95)
  - Added: How To Fix section
- [x] commands-migrate-to-skills (85→95)
  - Added: How To Fix section

#### Hooks (3 rules) - 95/100 avg
- [x] hooks-invalid-config (85→95)
  - Added: How To Fix section with 4 scenarios
- [x] hooks-invalid-event (90→95)
  - Added: How To Fix section
- [x] hooks-missing-script (85→95)
  - Added: How To Fix section

#### Settings (5 rules) - 95/100 avg
- [x] settings-file-path-not-found (5→95)
  - Created: Full documentation from scratch
- [x] settings-invalid-env-var (85→95)
  - Added: How To Fix section
- [x] settings-invalid-permission (90→95)
  - Added: How To Fix section
- [x] settings-permission-empty-pattern (5→95)
  - Created: Full documentation from scratch
  - **Option Opportunity**: Could add `allowEmpty` boolean option (hardcoded check)
- [x] settings-permission-invalid-rule (85→95)
  - Added: How To Fix section

### [DONE] CLAUDE.md (14 rules) - 97/100 avg - COMPLETE

**Status: 14/14 rules complete**

#### Easy Wins (7 rules) - Already had How To Fix
- [x] claude-md-size-error (90→95)
- [x] claude-md-size-warning (90→95)
- [x] claude-md-filename-case-sensitive (90→95)
- [x] claude-md-import-circular (90→95)
- [x] claude-md-import-in-code-block (85→95)
- [x] claude-md-import-missing (85→95)
- [x] claude-md-rules-circular-symlink (85→97)
  - **[DONE] OPTION ADDED**: maxSymlinkDepth (default: 100)

#### Placeholders (7 rules) - Created from scratch
- [x] claude-md-content-too-many-sections (5→96)
  - **Has Option**: maxSections (default: 20) - documented
- [x] claude-md-import-depth-exceeded (5→96)
  - **Has Option**: maxDepth (default: 5) - documented
- [x] claude-md-file-not-found (5→96)
- [x] claude-md-glob-pattern-backslash (5→96)
- [x] claude-md-glob-pattern-too-broad (5→96)
- [x] claude-md-import-read-failed (5→96)
- [x] claude-md-paths (5→96)
  - **Option Opportunity**: No clear hardcoded values found

---

### [IN PROGRESS] BATCH B: Medium Categories (IN PROGRESS)

**Status: 14/53 rules complete**

#### Plugin (12 rules) - 38/100 avg - NEXT

**Easy Wins (5 rules)** - Need How To Fix:
- [ ] plugin-circular-dependency (85→?)
  - Has: Rule Details, examples
  - Needs: How To Fix section
  - Resource links need updating
- [ ] plugin-invalid-manifest (90→?)
  - Has: Rule Details, examples
  - Needs: How To Fix section
  - Resource links need updating
- [ ] plugin-missing-file (90→?)
  - Has: Rule Details, examples
  - Needs: How To Fix section
  - Resource links need updating
- [ ] plugin-dependency-invalid-version (85→?)
  - Has: Rule Details, examples
  - Needs: How To Fix section
  - Resource links need updating
- [ ] plugin-invalid-version (85→?)
  - Has: Rule Details, examples
  - Needs: How To Fix section
  - Resource links need updating

**Placeholders (7 rules)** - Need full docs:
- [ ] commands-in-plugin-deprecated (5→?)
  - **Option Opportunity**: Could add `warnOnly` boolean (deprecation rule)
- [ ] plugin-components-wrong-location (5→?)
- [ ] plugin-version-required (5→?)
- [ ] plugin-description-required (5→?)
- [ ] plugin-json-wrong-location (5→?)
- [ ] plugin-marketplace-files-not-found (5→?)
- [ ] plugin-name-required (5→?)

#### MCP (13 rules) - 23/100 avg

**Easy Wins (3 rules)** - Need How To Fix:
- [ ] mcp-invalid-server (85→?)
- [ ] mcp-invalid-transport (85→?)
- [ ] mcp-server-key-mismatch (85→?)

**Placeholders (10 rules)** - Need full docs:
- [ ] mcp-http-empty-url (5→?)
- [ ] mcp-http-invalid-url (5→?)
- [ ] mcp-invalid-env-var (5→?)
  - **Option Opportunity**: Could add pattern validation for env var names
- [ ] mcp-sse-empty-url (5→?)
- [ ] mcp-sse-invalid-url (5→?)
- [ ] mcp-sse-transport-deprecated (5→?)
- [ ] mcp-stdio-empty-command (5→?)
- [ ] mcp-websocket-empty-url (5→?)
- [ ] mcp-websocket-invalid-protocol (5→?)
- [ ] mcp-websocket-invalid-url (5→?)

#### Agents (13 rules) - 17/100 avg

**Placeholders (13 rules)** - All need full docs:
- [ ] agent-body-too-short (0→?)
  - **Has Option**: minBodyLength - needs documentation
- [ ] agent-description (5→?)
- [ ] agent-disallowed-tools (5→?)
- [ ] agent-events (5→?)
- [ ] agent-hooks (5→?)
- [ ] agent-hooks-invalid-schema (5→?)
- [ ] agent-missing-system-prompt (5→?)
- [ ] agent-model (5→?)
- [ ] agent-name (5→?)
- [ ] agent-name-directory-mismatch (5→?)
- [ ] agent-skills (5→?)
- [ ] agent-skills-not-found (5→?)
- [ ] agent-tools (5→?)

#### LSP (8 rules) - 4/100 avg

**Placeholders (8 rules)** - All need full docs:
- [ ] lsp-command-not-in-path (5→?)
- [ ] lsp-config-file-not-json (5→?)
- [ ] lsp-config-file-relative-path (5→?)
- [ ] lsp-extension-missing-dot (5→?)
- [ ] lsp-invalid-transport (5→?)
- [ ] lsp-language-id-empty (5→?)
- [ ] lsp-language-id-not-lowercase (5→?)
- [ ] lsp-server-name-too-short (0→?)
  - **Has Option**: minLength - needs documentation

#### Output Styles (7 rules) - 4/100 avg

**Placeholders (7 rules)** - All need full docs:
- [ ] output-style-body-too-short (0→?)
  - **Has Option**: minBodyLength - needs documentation
- [ ] output-style-description (5→?)
- [ ] output-style-examples (5→?)
- [ ] output-style-missing-examples (5→?)
- [ ] output-style-missing-guidelines (5→?)
- [ ] output-style-name (5→?)
- [ ] output-style-name-directory-mismatch (5→?)

---

### [TODO] BATCH C: Large Categories

**Status: 4/28 rules complete**

#### Skills (28 rules) - 44/100 avg

**Easy Wins (4 rules)** - Already complete:
- [x] skill-body-too-long (85→95)
- [x] skill-dangerous-command (85→95)
- [x] skill-deep-nesting (85→95)
- [x] skill-eval-usage (85→95)

**Placeholders (24 rules)** - Need full docs:
- [ ] skill-multi-script-missing-readme (0→?)
  - **Has Option**: Needs documentation
- [ ] skill-version (5→?)
- [ ] skill-unknown-string-substitution (5→?)
- [ ] skill-tags (5→?)
- [ ] skill-referenced-file-not-found (5→?)
- [ ] skill-name (5→?)
- [ ] skill-name-directory-mismatch (5→?)
- [ ] skill-model (5→?)
- [ ] skill-disallowed-tools (5→?)
- [ ] skill-description (5→?)
- [ ] skill-dependencies (5→?)
- [ ] skill-context (5→?)
- [ ] skill-allowed-tools (5→?)
- [ ] skill-agent (5→?)
- [ ] skill-time-sensitive-content (5→?)
  - **Option Opportunity**: Could add age threshold for time-sensitive warnings
- [ ] skill-too-many-files (5→?)
- [ ] skill-path-traversal (5→?)
- [ ] skill-naming-inconsistent (5→?)
- [ ] skill-missing-version (5→?)
- [ ] skill-missing-shebang (5→?)
- [ ] skill-missing-examples (5→?)
- [ ] skill-missing-comments (5→?)
- [ ] skill-missing-changelog (5→?)
- [ ] skill-large-reference-no-toc (5→?)

---

## Options Summary

### Existing Options (Documented)
1. **claude-md-content-too-many-sections**: maxSections (default: 20)
2. **claude-md-import-depth-exceeded**: maxDepth (default: 5)
3. **claude-md-rules-circular-symlink**: maxSymlinkDepth (default: 100) [DONE] NEW

### Has Options (Need Documentation)
4. **agent-body-too-short**: minBodyLength
5. **lsp-server-name-too-short**: minLength
6. **output-style-body-too-short**: minBodyLength
7. **skill-multi-script-missing-readme**: (needs investigation)

### Option Opportunities (Easy & Useful)
8. **settings-permission-empty-pattern**: allowEmpty boolean
9. **commands-in-plugin-deprecated**: warnOnly boolean
10. **mcp-invalid-env-var**: pattern validation for env var names
11. **skill-time-sensitive-content**: ageThreshold number
12. **claude-md-paths**: (investigated - no clear opportunity)
13. **claude-md-rules-circular-symlink**: [DONE] IMPLEMENTED maxSymlinkDepth

---

## Next Steps

### Current Focus: Plugin Category (12 rules)

1. **Update 5 easy wins** with How To Fix sections
   - plugin-circular-dependency
   - plugin-invalid-manifest
   - plugin-missing-file
   - plugin-dependency-invalid-version
   - plugin-invalid-version

2. **Create 7 placeholders** from scratch
   - commands-in-plugin-deprecated (consider warnOnly option)
   - plugin-components-wrong-location
   - plugin-version-required
   - plugin-description-required
   - plugin-json-wrong-location
   - plugin-marketplace-files-not-found
   - plugin-name-required

3. **Fix resource links** for all plugin docs

4. **Commit** when plugin category reaches 95/100 avg

### After Plugin

Continue with Batch B in order:
1. MCP (13 rules, 23/100 avg)
2. Agents (13 rules, 17/100 avg)
3. LSP (8 rules, 4/100 avg)
4. Output Styles (7 rules, 4/100 avg)

Then tackle Batch C:
1. Skills (28 rules, 44/100 avg)

---

## Commit History

- [DONE] Batch A (Commands, Hooks, Settings): 10 rules → 95/100 avg
- [DONE] CLAUDE.md: 14 rules → 97/100 avg (+ maxSymlinkDepth option added)
- [IN PROGRESS] Plugin: In progress...

---

## Notes

- Only add options when both **easy** (boolean/numeric) AND **useful** (solves real need)
- Document existing options when found in code
- Fix resource links from old validator paths to new rule paths
- Use established workflow: read → update → commit → verify
