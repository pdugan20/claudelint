# Schema Inventory - Sources of Truth

**Last Updated**: 2026-02-02
**Purpose**: Track all schemas that need verification against official Claude Code specifications

## Overview

claudelint maintains 10 major schemas that must stay synchronized with official Claude Code specifications. This document tracks each schema, its source, and verification status.

## Schema Inventory

### 1. PluginManifestSchema

**Location**: `src/validators/schemas.ts` (lines 231-254)
**Official Source**: [https://code.claude.com/docs/en/plugins-reference#complete-schema](https://code.claude.com/docs/en/plugins-reference#complete-schema)
**Status**: NEEDS VERIFICATION - OUT OF SYNC - Fixed in Phase 1 (deleted 2 invalid rules)
**Verification**: Manual + automated via `check:schema-sync`

**Known Issues**:
- Previously had `dependencies` and `circularDependency` fields not in official spec (FIXED)
- Needs regular verification against official docs

**Fields**:
- Required: `name`
- Optional: `version`, `description`, `author`, `homepage`, `repository`, `license`, `keywords`
- Component paths: `commands`, `agents`, `skills`
- Config paths: `hooks`, `mcpServers`, `outputStyles`, `lspServers`

### 2. SettingsSchema

**Location**: `src/validators/schemas.ts` (lines 138-151)
**Official Source**: [https://json.schemastore.org/claude-code-settings.json](https://json.schemastore.org/claude-code-settings.json)
**Status**: SYNCED - SYNCED (has official URL reference in code)
**Verification**: Automated via `check:schema-sync`

**Sub-schemas**:
- `PermissionsSchema` (lines 89-96)
- `SettingsHooksSchema` (lines 63-77)
- `AttributionSchema` (lines 101-105)
- `SandboxSchema` (lines 110-113)
- `MarketplaceConfigSchema` (lines 128-131)

### 3. HooksConfigSchema

**Location**: `src/validators/schemas.ts` (lines 156-158)
**Official Source**: [https://code.claude.com/docs/en/hooks](https://code.claude.com/docs/en/hooks)
**Status**: SYNCED - SYNCED (fixed 2026-02-02)
**Verification**: Manual JSON Schema + auto-generated comparison

**Sub-schemas**:
- `HookSchema` (lines 23-37) - Array format with event field (9 fields)
- `MatcherSchema` (lines 12-15)

**Hook Fields** (9 total):
- `event`: Lifecycle event name
- `matcher`: Optional pattern matching (tool, pattern)
- `type`: Handler type (command/prompt/agent)
- `command`: Shell command (conditional)
- `prompt`: Prompt text (conditional)
- `agent`: Agent type (conditional)
- `exitCodeHandling`: Map exit codes to actions
- `timeout`: Timeout in milliseconds
- `async`: Run asynchronously

**Drift History**:
- 2026-02-02: Discovered missing 2 fields (timeout, async)
- 2026-02-02: Fixed - all 9 fields now present in HookSchema

**Note**: Different from SettingsHooksSchema (object format with event names as keys)

### 4. MCPConfigSchema

**Location**: `src/validators/schemas.ts` (lines 214-221)
**Official Source**: [https://code.claude.com/docs/en/mcp](https://code.claude.com/docs/en/mcp)
**Status**: SYNCED - SYNCED (fixed 2026-02-02)
**Verification**: Manual JSON Schema + auto-generated comparison

**CRITICAL DRIFT FOUND**: Entire schema structure was wrong!
- **Wrong**: Had `{ name, transport: { type, ... } }` structure
- **Correct**: Transport fields are flat `{ type, command, url, ... }`
- **Fixed**: Complete restructure of MCPServerSchema + updated 13 validation rules

**Sub-schemas**:
- `MCPServerSchema` (lines 201-209)
- `MCPStdioTransportSchema` (lines 163-168)
- `MCPSSETransportSchema` (lines 173-177)
- `MCPHTTPTransportSchema` (lines 182-187)
- `MCPWebSocketTransportSchema` (lines 192-196)

### 5. LSPConfigSchema

**Location**: `src/schemas/lsp-config.schema.ts` (lines 90-93)
**Official Source**: Language Server Protocol spec + Claude Code integration
**Status**: NEEDS VERIFICATION - NEEDS VERIFICATION
**Verification**: Manual - based on LSP spec + Claude Code docs

**Sub-schemas**:
- `LSPServerSchema` (lines 33-77)
- `ExtensionMappingSchema` (lines 82-85)

### 6. SkillFrontmatterSchema

**Location**: `src/schemas/skill-frontmatter.schema.ts`
**Official Source**: [https://code.claude.com/docs/en/skills](https://code.claude.com/docs/en/skills)
**Status**: SYNCED - SYNCED (fixed 2026-02-02)
**Verification**: Manual JSON Schema + auto-generated comparison

**Official Fields** (from docs):
- `name`: Skill name (kebab-case)
- `description`: When to use the skill
- `argument-hint`: Hint for arguments
- `disable-model-invocation`: Prevent auto-triggering
- `user-invocable`: Show in `/` menu
- `allowed-tools`: Tools available without permission
- `disallowed-tools`: Tools not available (mutually exclusive with allowed-tools)
- `model`: Model to use
- `context`: Run in subagent (`fork`, `inline`, `auto`)
- `agent`: Subagent type
- `version`: Semantic version
- `tags`: Discovery tags
- `dependencies`: Dependencies on other skills
- `hooks`: Skill-scoped hooks

**Drift History**:
- 2026-02-02: Discovered missing 4 fields (argument-hint, disable-model-invocation, user-invocable, hooks)
- 2026-02-02: Fixed - all 14 fields now present in Zod schema

### 7. AgentFrontmatterSchema

**Location**: `src/schemas/agent-frontmatter.schema.ts`
**Official Source**: [https://code.claude.com/docs/en/sub-agents](https://code.claude.com/docs/en/sub-agents)
**Status**: NEEDS VERIFICATION - NEEDS VERIFICATION
**Verification**: Manual - check against subagent docs

**Expected Fields**:
- `description`: Agent capabilities
- `capabilities`: Array of capabilities
- `model`: Model to use
- `allowed-tools`: Permitted tools
- `hooks`: Agent-scoped hooks
- `skills`: Preloaded skills

### 8. OutputStyleFrontmatterSchema

**Location**: `src/schemas/output-style-frontmatter.schema.ts`
**Official Source**: [https://code.claude.com/docs/en/plugins-reference#output-styles](https://code.claude.com/docs/en/plugins-reference#output-styles)
**Status**: NEEDS VERIFICATION - NEEDS VERIFICATION
**Verification**: Manual - limited official docs

**Expected Fields**:
- `name`: Output style name
- `description`: What the style does
- `guidelines`: Formatting guidelines
- `examples`: Example outputs

### 9. ClaudeMdFrontmatterSchema

**Location**: `src/schemas/claude-md-frontmatter.schema.ts`
**Official Source**: Claude Code documentation (CLAUDE.md format)
**Status**: NEEDS VERIFICATION - NEEDS VERIFICATION
**Verification**: Manual - check if CLAUDE.md supports frontmatter

**Note**: May not have official frontmatter support - needs investigation

### 10. CommandFrontmatterSchema

**Location**: Not yet found - may be implicit or deprecated
**Official Source**: Commands merged into skills system
**Status**: UNKNOWN - DEPRECATED or IMPLICIT
**Verification**: N/A - commands use skill frontmatter

**Note**: Commands now use skill frontmatter format per [https://code.claude.com/docs/en/skills](https://code.claude.com/docs/en/skills)

## Verification Priority

### High Priority (Out of Sync or Unverified)

1. **PluginManifestSchema** - Already had sync issues, needs automation
2. **MCPConfigSchema** - No official source documented
3. **LSPConfigSchema** - Complex spec, needs verification
4. **AgentFrontmatterSchema** - New feature, may evolve

### Medium Priority (Likely Synced, Needs Confirmation)

5. **HooksConfigSchema** - Derived from Settings schema
6. **OutputStyleFrontmatterSchema** - Limited docs available
7. **ClaudeMdFrontmatterSchema** - Unclear if frontmatter is official

### Low Priority (Already Synced)

8. **SettingsSchema** - Has official URL reference
9. **SkillFrontmatterSchema** - Well-documented in official docs

## Verification Approaches

### Automated Verification (Preferred)

For schemas with official JSON Schema or documented specs:
1. Fetch official schema/spec
2. Compare field names, types, required/optional status
3. Report differences
4. Run on pre-commit hook

**Applicable to**:
- PluginManifestSchema
- SettingsSchema
- SkillFrontmatterSchema

### Manual Verification (Required)

For schemas without machine-readable specs:
1. Read official documentation
2. Manually compare fields
3. Document in comments
4. Schedule quarterly reviews

**Applicable to**:
- MCPConfigSchema
- LSPConfigSchema
- AgentFrontmatterSchema
- OutputStyleFrontmatterSchema

## Next Steps

1. **Create schema-sync verification script** (`scripts/verify/schema-sync.ts`)
2. **Add automation for high-priority schemas** (Plugin, Settings, Skills)
3. **Document manual verification process** for others
4. **Schedule quarterly sync checks** for all schemas
5. **Add to CI/CD pipeline** to prevent regressions

## References

- [Claude Code Plugins Reference](https://code.claude.com/docs/en/plugins-reference)
- [Claude Code Skills Documentation](https://code.claude.com/docs/en/skills)
- [Claude Code Settings JSON Schema](https://json.schemastore.org/claude-code-settings.json)
- [Model Context Protocol Spec](https://modelcontextprotocol.io/)
- [Language Server Protocol Spec](https://microsoft.github.io/language-server-protocol/)
