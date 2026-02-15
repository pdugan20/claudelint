# Official Documentation Sources

Reference URLs used to verify each audit finding. All pages were fetched and cross-referenced during the audit session on 2026-02-14.

## Primary Sources

| Category | URL | Key Sections Referenced |
|----------|-----|------------------------|
| Agents | <https://code.claude.com/docs/en/sub-agents> | Supported frontmatter fields table, permissionMode values, Task tool invocation |
| CLAUDE.md | <https://code.claude.com/docs/en/memory> | @import syntax, file size limits, circular import handling |
| MCP | <https://code.claude.com/docs/en/mcp> | Environment variable expansion (command, args, url, headers, env), transport types |
| Hooks | <https://code.claude.com/docs/en/hooks> | Event table (14 events), hook handler properties (type, command, async, timeout, etc.) |
| Plugins | <https://code.claude.com/docs/en/plugins-reference> | Complete schema, required vs optional fields, component path fields |
| Settings | <https://code.claude.com/docs/en/settings> | Permission tool syntax, valid tool names |
| Output Styles | <https://code.claude.com/docs/en/output-styles> | Style definition format |
| Skills | <https://code.claude.com/docs/en/skills> | Completed in prior session (skill rule alignment) |

## Schema Store

| Schema | URL |
|--------|-----|
| Claude Code Settings | <https://json.schemastore.org/claude-code-settings.json> |

## Local Reference

| Document | Path |
|----------|------|
| Distilled spec | `docs/references/official-claude-code-specs.md` |

---

## Evidence Per Finding

### 1.1 — `delegate` in PermissionModes

From sub-agents docs, "Supported frontmatter fields" table:

> `permissionMode` — Permission mode for the agent. Options: `default`, `acceptEdits`, `dontAsk`, `bypassPermissions`, `plan`, `delegate`

### 1.2 — `maxTurns`, `mcpServers`, `memory`

From sub-agents docs, "Supported frontmatter fields" table:

> `maxTurns` — Maximum number of agentic turns
> `mcpServers` — List of MCP server names available to the agent
> `memory` — Memory configuration for the agent

### 1.3 — `Setup` not a valid event

From hooks docs, "Lifecycle hooks" section. The event table lists: `PreToolUse`, `PostToolUse`, `PostToolUseFailure`, `PermissionRequest`, `UserPromptSubmit`, `Notification`, `Stop`, `SubagentStart`, `SubagentStop`, `PreCompact`, `SessionStart`, `SessionEnd`, `TeammateIdle`, `TaskCompleted`. No `Setup` event is listed.

### 1.4 — `async` field on hook handlers

From hooks docs, "Hook handler properties" table:

> `async` — (boolean) When true, the hook runs asynchronously without blocking

### 2.1 — Headers in env var expansion

From MCP docs, "Environment variable expansion" section:

> Environment variables can be used in `command`, `args`, `url`, `headers`, and `env` fields using `${VAR_NAME}` syntax

### 2.2 / 2.3 — Plugin component types

From plugins-reference docs, "Complete Schema" section. The schema shows fields: `skills`, `agents`, `commands`, `hooks`, `mcpServers`, `lspServers`, `outputStyles`.

### 2.4 — `Task(agent-name)` syntax

From sub-agents docs:

> You can use the Task tool with `subagent_type` to launch specialized agents

The tool/permission system uses `Tool(pattern)` syntax, so `Task(my-agent)` is valid.

### 3.1 / 3.2 — Plugin version and description optional

From plugins-reference docs, "Plugin Manifest" section:

> **Required fields:** `name`
> **Optional metadata:** `version`, `description`, `author`, `homepage`, `repository`, `license`, `keywords`

### 4.1 / 4.2 / 4.3 — Stale event lists

The 14 valid events from hooks docs (see 1.3 evidence). Our doc strings only listed subsets of 5-10 events.

### 4.4 — Stale tool list in settings-invalid-permission

From `src/schemas/constants.ts`, the `ToolNames` enum contains: `Bash`, `Read`, `Write`, `Edit`, `Glob`, `Grep`, `Task`, `WebFetch`, `WebSearch`, `LSP`, `AskUserQuestion`, `EnterPlanMode`, `ExitPlanMode`, `Skill`, `TaskCreate`, `TaskUpdate`, `TaskGet`, `TaskList`, `TaskOutput`, `TaskStop`, `NotebookEdit`.

The doc strings reference `KillShell` and `TodoWrite` which don't exist, and omit many current tools.
