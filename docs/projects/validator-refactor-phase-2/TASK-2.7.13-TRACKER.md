# Task 2.7.13: Fill Out Rule Documentation - Progress Tracker

## Overview

Total Rules: 105
- Started: 99 rules needing work
- Current: 28 rules needing work
- Completed: 77 rules (73%)

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

### [DONE] BATCH B: Medium Categories (COMPLETE)

**Status: 65/65 rules complete**

#### Plugin (12 rules) - 95/100 avg - [DONE]

**Easy Wins (5 rules)** - [DONE]:
- [x] plugin-circular-dependency (85→95)
  - Added: How To Fix section
  - Updated: Resource links
- [x] plugin-invalid-manifest (90→95)
  - Added: How To Fix section
  - Updated: Resource links
- [x] plugin-missing-file (90→95)
  - Added: How To Fix section
  - Updated: Resource links
- [x] plugin-dependency-invalid-version (85→95)
  - Added: How To Fix section
  - Updated: Resource links
- [x] plugin-invalid-version (85→95)
  - Added: How To Fix section
  - Updated: Resource links

**Placeholders (7 rules)** - [DONE]:
- [x] commands-in-plugin-deprecated (5→95)
  - Created: Full documentation
  - Deprecation warning for commands field
- [x] plugin-components-wrong-location (5→95)
  - Created: Full documentation
- [x] plugin-version-required (5→95)
  - Created: Full documentation
- [x] plugin-description-required (5→95)
  - Created: Full documentation
- [x] plugin-json-wrong-location (5→95)
  - Created: Full documentation
- [x] plugin-marketplace-files-not-found (5→95)
  - Created: Full documentation
- [x] plugin-name-required (5→95)
  - Created: Full documentation

#### MCP (13 rules) - 95/100 avg - [DONE]

**Easy Wins (3 rules)** - [DONE]:
- [x] mcp-invalid-server (85→95)
  - Added: How To Fix section
  - Updated: Resource links
- [x] mcp-invalid-transport (85→95)
  - Added: How To Fix section
  - Updated: Resource links
- [x] mcp-server-key-mismatch (5→95)
  - Created: Full documentation

**Placeholders (10 rules)** - [DONE]:
- [x] mcp-http-empty-url (5→95)
  - Created: Full documentation
- [x] mcp-http-invalid-url (5→95)
  - Created: Full documentation
- [x] mcp-invalid-env-var (5→95)
  - Created: Full documentation
- [x] mcp-sse-empty-url (5→95)
  - Created: Full documentation
- [x] mcp-sse-invalid-url (5→95)
  - Created: Full documentation
- [x] mcp-sse-transport-deprecated (5→95)
  - Created: Full documentation
- [x] mcp-stdio-empty-command (5→95)
  - Created: Full documentation
- [x] mcp-websocket-empty-url (5→95)
  - Created: Full documentation
- [x] mcp-websocket-invalid-protocol (5→95)
  - Created: Full documentation
- [x] mcp-websocket-invalid-url (5→95)
  - Created: Full documentation

#### Agents (13 rules) - 95/100 avg - [DONE]

**Placeholders (13 rules)** - [DONE]:
- [x] agent-body-too-short (0→95)
  - **Has Option**: minLength (default: 50) - documented with schema
- [x] agent-description (5→95)
  - Created: Full documentation
- [x] agent-disallowed-tools (5→95)
  - Created: Full documentation
- [x] agent-events (5→95)
  - Created: Full documentation
- [x] agent-hooks (5→95)
  - Created: Full documentation
- [x] agent-hooks-invalid-schema (85→95)
  - Added: How To Fix section
  - Updated: Resource links
- [x] agent-missing-system-prompt (5→95)
  - Created: Full documentation
- [x] agent-model (5→95)
  - Created: Full documentation
- [x] agent-name (5→95)
  - Created: Full documentation
- [x] agent-name-directory-mismatch (5→95)
  - Created: Full documentation
- [x] agent-skills (5→95)
  - Created: Full documentation
- [x] agent-skills-not-found (5→95)
  - Created: Full documentation
- [x] agent-tools (5→95)
  - Created: Full documentation

#### LSP (8 rules) - 96/100 avg - [DONE]

**Placeholders (8 rules)** - [DONE]:
- [x] lsp-command-not-in-path (5→95)
  - Created: Full documentation
- [x] lsp-config-file-not-json (5→95)
  - Created: Full documentation
- [x] lsp-config-file-relative-path (5→95)
  - Created: Full documentation
- [x] lsp-extension-missing-dot (5→95)
  - Created: Full documentation
- [x] lsp-invalid-transport (5→95)
  - Created: Full documentation
- [x] lsp-language-id-empty (5→95)
  - Created: Full documentation
- [x] lsp-language-id-not-lowercase (5→95)
  - Created: Full documentation
- [x] lsp-server-name-too-short (0→95)
  - **Has Option**: minLength (default: 2) - documented with schema

#### Output Styles (4 rules) - 95/100 avg - [DONE]

**Placeholders (4 rules)** - [DONE]:
- [x] output-style-body-too-short (0→95)
  - **Has Option**: minLength (default: 50) - documented with schema
- [x] output-style-missing-examples (5→95)
  - Created: Full documentation
- [x] output-style-missing-guidelines (5→95)
  - Created: Full documentation
- [x] output-style-name-directory-mismatch (5→95)
  - Created: Full documentation

**Note**: Only 4 rules exist in the codebase (not 7 as initially thought)

---

### [TODO] BATCH C: Final Category

**Status: 4/28 rules complete (final 24 rules remaining)**

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
4. **agent-body-too-short**: minLength (default: 50) [DONE]
5. **lsp-server-name-too-short**: minLength (default: 2) [DONE]
6. **output-style-body-too-short**: minLength (default: 50) [DONE]

### Has Options (Need Documentation)
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

### Current Focus: Batch C - Final Category (28 rules)

**Skills Category** (28 rules, 44/100 avg) - LARGEST - NEXT
- 4 easy wins already complete
- 24 placeholders need full documentation
- skill-multi-script-missing-readme has option - needs documentation

### After Completion

All 105 rules will be documented to 95/100+ average

---

## Commit History

- [DONE] Batch A (Commands, Hooks, Settings): 10 rules → 95/100 avg
- [DONE] CLAUDE.md: 14 rules → 97/100 avg (+ maxSymlinkDepth option added)
- [DONE] Plugin: 12 rules → 95/100 avg
- [DONE] MCP: 13 rules → 95/100 avg
- [DONE] Agents: 13 rules → 95/100 avg (+ minLength option documented)
- [DONE] LSP: 8 rules → 96/100 avg (+ minLength option documented)
- [DONE] Output Styles: 4 rules → 95/100 avg (+ minLength option documented)

---

## Notes

- Only add options when both **easy** (boolean/numeric) AND **useful** (solves real need)
- Document existing options when found in code
- Fix resource links from old validator paths to new rule paths
- Use established workflow: read → update → commit → verify
