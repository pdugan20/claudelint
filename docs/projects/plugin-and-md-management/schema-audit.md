# Schema Audit - Claude Code Official Specs Comparison

**Status**: In Progress
**Created**: 2026-02-02
**Critical Issue Found**: Plugin schema outdated and incorrect

## Overview

Systematic audit of all claudelint schema validators against official Claude Code documentation to identify discrepancies and required updates.

**Schema Registry**: All schemas tracked in `src/schemas/schema-registry.ts` with official URLs, verification status, and sync dates.

## Schema Validators Inventory

### In src/validators/schemas.ts

1. **SettingsSchema** - Settings.json validation
2. **HooksConfigSchema** - hooks.json validation (array format)
3. **SettingsHooksSchema** - hooks in settings.json (object format)
4. **MCPConfigSchema** - .mcp.json validation
5. **PluginManifestSchema** - plugin.json validation **CRITICAL ISSUES FOUND**
6. **MarketplaceMetadataSchema** - marketplace.json validation

### In src/schemas/*.schema.ts

7. **SkillFrontmatterSchema** - SKILL.md frontmatter
8. **AgentFrontmatterSchema** - Agent markdown frontmatter
9. **ClaudeMdFrontmatterSchema** - CLAUDE.md frontmatter
10. **OutputStyleFrontmatterSchema** - Output style frontmatter
11. **LSPConfigSchema** - LSP server configuration

## Audit Results

### 1. PluginManifestSchema **CRITICAL**

**File**: `src/validators/schemas.ts:221-234`
**Official Docs**: https://code.claude.com/docs/en/plugins-reference#complete-schema

**Current Schema (INCORRECT):**

```typescript
export const PluginManifestSchema = z.object({
  name: z.string(),
  version: semver(),
  description: z.string(),
  author: z.string().optional(),
  repository: z.string().optional(),
  license: z.string().optional(),
  skills: z.array(z.string()).optional(),
  agents: z.array(z.string()).optional(),
  hooks: z.array(z.string()).optional(),
  commands: z.array(z.string()).optional(),
  mcpServers: z.array(z.string()).optional(),
  dependencies: z.record(z.string()).optional(),
});
```

**Issues Found:**

1. **Missing Fields**:
   - `homepage` (string, optional)
   - `keywords` (array of strings, optional)
   - `outputStyles` (string|array, optional)
   - `lspServers` (string|object, optional)

2. **Incorrect Field Types**:
   - `description`: Currently **required**, should be **optional**
   - `author`: Currently `string`, should be `object` with `{name: string, email?: string, url?: string}`
   - `skills`: Currently `array`, should be `string | array`
   - `agents`: Currently `array`, should be `string | array`
   - `commands`: Currently `array`, should be `string | array`
   - `hooks`: Currently `array`, should be `string | object`
   - `mcpServers`: Currently `array`, should be `string | object`

3. **Undocumented Fields**:
   - `dependencies`: Not in official schema (remove or verify)

**Impact**:
- Our own `.claude-plugin/plugin.json` is INVALID according to our schema
- Plugin validation gives false positives/negatives
- Users get incorrect validation results

**Priority**: **CRITICAL** - Fix immediately

---

### 2. SettingsSchema

**File**: `src/validators/schemas.ts:138-151`
**Official Docs**: https://json.schemastore.org/claude-code-settings.json

**Status**: **PENDING AUDIT**

**Current Schema:**

```typescript
export const SettingsSchema = z.object({
  permissions: PermissionsSchema.optional(),
  env: z.record(z.string()).optional(),
  model: ModelNames.optional(),
  apiKeyHelper: z.string().optional(),
  hooks: SettingsHooksSchema.optional(),
  attribution: AttributionSchema.optional(),
  statusLine: z.string().optional(),
  outputStyle: z.string().optional(),
  sandbox: SandboxSchema.optional(),
  enabledPlugins: z.record(z.boolean()).optional(),
  extraKnownMarketplaces: z.record(MarketplaceConfigSchema).optional(),
  strictKnownMarketplaces: z.boolean().optional(),
});
```

**Note**: Schema has comment "Verify sync with: npm run check:schema-sync" - suggests we have automation for this.

**Action Items**:
- [ ] Fetch official schema from https://json.schemastore.org/claude-code-settings.json
- [ ] Compare field-by-field with our SettingsSchema
- [ ] Check if `npm run check:schema-sync` script exists and what it does
- [ ] Document any discrepancies

---

### 3. HooksConfigSchema & SettingsHooksSchema

**Files**:
- `src/validators/schemas.ts:156-158` (HooksConfigSchema - array format)
- `src/validators/schemas.ts:63-77` (SettingsHooksSchema - object format)

**Official Docs**: Need to find hooks.json schema documentation

**Status**: **PENDING AUDIT**

**Current Schemas:**

Array format (hooks.json):
```typescript
export const HooksConfigSchema = z.object({
  hooks: z.array(HookSchema),
});
```

