---
description: "Overview of all configuration schemas claudelint validates, with quick-reference links and valid values."
---

# Configuration Schemas

claudelint validates Claude Code configuration files against schemas derived from the official documentation. Each schema has its own reference page with full field details.

## Quick Reference

| Schema | Config File | Official Docs |
|--------|-------------|---------------|
| [Skills](/api/schemas/skills) | `SKILL.md` frontmatter | [Skills reference](https://code.claude.com/docs/en/skills#frontmatter-reference) |
| [Agents](/api/schemas/agents) | Agent `.md` frontmatter | [Subagent fields](https://code.claude.com/docs/en/sub-agents#supported-frontmatter-fields) |
| [Hooks](/api/schemas/hooks) | `hooks.json` | [Hooks](https://code.claude.com/docs/en/hooks) |
| [MCP](/api/schemas/mcp) | `.mcp.json` | [MCP servers](https://code.claude.com/docs/en/mcp) |
| [Plugin Manifest](/api/schemas/plugin) | `plugin.json` | [Plugin schema](https://code.claude.com/docs/en/plugins-reference#complete-schema) |
| [Marketplace](/api/schemas/marketplace) | `marketplace.json` | [Marketplace schema](https://code.claude.com/docs/en/plugin-marketplaces#marketplace-schema) |
| [Settings](/api/schemas/settings) | `settings.json` | [Settings](https://code.claude.com/docs/en/settings) |
| [LSP](/api/schemas/lsp) | `.lsp.json` | [LSP servers](https://code.claude.com/docs/en/plugins-reference#lsp-servers) |
| [Output Styles](/api/schemas/output-styles) | `OUTPUTSTYLE.md` frontmatter | [Output styles](https://code.claude.com/docs/en/output-styles#frontmatter) |
| [Rules](/api/schemas/rules) | `.claude/rules/*.md` frontmatter | [Path-specific rules](https://code.claude.com/docs/en/memory#path-specific-rules) |

## Valid Values Reference

These constant sets are used across multiple schemas. claudelint flags any value not in these lists.

### Tool Names

Valid values for `allowed-tools`, `disallowed-tools`, `tools`, and `disallowedTools` fields.

| Tool | Description |
|------|-------------|
| `Bash` | Shell command execution |
| `Read` | File reading |
| `Write` | File creation |
| `Edit` | File editing |
| `Glob` | File pattern matching |
| `Grep` | Content search |
| `Task` | Subagent task delegation |
| `WebFetch` | URL content fetching |
| `WebSearch` | Web search |
| `LSP` | Language Server Protocol |
| `AskUserQuestion` | Interactive user prompts |
| `EnterPlanMode` | Plan mode entry |
| `ExitPlanMode` | Plan mode exit |
| `Skill` | Skill invocation |
| `TaskCreate` | Task list creation |
| `TaskUpdate` | Task list updates |
| `TaskGet` | Task retrieval |
| `TaskList` | Task listing |
| `TaskOutput` | Task output retrieval |
| `TaskStop` | Task cancellation |
| `NotebookEdit` | Jupyter notebook editing |

::: tip
Custom MCP tool names (e.g., `mcp__server__tool`) are also accepted. claudelint only warns on unrecognized built-in tool names.
:::

### Model Names

Valid values for `model` fields in skill and agent frontmatter.

| Value | Description |
|-------|-------------|
| `sonnet` | Claude Sonnet |
| `opus` | Claude Opus |
| `haiku` | Claude Haiku |
| `inherit` | Inherit from parent context |

> **Note:** The `model` field in `settings.json` accepts arbitrary strings (full model IDs, ARNs, aliases) and is not restricted to this enum.

### Hook Events

Valid event keys for hooks configuration. All names are PascalCase.

| Event | Description |
|-------|-------------|
| `PreToolUse` | Before a tool is executed |
| `PostToolUse` | After a tool executes successfully |
| `PostToolUseFailure` | After a tool execution fails |
| `PermissionRequest` | When a permission prompt would appear |
| `UserPromptSubmit` | When the user submits a prompt |
| `Notification` | When a notification is generated |
| `Stop` | When the agent stops |
| `SubagentStart` | When a subagent starts |
| `SubagentStop` | When a subagent stops |
| `PreCompact` | Before context compaction |
| `Setup` | During initial setup |
| `SessionStart` | When a session begins |
| `SessionEnd` | When a session ends |
| `TeammateIdle` | When a teammate agent is idle |
| `TaskCompleted` | When a task completes |

### Hook Types

Valid values for the `type` field in hook handlers.

| Type | Description |
|------|-------------|
| `command` | Executes a shell command |
| `prompt` | Sends a prompt to Claude |
| `agent` | Delegates to a named agent |

### Context Modes

Valid values for the `context` field in skill frontmatter.

| Mode | Description |
|------|-------------|
| `fork` | Run in a forked subagent (requires `agent` field) |
| `inline` | Run inline in the current context |
| `auto` | Let Claude Code decide |

### MCP Transport Types

Valid values for the `type` field in MCP server configuration.

| Type | Description |
|------|-------------|
| `stdio` | Local subprocess (default when `command` is present) |
| `sse` | Server-Sent Events (deprecated) |
| `http` | HTTP endpoint |
| `websocket` | WebSocket connection |

## JSON Schema Files

claudelint maintains JSON Schema files for IDE integration and external tooling. These are available in the [`schemas/`](https://github.com/pdugan20/claudelint/tree/main/schemas) directory:

| Schema | File | Description |
|--------|------|-------------|
| Skill frontmatter | [`skill-frontmatter.schema.json`](https://github.com/pdugan20/claudelint/blob/main/schemas/skill-frontmatter.schema.json) | SKILL.md YAML frontmatter |
| Agent frontmatter | [`agent-frontmatter.schema.json`](https://github.com/pdugan20/claudelint/blob/main/schemas/agent-frontmatter.schema.json) | Agent file YAML frontmatter |
| Hooks config | [`hooks-config.schema.json`](https://github.com/pdugan20/claudelint/blob/main/schemas/hooks-config.schema.json) | hooks.json structure |
| MCP config | [`mcp-config.schema.json`](https://github.com/pdugan20/claudelint/blob/main/schemas/mcp-config.schema.json) | .mcp.json structure |
| Plugin manifest | [`plugin-manifest.schema.json`](https://github.com/pdugan20/claudelint/blob/main/schemas/plugin-manifest.schema.json) | plugin.json structure |
| LSP config | [`lsp-config.schema.json`](https://github.com/pdugan20/claudelint/blob/main/schemas/lsp-config.schema.json) | .lsp.json structure |
| Output style | [`output-style-frontmatter.schema.json`](https://github.com/pdugan20/claudelint/blob/main/schemas/output-style-frontmatter.schema.json) | OUTPUTSTYLE.md frontmatter |
| Rules frontmatter | [`rules-frontmatter.schema.json`](https://github.com/pdugan20/claudelint/blob/main/schemas/rules-frontmatter.schema.json) | Rules file frontmatter |
| Marketplace | [`marketplace.schema.json`](https://github.com/pdugan20/claudelint/blob/main/schemas/marketplace.schema.json) | marketplace.json structure |

Running `npm run generate:json-schemas` produces auto-generated versions (from Zod schemas) in `schemas/generated/` locally. Use `npm run check:schema-sync` to verify they stay in sync with the hand-written schemas above.

## See Also

- [Validators Overview](/validators/overview) - What each validator checks
- [Types](/api/types) - TypeScript type definitions for the claudelint API
- [Configuration](/guide/configuration) - claudelint configuration options
- [Claude Code Documentation](https://code.claude.com/docs) - Official Claude Code reference
