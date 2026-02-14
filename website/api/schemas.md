# Configuration Schemas

claudelint validates Claude Code configuration files against a set of schemas derived from the official Claude Code documentation. This page documents every schema claudelint enforces, including valid fields, types, constraints, and cross-field validations.

For the authoritative specification, always refer to the official docs linked in each section below.

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

## SKILL.md Frontmatter

<SchemaRef
  validator="Skills" validator-link="/validators/skills"
  docs="Skills frontmatter reference" docs-link="https://code.claude.com/docs/en/skills#frontmatter-reference"
/>

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `name` | string | yes | Lowercase with hyphens, max 64 chars, no XML tags, no reserved words (`anthropic`, `claude`) |
| `description` | string | yes | Min 10 chars, no XML tags, third-person voice |
| `argument-hint` | string | no | Hint text for skill arguments |
| `disable-model-invocation` | boolean | no | Prevent model from invoking this skill |
| `user-invocable` | boolean | no | Whether users can invoke directly via `/skill-name` |
| `version` | string | no | Semantic version (e.g., `1.0.0`) |
| `model` | string | no | `sonnet`, `opus`, `haiku`, or `inherit` |
| `context` | string | no | `fork`, `inline`, or `auto` |
| `agent` | string | no | Agent name (required when `context: fork`) |
| `allowed-tools` | string[] | no | List of tool names to allow |
| `disallowed-tools` | string[] | no | List of tool names to disallow |
| `tags` | string[] | no | Categorization tags |
| `dependencies` | string[] | no | Required skill dependencies |
| `hooks` | object | no | [Hooks configuration](#hooks-configuration) |
| `license` | string | no | License identifier |
| `compatibility` | string | no | Compatibility notes, max 500 chars |
| `metadata` | object | no | Arbitrary key-value metadata |

**Cross-field validations:**

- When `context` is `fork`, the `agent` field is required
- `allowed-tools` and `disallowed-tools` are mutually exclusive

## AGENT.md Frontmatter

<SchemaRef
  validator="Agents" validator-link="/validators/agents"
  docs="Subagent frontmatter fields" docs-link="https://code.claude.com/docs/en/sub-agents#supported-frontmatter-fields"
/>

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `name` | string | yes | Lowercase with hyphens, max 64 chars, no XML tags |
| `description` | string | yes | Min 10 chars, no XML tags, third-person voice |
| `model` | string | no | `sonnet`, `opus`, `haiku`, or `inherit` |
| `tools` | string[] | no | List of tool names to allow |
| `disallowedTools` | string[] | no | List of tool names to disallow |
| `permissionMode` | string | no | `default`, `acceptEdits`, `dontAsk`, `bypassPermissions`, or `plan` |
| `skills` | string[] | no | Skills this agent can use |
| `hooks` | object | no | [Hooks configuration](#hooks-configuration) |

**Cross-field validations:**

- `tools` and `disallowedTools` are mutually exclusive

## Hooks Configuration

<SchemaRef
  validator="Hooks" validator-link="/validators/hooks"
  docs="Hooks" docs-link="https://code.claude.com/docs/en/hooks"
/>

Hooks use an object-keyed format where each key is a [hook event](#hook-events) name (PascalCase):

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "optional-pattern",
        "hooks": [
          {
            "type": "command",
            "command": "echo 'Session started'"
          }
        ]
      }
    ]
  }
}
```

### Hook Matcher

Each event maps to an array of matcher objects:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `matcher` | string | no | Pattern to match against (e.g., tool name for PreToolUse) |
| `hooks` | object[] | yes | Array of [hook handlers](#hook-handler) |

### Hook Handler

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | yes | `command`, `prompt`, or `agent` |
| `command` | string | no | Shell command (when type is `command`) |
| `prompt` | string | no | Prompt text (when type is `prompt`) |
| `agent` | string | no | Agent name (when type is `agent`) |
| `timeout` | number | no | Timeout in milliseconds |
| `statusMessage` | string | no | Status message shown during execution |
| `once` | boolean | no | Run only once per session |
| `model` | string | no | Model override for this hook |

### Standalone hooks.json

The `.claude/hooks/hooks.json` file wraps the hooks object with an optional description:

```json
{
  "description": "Project-level hooks",
  "hooks": {
    "PreToolUse": [ ... ]
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `description` | string | no | Human-readable description |
| `hooks` | object | yes | Hooks configuration (event-keyed object) |

## MCP Configuration

<SchemaRef
  validator="MCP" validator-link="/validators/mcp"
  docs="MCP servers" docs-link="https://code.claude.com/docs/en/mcp"
/>

The `.mcp.json` file supports two formats:

**Wrapped format** (project scope):

```json
{
  "mcpServers": {
    "server-name": { ... }
  }
}
```

**Flat format** (plugin scope):

```json
{
  "server-name": { ... }
}
```

### Server Configuration by Transport

**stdio** (default when `command` is present):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | `"stdio"` | no | Optional, inferred from `command` |
| `command` | string | yes | Command to execute |
| `args` | string[] | no | Command arguments |
| `env` | object | no | Environment variables |

**http**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | `"http"` | yes | Must be `"http"` |
| `url` | string | yes | HTTP endpoint URL |
| `headers` | object | no | HTTP headers |
| `env` | object | no | Environment variables |

**sse** (deprecated):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | `"sse"` | yes | Must be `"sse"` |
| `url` | string | yes | SSE endpoint URL |
| `headers` | object | no | HTTP headers |
| `env` | object | no | Environment variables |

**websocket**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | `"websocket"` | yes | Must be `"websocket"` |
| `url` | string | yes | WebSocket URL |
| `env` | object | no | Environment variables |

## Plugin Manifest

<SchemaRef
  validator="Plugin" validator-link="/validators/plugin"
  docs="Plugin manifest schema" docs-link="https://code.claude.com/docs/en/plugins-reference#complete-schema"
/>

The `plugin.json` file lives in the `.claude-plugin/` directory.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | yes | Plugin name |
| `version` | string | no | Semantic version |
| `description` | string | no | Plugin description |
| `author` | object | no | Author info (must be an object, not a string) |
| `homepage` | string | no | Homepage URL |
| `repository` | string | no | Repository URL |
| `license` | string | no | License identifier |
| `keywords` | string[] | no | Search keywords |
| `commands` | string \| string[] | no | Path(s) to command directories |
| `agents` | string \| string[] | no | Path(s) to agent directories |
| `skills` | string \| string[] | no | Path(s) to skill directories |
| `hooks` | string \| object | no | Path to hooks file or inline hooks config |
| `mcpServers` | string \| object | no | Path to MCP config or inline server config |
| `outputStyles` | string \| string[] | no | Path(s) to output style files |
| `lspServers` | string \| object | no | Path to LSP config or inline server config |

### Plugin Author

The `author` field must be an object (string format is not supported by Claude Code):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | yes | Author name |
| `email` | string | no | Contact email |
| `url` | string | no | Author URL |

## Settings

<SchemaRef
  validator="Settings" validator-link="/validators/settings"
  docs="Settings" docs-link="https://code.claude.com/docs/en/settings"
  schema="claude-code-settings.json" schema-link="https://json.schemastore.org/claude-code-settings.json"
/>

The `settings.json` file can be located at:

- `~/.claude/settings.json` (global)
- `.claude/settings.json` (project)
- `.claude/settings.local.json` (local, gitignored)

claudelint validates the top-level structure and nested objects. Key sections include:

### Permissions

| Field | Type | Description |
|-------|------|-------------|
| `allow` | string[] | Permission patterns to auto-allow (e.g., `"Bash(npm run *)"`) |
| `deny` | string[] | Permission patterns to always deny |
| `ask` | string[] | Permission patterns to always prompt |
| `defaultMode` | string | `acceptEdits`, `bypassPermissions`, `default`, or `plan` |
| `disableBypassPermissionsMode` | string | Set to `"disable"` to prevent bypass |
| `additionalDirectories` | string[] | Extra directories to allow access to |

### Attribution

| Field | Type | Description |
|-------|------|-------------|
| `commit` | string | Commit message template |
| `pr` | string | PR description template |

### Sandbox

| Field | Type | Description |
|-------|------|-------------|
| `enabled` | boolean | Enable sandboxing |
| `autoAllowBashIfSandboxed` | boolean | Auto-allow bash in sandbox |
| `excludedCommands` | string[] | Commands excluded from sandbox |
| `allowUnsandboxedCommands` | string[] | Commands allowed outside sandbox |
| `network.allowedHosts` | string[] | Allowed network hosts |
| `network.allowedPorts` | number[] | Allowed network ports |
| `enableWeakerNestedSandbox` | boolean | Allow weaker nested sandbox |
| `ignoreViolations` | boolean | Ignore sandbox violations |

## LSP Configuration

<SchemaRef
  validator="LSP" validator-link="/validators/lsp"
  docs="LSP servers" docs-link="https://code.claude.com/docs/en/plugins-reference#lsp-servers"
/>

The `.lsp.json` file maps server names to their configurations:

```json
{
  "typescript": {
    "command": "typescript-language-server",
    "args": ["--stdio"],
    "extensionToLanguage": {
      ".ts": "typescript",
      ".tsx": "typescriptreact"
    }
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `command` | string | yes | Command to start the server |
| `extensionToLanguage` | object | yes | Map of file extensions to language IDs |
| `args` | string[] | no | Command arguments |
| `transport` | string | no | `stdio` or `socket` |
| `env` | object | no | Environment variables |
| `initializationOptions` | object | no | LSP initialization options |
| `settings` | object | no | LSP server settings |
| `workspaceFolder` | string | no | Override workspace folder path |
| `startupTimeout` | number | no | Startup timeout (ms, min 0) |
| `shutdownTimeout` | number | no | Shutdown timeout (ms, min 0) |
| `restartOnCrash` | boolean | no | Auto-restart on crash |
| `maxRestarts` | number | no | Max restart attempts (min 0) |

## Output Style Frontmatter

<SchemaRef
  validator="Output Styles" validator-link="/validators/output-styles"
  docs="Output styles" docs-link="https://code.claude.com/docs/en/output-styles#frontmatter"
/>

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | no | Display name for the style |
| `description` | string | no | Description of the style |
| `keep-coding-instructions` | boolean | no | Preserve coding instructions in output |

## Rules File Frontmatter

<SchemaRef
  docs="Path-specific rules" docs-link="https://code.claude.com/docs/en/memory#path-specific-rules"
/>

Files in `.claude/rules/` can include frontmatter to scope rules to specific paths:

```yaml
---
paths:
  - "src/**/*.ts"
  - "lib/**/*.js"
---
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `paths` | string[] | no | Glob patterns to scope the rule to (min 1 pattern if present) |

## JSON Schema Files

claudelint maintains JSON Schema files for IDE integration and external tooling. These are available in the [`schemas/`](https://github.com/pdugan20/claudelint/tree/main/schemas) directory:

| Schema | File | Description |
|--------|------|-------------|
| Skill frontmatter | [`skill-frontmatter.schema.json`](https://github.com/pdugan20/claudelint/blob/main/schemas/skill-frontmatter.schema.json) | SKILL.md YAML frontmatter |
| Agent frontmatter | [`agent-frontmatter.schema.json`](https://github.com/pdugan20/claudelint/blob/main/schemas/agent-frontmatter.schema.json) | AGENT.md YAML frontmatter |
| Hooks config | [`hooks-config.schema.json`](https://github.com/pdugan20/claudelint/blob/main/schemas/hooks-config.schema.json) | hooks.json structure |
| MCP config | [`mcp-config.schema.json`](https://github.com/pdugan20/claudelint/blob/main/schemas/mcp-config.schema.json) | .mcp.json structure |
| Plugin manifest | [`plugin-manifest.schema.json`](https://github.com/pdugan20/claudelint/blob/main/schemas/plugin-manifest.schema.json) | plugin.json structure |
| LSP config | [`lsp-config.schema.json`](https://github.com/pdugan20/claudelint/blob/main/schemas/lsp-config.schema.json) | .lsp.json structure |
| Output style | [`output-style-frontmatter.schema.json`](https://github.com/pdugan20/claudelint/blob/main/schemas/output-style-frontmatter.schema.json) | OUTPUTSTYLE.md frontmatter |
| Rules frontmatter | [`rules-frontmatter.schema.json`](https://github.com/pdugan20/claudelint/blob/main/schemas/rules-frontmatter.schema.json) | Rules file frontmatter |

Auto-generated versions (from Zod schemas) are in `schemas/generated/` and can be used to verify schema sync with `npm run check:schema-sync`.

## See Also

- [Validators Overview](/validators/overview) - What each validator checks
- [Types](/api/types) - TypeScript type definitions for the claudelint API
- [Configuration](/guide/configuration) - claudelint configuration options
- [Claude Code Documentation](https://code.claude.com/docs) - Official Claude Code reference
