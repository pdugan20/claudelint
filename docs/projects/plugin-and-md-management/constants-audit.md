# Constants Audit - Official Claude Code Sources

**Status**: In Progress
**Created**: 2026-02-02

## Overview

Beyond schemas, we have various constants, enums, and hardcoded values that should align with official Claude Code specifications. This document tracks all such values and their verification status.

## Constants Requiring Verification

### 1. Tool Names (ToolNames enum) **NEEDS AUDIT**

**File**: `src/schemas/constants.ts:11-33`
**Current Values**:
```typescript
export const ToolNames = z.enum([
  'Bash',
  'Read',
  'Write',
  'Edit',
  'Glob',
  'Grep',
  'Task',
  'WebFetch',
  'WebSearch',
  'LSP',
  'AskUserQuestion',
  'EnterPlanMode',
  'ExitPlanMode',
  'Skill',
  'TaskCreate',
  'TaskUpdate',
  'TaskGet',
  'TaskList',
  'TaskOutput',
  'TaskStop',
  'NotebookEdit',
]);
```

**Official Source**: Need to find definitive list of available tools
**Documentation**: https://code.claude.com/docs/en/tools (if exists)

**Questions**:
- Are there any new tools added in recent Claude Code versions?
- Are any tools deprecated?
- Is this list complete?

**Action Items**:
- [ ] Find official tool documentation
- [ ] Verify all tools in our list exist
- [ ] Check for missing tools
- [ ] Verify tool name casing (Bash vs bash)

---

### 2. Model Names (ModelNames enum) **NEEDS AUDIT**

**File**: `src/schemas/constants.ts:38`
**Current Values**:
```typescript
export const ModelNames = z.enum(['sonnet', 'opus', 'haiku', 'inherit']);
```

**Official Source**: Need to find official model list
**Documentation**: https://code.claude.com/docs/en/settings (likely in model field docs)

**Questions**:
- Are model names lowercase? (sonnet vs Sonnet)
- What does 'inherit' mean? (inherit from parent context?)
- Are there version-specific models? (sonnet-3.5 vs sonnet-4?)
- Is this list complete?

**Known from Anthropic API**:
- claude-opus-4-5-20251101
- claude-sonnet-4-5-20250929
- claude-3-7-sonnet-20250219
- claude-3-5-haiku-20241022

**Potential Issue**: Our enum uses simplified names (sonnet, opus, haiku) but API uses versioned IDs. Need to understand mapping.

**Action Items**:
- [ ] Find official model configuration documentation
- [ ] Verify if simplified names are correct for settings.json
- [ ] Check if version-specific models should be included
- [ ] Understand 'inherit' value

---

### 3. Hook Events (HookEvents enum) **NEEDS AUDIT**

**File**: `src/schemas/constants.ts:48-62`
**Current Values**:
```typescript
export const HookEvents = z.enum([
  'PreToolUse',
  'PostToolUse',
  'PostToolUseFailure',
  'PermissionRequest',
  'UserPromptSubmit',
  'Notification',
  'Stop',
  'SubagentStart',
  'SubagentStop',
  'PreCompact',
  'Setup',
  'SessionStart',
  'SessionEnd',
]);
```

**Official Source**: Plugin reference documents these
**Documentation**: https://code.claude.com/docs/en/plugins-reference#hooks

**From Plugin Docs**:
Listed events: PreToolUse, PostToolUse, PostToolUseFailure, PermissionRequest, UserPromptSubmit, Notification, Stop, SubagentStart, SubagentStop, SessionStart, SessionEnd, PreCompact

**Comparison**:
- YES All plugin doc events are in our enum
- UNKNOWN We have 'Setup' - not in plugin docs (might be in hooks docs)
- UNKNOWN Need to verify casing is correct

**Action Items**:
- [ ] Compare with https://code.claude.com/docs/en/hooks
- [ ] Verify 'Setup' event exists and is documented
- [ ] Check if any events are missing
- [ ] Verify all event names are case-sensitive correct

---

### 4. Hook Types (HookTypes enum) **LIKELY VERIFIED**