Object format (settings.json):
```typescript
export const SettingsHooksSchema = z.object({
  PreToolUse: z.array(SettingsHookMatcherSchema).optional(),
  PostToolUse: z.array(SettingsHookMatcherSchema).optional(),
  PostToolUseFailure: z.array(SettingsHookMatcherSchema).optional(),
  PermissionRequest: z.array(SettingsHookMatcherSchema).optional(),
  Notification: z.array(SettingsHookMatcherSchema).optional(),
  UserPromptSubmit: z.array(SettingsHookMatcherSchema).optional(),
  Stop: z.array(SettingsHookMatcherSchema).optional(),
  SubagentStart: z.array(SettingsHookMatcherSchema).optional(),
  SubagentStop: z.array(SettingsHookMatcherSchema).optional(),
  PreCompact: z.array(SettingsHookMatcherSchema).optional(),
  Setup: z.array(SettingsHookMatcherSchema).optional(),
  SessionStart: z.array(SettingsHookMatcherSchema).optional(),
  SessionEnd: z.array(SettingsHookMatcherSchema).optional(),
});
```

**Known from Plugin Docs**:
- Events listed in plugin docs: PreToolUse, PostToolUse, PostToolUseFailure, PermissionRequest, UserPromptSubmit, Notification, Stop, SubagentStart, SubagentStop, SessionStart, SessionEnd, PreCompact
- Hook types: `command`, `prompt`, `agent`

**Action Items**:
- [ ] Find official hooks.json schema documentation
- [ ] Check if plugin hooks schema differs from standalone hooks.json
- [ ] Verify all event names match official docs
- [ ] Check if we're missing any hook events
- [ ] Verify hook types (command, prompt, agent) match official schema

---

### 4. MCPConfigSchema

**File**: `src/validators/schemas.ts:214-216`
**Official Docs**: Need to find MCP configuration documentation

**Status**: **PENDING AUDIT**

**Current Schema:**

```typescript
export const MCPConfigSchema = z.object({
  mcpServers: z.record(MCPServerSchema),
});
```

**From Plugin Docs Example**:
```json
{
  "mcpServers": {
    "plugin-database": {
      "command": "${CLAUDE_PLUGIN_ROOT}/servers/db-server",
      "args": ["--config", "${CLAUDE_PLUGIN_ROOT}/config.json"],
      "env": {
        "DB_PATH": "${CLAUDE_PLUGIN_ROOT}/data"
      }
    }
  }
}
```

**Current MCPServerSchema**:
```typescript
export const MCPServerSchema = z.object({
  name: z.string(),
  transport: z.union([
    MCPStdioTransportSchema,
    MCPSSETransportSchema,
    MCPHTTPTransportSchema,
    MCPWebSocketTransportSchema,
  ]),
});
```

**Potential Issues**:
- Schema requires `name` field, but example doesn't show it (name is the key in record)
- Schema requires `transport` object, but example shows flat `command` and `args`
- May be confusing different MCP config formats

**Action Items**:
- [ ] Find official MCP configuration schema
- [ ] Check if there are multiple MCP config formats (settings.json vs .mcp.json)
- [ ] Verify transport types and required fields
- [ ] Test against example from plugin docs

---

### 5. LSPConfigSchema

**File**: `src/schemas/lsp-config.schema.ts`
**Official Docs**: https://code.claude.com/docs/en/plugins-reference (LSP servers section)

**Status**: **PENDING AUDIT**

**From Plugin Docs**:

Required fields:
- `command` - The LSP binary to execute
- `extensionToLanguage` - Maps file extensions to language identifiers

Optional fields:
- `args` - Command-line arguments
- `transport` - Communication transport: `stdio` (default) or `socket`
- `env` - Environment variables
- `initializationOptions` - Options during initialization
- `settings` - Settings via workspace/didChangeConfiguration
- `workspaceFolder` - Workspace folder path
- `startupTimeout` - Max time to wait for startup (milliseconds)
- `shutdownTimeout` - Max time for graceful shutdown (milliseconds)
- `restartOnCrash` - Whether to automatically restart if crashes
- `maxRestarts` - Maximum restart attempts

**Action Items**:
- [ ] Read src/schemas/lsp-config.schema.ts
- [ ] Compare with official LSP docs fields
- [ ] Verify all required/optional fields match
- [ ] Check transport enum values

---

### 6. SkillFrontmatterSchema

**File**: `src/schemas/skill-frontmatter.schema.ts`
**Official Docs**: https://code.claude.com/docs/en/skills

**Status**: **PENDING AUDIT**

**Action Items**:
- [ ] Read src/schemas/skill-frontmatter.schema.ts
- [ ] Find official SKILL.md frontmatter documentation
- [ ] Compare required vs optional fields
- [ ] Verify `allowed-tools` enum matches available tools
- [ ] Check if `version` field matches format requirements

