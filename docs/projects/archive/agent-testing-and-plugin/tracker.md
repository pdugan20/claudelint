# Agent Testing, Plugin Agent, and Documentation Improvements

**Created**: 2026-02-15
**Status**: Complete
**Total Tasks**: 28
**Progress**: 28/28 (100%)

## Summary

After completing the agents rework (flat file discovery, rule alignment, schema fixes), we audited the test infrastructure and found it thin. This project adds the `color` schema field, creates our first plugin agent, expands test coverage, restructures documentation, renames a rule ID, and updates GitHub issue #26.

**Key references:**

- Sub-agents: <https://code.claude.com/docs/en/sub-agents>
- Plugins reference: <https://code.claude.com/docs/en/plugins-reference>
- System prompt best practices: <https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/system-prompts>

---

## Phase 1: Schema -- Add `color` Field

### 1.1 Update `AgentFrontmatterSchema`

- [x] Added `color` as optional enum: blue, cyan, green, yellow, magenta, red, pink

### 1.2 Add schema tests for `color`

- [x] Accept valid color: `color: 'green'`
- [x] Reject invalid color: `color: 'purple'`

### 1.3 Update docs

- [x] Added `color` to agent frontmatter table in `website/api/schemas.md`
- [x] Fixed `permissionMode` row (added `delegate`, removed separate `delegate` boolean row)

### 1.4 Regenerate JSON schemas

- [x] `npm run generate:json-schemas` -- 8 succeeded

---

## Phase 2: Plugin Agent Creation

### 2.1 Create `agents/` directory

- [x] Created `agents/` at plugin root

### 2.2 Create `agents/claude-md-optimizer.md`

- [x] Agent created with frontmatter (skills, tools, color, model) and system prompt body
- [x] Description follows first-party convention with `<example>` blocks

### 2.3 Fix agent description schema

- [x] Removed `noXMLTags` refinement from agent description (official agents use `<example>` tags)
- [x] Removed `thirdPerson` refinement from agent description (example blocks contain dialog)
- [x] Updated `agent-description` rule docs and metadata
- [x] Updated tests and invalid fixture

### 2.4 Verify dogfooding

- [x] `npm run check:self` -- 0 problems found

---

## Phase 3: Test Coverage Improvements

### 3.1 Expand valid-complete fixture agent

- [x] Added `memory`, `skills`, `maxTurns`, `color` fields

### 3.2 Add invalid fixture agent for skill resolution

- [x] Created `missing-skills-agent.md` with `skills: ['nonexistent-skill']`

### 3.3 Update integration test pinned counts

- [x] Errors: 31 -> 32
- [x] Added `agent-skills-not-found` assertion

### 3.4 Add agent-name edge case tests

- [x] Added valid: single char, numeric prefix, leading hyphen
- [x] Added invalid: spaces in name

### 3.5 Add agent-description tests for XML and dialog

- [x] Valid: description with `<example>` tags and "you" in dialog

### 3.6 Add inline disable tests

- [x] Specific rule disable (agent-body-too-short suppressed)
- [x] Non-disabled rules still fire (agent-name-filename-mismatch fires when body suppressed)
- [x] Note: disable comments must go after frontmatter (deviation #6)

### 3.7 Add skill resolution integration tests

- [x] Agent with existing skill passes
- [x] Agent with nonexistent skill reports error

### 3.8 Add plugin-level discovery test

- [x] Agent at `agents/` (not `.claude/agents/`) discovered

### 3.9 Add all-optional-fields validation test

- [x] Agent with every field populated passes (memory, color, maxTurns, permissionMode, tools)

### 3.10 Run full test suite

- [x] 1578 tests pass across 196 suites

---

## Phase 4: Rule ID Rename

### 4.1 Rename `agent-name-directory-mismatch` to `agent-name-filename-mismatch`

- [x] Rule file renamed and ID updated
- [x] Test file updated
- [x] Integration test assertion updated
- [x] `npm run generate:types` regenerated (113 rules)
- [x] `npm run docs:generate` regenerated
- [x] Preset snapshots updated
- [x] Validators docs page updated
- [x] Old rule doc deleted

---

## Phase 5: Documentation

### 5.1 Create `website/development/design-philosophy.md`

- [x] Moved philosophy/scope content from architecture.md
- [x] Added "Project-Scoped by Design" section with scope summary and rationale

### 5.2 Trim `website/development/architecture.md`

- [x] Removed moved content, added link to design-philosophy

### 5.3 Update sidebar nav

- [x] Added Design Philosophy to Development sidebar

### 5.4 Update `website/guide/file-discovery.md`

- [x] Added scope tip box linking to design-philosophy

### 5.5 Fix agents validator page

- [x] Reverted to concise 1-sentence opening (matching other validator pages)
- [x] Moved agents-vs-skills and AGENTS.md context to glossary

### 5.6 Add Agent Files entry to glossary

- [x] Added under File Types section with agent structure, disambiguation, and validation summary

### 5.7 Trim design-philosophy coverage map

- [x] Replaced duplicative table with summary referencing file-discovery page

### 5.8 Update See Also sections

- [x] Replaced generic "Rules Reference" links with official Claude Code doc links for each validator
- [x] All 10 validator pages updated: claude-md, skills, settings, hooks, mcp, plugin, agents, lsp, output-styles, commands

---

## Phase 6: GitHub Issue #26 Update

### 6.1 Update issue body

- [x] Removed `agent-missing-system-prompt` (deleted) and `agent-name-directory-mismatch` (renamed)
- [x] Updated implemented count to 11, planned count to 14
- [x] Added `agent-description-missing-trigger` and `agent-description-missing-examples` as new planned rules
- [x] Trimmed speculative Tier 3 rules (removed 12 rules that were too speculative)
- [x] Added notes about `delegate` as `permissionMode` value and XML tag conventions

---

## Phase 7: Project Tracking

### 7.1 Create project tracker

- [x] `docs/projects/agent-testing-and-plugin/tracker.md`

### 7.2 Create deviations log

- [x] `docs/projects/agent-testing-and-plugin/deviations.md`

---

## Follow-ups (documented, not in scope)

- Schema-vs-rules architecture: schema errors bypass disable directives. Either make `mergeSchemaValidationResult` go through `report()`, or make schema a loose type checker with all format constraints in rules only.

---

## Verification

- [x] `npm run build` -- TypeScript compiles
- [x] `npm run generate:types` -- rule types regenerated (113 rules)
- [x] `npm test` -- 1578 tests pass across 196 suites
- [x] `npm run check:self` -- 0 problems found
- [x] `npm run docs:generate` -- 113 rule pages generated
- [x] `npm run docs:build` -- VitePress build clean, no dead links
- [x] `npm run check:rule-coverage` -- 113/113 rules have tests