**File**: `src/schemas/constants.ts:67`
**Current Values**:
```typescript
export const HookTypes = z.enum(['command', 'prompt', 'agent']);
```

**Official Source**: Plugin reference
**Documentation**: https://code.claude.com/docs/en/plugins-reference#hooks

**From Plugin Docs**: Hook types are `command`, `prompt`, `agent`

**Status**: **LIKELY VERIFIED** - Matches plugin docs exactly

**Action Items**:
- [ ] Double-check against hooks documentation
- [ ] Mark as verified if confirmed

---

### 5. Context Modes (ContextModes enum) **NEEDS AUDIT**

**File**: `src/schemas/constants.ts:72`
**Current Values**:
```typescript
export const ContextModes = z.enum(['fork', 'inline', 'auto']);
```

**Official Source**: Need to find skill context mode documentation
**Documentation**: Skills documentation (if exists)

**Questions**:
- What are context modes?
- Are these for skills?
- Where is this documented?

**Action Items**:
- [ ] Find documentation for skill context modes
- [ ] Verify these values are correct
- [ ] Understand what each mode does

---

### 6. MCP Transport Types (TransportTypes enum) **NEEDS AUDIT**

**File**: `src/schemas/constants.ts:78`
**Current Values**:
```typescript
export const TransportTypes = z.enum(['stdio', 'sse', 'http', 'websocket']);
```

**Note in code**: "'sse' is deprecated, but still supported"

**Official Source**: MCP documentation
**Documentation**: https://code.claude.com/docs/en/mcp

**From Plugin Docs LSP section**:
- LSP uses `stdio` (default) or `socket`
- Note: This might be different from MCP transports

**Questions**:
- Is 'sse' truly deprecated?
- Is 'socket' missing? (LSP docs mention it)
- Are MCP and LSP transport types the same or different?

**Action Items**:
- [ ] Find official MCP transport documentation
- [ ] Verify all transport types
- [ ] Clarify if 'socket' should be added
- [ ] Confirm 'sse' deprecation status

---

### 7. Rule Categories (RuleCategory type) **NEEDS VERIFICATION**

**File**: `src/types/rule.ts:19-29`
**Current Values**:
```typescript
export type RuleCategory =
  | 'CLAUDE.md'
  | 'Skills'
  | 'Settings'
  | 'Hooks'
  | 'MCP'
  | 'Plugin'
  | 'Commands'
  | 'Agents'
  | 'OutputStyles'
  | 'LSP';
```

**Official Source**: Claude Code component types
**Documentation**: Various docs for each component type

**Alignment Check**:
These categories should align with Claude Code's component types:
- YES Skills - https://code.claude.com/docs/en/skills
- YES Agents - https://code.claude.com/docs/en/sub-agents
- YES Hooks - https://code.claude.com/docs/en/hooks
- YES MCP - https://code.claude.com/docs/en/mcp
- YES Settings - https://code.claude.com/docs/en/settings
- YES Plugin - https://code.claude.com/docs/en/plugins
- YES CLAUDE.md - https://code.claude.com/docs/en/best-practices
- UNKNOWN Commands - Legacy? (plugin docs say use skills/ not commands/)
- UNKNOWN OutputStyles - Need to find documentation
- UNKNOWN LSP - Part of plugins, not standalone component?

**Action Items**:
- [ ] Verify all categories align with actual Claude Code components
- [ ] Check if 'Commands' should be deprecated (plugin docs prefer skills/)
- [ ] Find OutputStyles documentation
- [ ] Determine if LSP should be a category or part of Plugin category

---

### 8. Permission Actions (PermissionActions enum) **NEEDS AUDIT**

**File**: `src/schemas/constants.ts:43`
**Current Values**:
```typescript
export const PermissionActions = z.enum(['allow', 'ask', 'deny']);
```

**Official Source**: Settings schema
**Documentation**: https://json.schemastore.org/claude-code-settings.json

**Status**: Likely verified via check:schema-sync, but should double-check

**Action Items**:
- [ ] Verify these match settings schema
- [ ] Check if there are other permission actions

---

### 9. Script Extensions (ScriptExtensions enum) **NEEDS REVIEW**