---

### 7. AgentFrontmatterSchema

**File**: `src/schemas/agent-frontmatter.schema.ts`
**Official Docs**: https://code.claude.com/docs/en/plugins-reference (Agents section)

**Status**: **PENDING AUDIT**

**From Plugin Docs**:

Agent frontmatter example:
```yaml
description: What this agent specializes in
capabilities: ["task1", "task2", "task3"]
```

**Action Items**:
- [ ] Read src/schemas/agent-frontmatter.schema.ts
- [ ] Compare with plugin docs agent structure
- [ ] Verify required fields
- [ ] Check if capabilities field is required

---

### 8. ClaudeMdFrontmatterSchema

**File**: `src/schemas/claude-md-frontmatter.schema.ts`
**Official Docs**: Need to find CLAUDE.md frontmatter documentation

**Status**: **PENDING AUDIT**

**Action Items**:
- [ ] Read src/schemas/claude-md-frontmatter.schema.ts
- [ ] Find official CLAUDE.md frontmatter documentation (if exists)
- [ ] Determine if CLAUDE.md even supports frontmatter
- [ ] Check .claude/rules/ frontmatter requirements

---

### 9. OutputStyleFrontmatterSchema

**File**: `src/schemas/output-style-frontmatter.schema.ts`
**Official Docs**: Need to find output style documentation

**Status**: **PENDING AUDIT**

**Action Items**:
- [ ] Read src/schemas/output-style-frontmatter.schema.ts
- [ ] Find official output style documentation
- [ ] Verify schema matches requirements

---

### 10. MarketplaceMetadataSchema

**File**: `src/validators/schemas.ts:239-250`
**Official Docs**: Need to find marketplace.json documentation

**Status**: **PENDING AUDIT**

**Current Schema:**

```typescript
export const MarketplaceMetadataSchema = z.object({
  name: z.string(),
  description: z.string(),
  version: semver(),
  author: z.string().optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
  icon: z.string().optional(),
  screenshots: z.array(z.string()).optional(),
  readme: z.string().optional(),
  changelog: z.string().optional(),
});
```

**Action Items**:
- [ ] Find official marketplace.json schema
- [ ] Compare with our schema
- [ ] Check if marketplace.json and plugin.json share fields

---

## Check for Existing Schema Sync

**Found**: Comment in SettingsSchema: "Verify sync with: npm run check:schema-sync"

**Action Items**:
- [ ] Check if `npm run check:schema-sync` exists in package.json
- [ ] If exists, run it and see what it reports
- [ ] Determine if we can extend this script to check other schemas

---

## Systematic Audit Plan

1. **Immediate** (Critical):
   - [ ] Fix PluginManifestSchema (Task 1.4 in tracker)
   - [ ] Update .claude-plugin/plugin.json to match corrected schema

2. **High Priority** (Core functionality):
   - [ ] Audit SettingsSchema
   - [ ] Audit HooksConfigSchema / SettingsHooksSchema
   - [ ] Audit MCPConfigSchema
   - [ ] Audit LSPConfigSchema

3. **Medium Priority** (Component schemas):
   - [ ] Audit SkillFrontmatterSchema
   - [ ] Audit AgentFrontmatterSchema

4. **Low Priority** (Less commonly used):
   - [ ] Audit ClaudeMdFrontmatterSchema
   - [ ] Audit OutputStyleFrontmatterSchema
   - [ ] Audit MarketplaceMetadataSchema

5. **Automation**:
   - [ ] Check existing `check:schema-sync` script
   - [ ] Create automated schema comparison tool
   - [ ] Add CI check to catch schema drift

---

## Resources

### Official Documentation URLs

**JSON Schema URLs** (machine-readable):
- Settings Schema: https://json.schemastore.org/claude-code-settings.json

**Documentation URLs** (human-readable specs):
- Plugin Reference: https://code.claude.com/docs/en/plugins-reference
- Skills: https://code.claude.com/docs/en/skills
- Hooks: https://code.claude.com/docs/en/hooks
- MCP: https://code.claude.com/docs/en/mcp
- Settings: https://code.claude.com/docs/en/settings
- Plugin Marketplaces: https://code.claude.com/docs/en/plugin-marketplaces
- Full Docs Index: https://code.claude.com/docs/llms.txt

**All URLs centralized in**: `src/schemas/schema-registry.ts`

### Internal Files

- **Schema registry**: `src/schemas/schema-registry.ts` - Centralized tracking of all schemas
- All schemas: `src/validators/schemas.ts`
- Frontmatter schemas: `src/schemas/*.schema.ts`
- Schema sync script: `scripts/check/schema-sync.ts` (run via `npm run check:schema-sync`)

---

## Next Steps

1. Commit this audit document
2. Continue with current Phase 1 tasks
3. Create separate project/phase for schema synchronization
4. Prioritize fixing PluginManifestSchema (already added as Task 1.4)
