# Deviations from Original Proposal

Tracks any deviations from the original project proposal on a per-task basis. Each entry records what was originally planned, what actually happened, and why the deviation occurred.

**Created**: 2026-02-14
**Last Updated**: 2026-02-14

---

## Legend

- **As planned** -- Implemented exactly as proposed
- **Modified** -- Approach or scope changed during implementation
- **Dropped** -- Task removed from scope
- **Added** -- New task not in original proposal

---

## Phase 1: Schema and Constants Fixes

### 1.1 Add `delegate` to agent PermissionModes

| | |
|---|---|
| **Original proposal** | Add `'delegate'` to `PermissionModes` enum |
| **Actual** | As planned. Also updated manual JSON schema `schemas/agent-frontmatter.schema.json`. |
| **Status** | As planned |

### 1.2 Add `maxTurns`, `mcpServers`, `memory` to AgentFrontmatterSchema

| | |
|---|---|
| **Original proposal** | Add three new optional fields to AgentFrontmatterSchema |
| **Actual** | As planned. Also added fields to manual JSON schema `schemas/agent-frontmatter.schema.json`. |
| **Status** | As planned |

### 1.3 Remove `Setup` from HookEvents

| | |
|---|---|
| **Original proposal** | Remove `'Setup'` from HookEvents enum and SettingsHooksSchema |
| **Actual** | Modified. Also had to remove `Setup` from manual JSON schema `schemas/hooks-config.schema.json` which wasn't in original proposal. The schema sync check (`check:schema-sync`) caught this drift. |
| **Status** | **Modified** -- additional manual JSON schema update required |
| **Reason** | Manual reference schemas must stay in sync with Zod schemas. The `check:schema-sync` script validates this. |

### 1.4 Add `async` field to hook handler schema

| | |
|---|---|
| **Original proposal** | Add `async: z.boolean().optional()` to SettingsHookSchema |
| **Actual** | Modified. Also added `async` to both manual JSON schemas: `schemas/hooks-config.schema.json` and `schemas/agent-frontmatter.schema.json` (agent hook handlers inherit the same structure). |
| **Status** | **Modified** -- additional manual JSON schema updates required |
| **Reason** | Same as 1.3. Manual schemas must stay synchronized. |

### 1.5 Regenerate JSON schemas

| | |
|---|---|
| **Original proposal** | Run `generate:json-schemas` and `check:schema-sync` |
| **Actual** | As planned. First run caught drift in HooksConfigSchema (Setup still in manual schema). After fixing manual schemas, all 8 schemas passed with 0 drift. |
| **Status** | As planned |

---

## Phase 2: Rule Logic Fixes

### 2.1 Add `headers` to MCP env var validation

| | |
|---|---|
| **Original proposal** | Add header value validation in `validateTransport()` after URL check |
| **Actual** | As planned. Also updated the `details` doc string to mention headers. |
| **Status** | As planned |

### 2.2 Add missing component types to `plugin-missing-component-paths`

| | |
|---|---|
| **Original proposal** | Expand COMPONENT_FIELDS from 4 to 7 types |
| **Actual** | As planned. Added test for inline object configs being safely skipped (important edge case since hooks/mcpServers/lspServers can be objects). |
| **Status** | As planned |

### 2.3 Add missing component types to `plugin-components-wrong-location`

| | |
|---|---|
| **Original proposal** | Expand componentsToCheck from 4 to 7 types |
| **Actual** | As planned. No new tests needed since existing test pattern covers the logic. |
| **Status** | As planned |

### 2.4 Recognize `Task(agent-name)` syntax in tool validation

| | |
|---|---|
| **Original proposal** | Extract base tool name from parameterized `Tool(pattern)` syntax before validation |
| **Actual** | As planned. Added 4 test cases: 3 valid parameterized tools + 1 invalid. |
| **Status** | As planned |

---

## Phase 3: Severity Adjustments

### 3.1 Downgrade `plugin-version-required` from `error` to `warn`

| | |
|---|---|
| **Original proposal** | Change severity and update all doc strings from "required" to "recommended" |
| **Actual** | As planned. Updated: severity, description, summary, rationale, details, howToFix, and message. |
| **Status** | As planned |

### 3.2 Downgrade `plugin-description-required` from `error` to `warn`

| | |
|---|---|
| **Original proposal** | Change severity and update all doc strings from "required" to "recommended" |
| **Actual** | As planned. Same scope as 3.1. |
| **Status** | As planned |

---

## Phase 4: Doc String Updates

### 4.1 Update `hooks-invalid-event` doc strings

| | |
|---|---|
| **Original proposal** | Update `details` and `howToFix` to list all 14 events |
| **Actual** | As planned. |
| **Status** | As planned |

### 4.2 Update `agent-hooks-invalid-schema` doc strings

| | |
|---|---|
| **Original proposal** | Update `howToFix` to list all 14 events |
| **Actual** | Modified. Also updated `details` field which only listed 2 example events. |
| **Status** | **Modified** -- also updated `details` |
| **Reason** | The `details` field also had a stale event list (only showed "PreToolUse, PostToolUse"). Updated to show 4 representative events. |

### 4.3 Update `agent-hooks` doc strings

| | |
|---|---|
| **Original proposal** | Update `details` to list all 14 events |
| **Actual** | As planned. |
| **Status** | As planned |

### 4.4 Update `settings-invalid-permission` doc strings

| | |
|---|---|
| **Original proposal** | Update file header and `howToFix` to match current VALID_TOOLS |
| **Actual** | As planned. Removed `KillShell` and `TodoWrite`, added all 21 current tools. |
| **Status** | As planned |

---

## Items Dropped During Audit Verification

These were in the initial recommendation list but dropped after verifying against docs:

### D1. Fix `@import` regex in claude-md rules

| | |
|---|---|
| **Initial recommendation** | Change regex from `/@([^\s]+)/g` to `/@import\s+/` |
| **Reason dropped** | After verifying official docs, Claude Code uses `@path` syntax (not `@import path`), so the existing regex is correct |

### D2. Promote `claude-md-import-circular` from warn to error

| | |
|---|---|
| **Initial recommendation** | Change severity from `warn` to `error` |
| **Reason dropped** | Docs say "max-depth of 5 hops" and symlinks "handled gracefully" -- warn is appropriate for a guardrail, not a hard error |

---

## Summary Statistics

| Metric | Count |
|--------|-------|
| Tasks as planned | 9 |
| Tasks modified | 3 |
| Tasks dropped | 0 |
| Tasks added | 0 |
| **Total deviations** | **3** |

All 3 modifications were minor scope expansions (updating additional manual JSON schemas and an extra doc string field), not changes to the approach or outcome.