**File**: `src/schemas/constants.ts:83`
**Current Values**:
```typescript
export const ScriptExtensions = z.enum(['.sh', '.py', '.js']);
```

**Official Source**: Internal decision (what we validate)
**Documentation**: N/A - this is our validation choice

**Questions**:
- Should we support other script types? (.ts, .rb, etc.)
- Is this list appropriate for hook scripts?

**Action Items**:
- [ ] Review if this list is complete for common hook scripts
- [ ] Consider if we need to expand this

---

## Configuration Scopes

**Mentioned in Plugin Docs**: `user`, `project`, `local`, `managed`

**Where Used**: Plugin installation scopes
**Documentation**: https://code.claude.com/docs/en/discover-plugins#install-plugins

**Action Items**:
- [ ] Search codebase for scope-related constants
- [ ] Verify we're not hardcoding these values anywhere
- [ ] If we validate scopes, ensure they match official list

---

## Default Mode Values

**From SettingsSchema**: `defaultMode: z.enum(['acceptEdits', 'bypassPermissions', 'default', 'plan'])`

**File**: `src/validators/schemas.ts:93`

**Official Source**: Settings schema
**Documentation**: https://json.schemastore.org/claude-code-settings.json

**Status**: Likely verified via check:schema-sync

---

## Summary Table

| Constant | File | Status | Priority | Has Official Source? |
|----------|------|--------|----------|---------------------|
| ToolNames | constants.ts | **NEEDS AUDIT** | High | Unknown |
| ModelNames | constants.ts | **NEEDS AUDIT** | High | Unknown |
| HookEvents | constants.ts | **NEEDS AUDIT** | High | Yes (plugin docs) |
| HookTypes | constants.ts | **LIKELY VERIFIED** | Medium | Yes (plugin docs) |
| ContextModes | constants.ts | **NEEDS AUDIT** | Medium | Unknown |
| TransportTypes | constants.ts | **NEEDS AUDIT** | Medium | Yes (MCP docs) |
| RuleCategory | rule.ts | **NEEDS VERIFICATION** | Low | Yes (component docs) |
| PermissionActions | constants.ts | **LIKELY VERIFIED** | Low | Yes (schema) |
| ScriptExtensions | constants.ts | **NEEDS REVIEW** | Low | No (internal) |

---

## Centralization Plan

### Option 1: Extend Schema Registry
Add constants to existing `src/schemas/schema-registry.ts`:

```typescript
export interface ConstantSource {
  constant: string;
  file: string;
  values: string[];
  officialUrl?: string;
  docsUrl?: string;
  lastVerified?: string;
  status: 'verified' | 'needs-audit' | 'out-of-sync';
  notes?: string;
}

export const CONSTANT_REGISTRY: ConstantSource[] = [
  // ...
];
```

### Option 2: Separate Constants Registry
Create `src/schemas/constants-registry.ts` similar to schema-registry.ts

### Option 3: Combined Truth Registry
Create `src/schemas/truth-registry.ts` that tracks both schemas and constants

**Recommendation**: Option 3 - Combined registry makes it easier to see all verification needs in one place

---

## Next Steps

1. **Immediate**:
   - [ ] Choose centralization approach
   - [ ] Create/update registry with constants tracking

2. **High Priority** (Critical for validation correctness):
   - [ ] Audit ToolNames - impacts allowed-tools validation
   - [ ] Audit ModelNames - impacts settings validation
   - [ ] Audit HookEvents - impacts hooks validation

3. **Medium Priority**:
   - [ ] Audit TransportTypes - impacts MCP validation
   - [ ] Audit ContextModes - impacts skills validation
   - [ ] Verify HookTypes

4. **Low Priority**:
   - [ ] Review RuleCategory alignment
   - [ ] Review ScriptExtensions

5. **Automation**:
   - [ ] Create script to validate constants against official sources
   - [ ] Add CI check for constant drift

---

## Related Work

- Schema Registry: `src/schemas/schema-registry.ts`
- Schema Audit: `docs/projects/plugin-and-md-management/schema-audit.md`
- Schema Sync Script: `scripts/check/schema-sync.ts`
