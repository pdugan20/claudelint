# Official Claude Code Configuration Specs

Quick reference for the official format of each Claude Code configuration file, distilled from Anthropic repos and documentation.

## Official Documentation

| Config File | Docs URL |
|-------------|----------|
| Settings | <https://code.claude.com/docs/en/settings> |
| Hooks | <https://code.claude.com/docs/en/hooks> |
| MCP | <https://code.claude.com/docs/en/mcp> |
| Output Styles | <https://code.claude.com/docs/en/output-styles> |
| Plugins | <https://code.claude.com/docs/en/plugins-reference> |
| Settings JSON Schema | <https://json.schemastore.org/claude-code-settings.json> |

## Anthropic Example Repos

| Repo | Contents |
|------|----------|
| [anthropics/claude-code](https://github.com/anthropics/claude-code) | 12+ official plugins (hooks, skills, agents, MCP) |
| [anthropics/claude-cookbooks](https://github.com/anthropics/claude-cookbooks) | Example projects, CLAUDE.md files, output styles |
| [anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official) | 29+ marketplace plugins, 14 .mcp.json files |

## hooks.json

**Location:** `.claude/hooks/hooks.json`

**Format:** Object keyed by event name, with nested matcher groups and hook handlers.

```json
{
  "description": "Optional description",
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash|Write",
        "hooks": [
          {
            "type": "command",
            "command": "echo 'check'",
            "timeout": 10
          }
        ]
      }
    ]
  }
}
```

**Event names:** PreToolUse, PostToolUse, PostToolUseFailure, PermissionRequest, UserPromptSubmit, Notification, Stop, SubagentStart, SubagentStop, PreCompact, Setup, SessionStart, SessionEnd, TeammateIdle, TaskCompleted

**Hook types:** command, prompt, agent

**Handler fields:** `type` (required), `command`/`prompt`/`agent` (one required per type), `timeout` (optional), `statusMessage` (optional), `once` (optional), `model` (optional)

**Matcher:** Optional string (tool name or pipe-separated pattern). When omitted, hook runs for all tool uses of that event.

## .mcp.json

**Location:** `.mcp.json` (project root) or `.claude/.mcp.json`

**Formats:** Two accepted formats, both valid:

Wrapped (project scope):

```json
{
  "mcpServers": {
    "server-name": {
      "command": "npx",
      "args": ["-y", "@example/mcp-server"]
    }
  }
}
```

Flat (plugin scope, most common in Anthropic repos):

```json
{
  "server-name": {
    "command": "npx",
    "args": ["-y", "@example/mcp-server"]
  }
}
```

**Transport types:** stdio (default when `command` present), http, sse, websocket

**Server fields:** `command` + `args` (stdio), `url` + `headers` (http/sse/websocket), `env` (all types), `type` (optional for stdio)

## settings.json

**Location:** `.claude/settings.json` or `.claude/settings.local.json`

**Key fields:** `permissions` (`allow`/`deny`/`ask` arrays), `model`, `hooks` (same object-keyed format as hooks.json), `attribution` (`commit`/`pr` template strings), `sandbox`, `env`, `apiKeyHelper`, `statusLine`, `outputStyle`, `enabledPlugins`

**Attribution format:**

```json
{
  "attribution": {
    "commit": "Co-Authored-By: Claude <noreply@anthropic.com>",
    "pr": "Generated with Claude Code"
  }
}
```

**Sandbox fields:** `enabled`, `autoAllowBashIfSandboxed`, `excludedCommands`, `allowUnsandboxedCommands`, `network` (object with `allowedHosts`/`allowedPorts`), `enableWeakerNestedSandbox`, `ignoreViolations`

## Output Styles

**Location:** `.claude/output-styles/*.md` (hyphen-separated directory, any `.md` filename)

**Format:** Markdown file with style guidelines. Filename becomes the style name.

## plugin.json

**Location:** `.claude-plugin/plugin.json`

**Required fields:** `name`

**Author format:** Must be object `{ "name": "...", "email": "...", "url": "..." }` (name required, email/url optional). String format is not supported.

**Component paths:** `commands`, `agents`, `skills`, `hooks`, `mcpServers`, `outputStyles`, `lspServers` (string or array)

## SKILL.md

**Location:** `skills/<skill-name>/SKILL.md`

**Frontmatter fields:** `name` (required), `description` (required), `version`, `tags`, `allowed-tools`, `argument-hint`, `disable-model-invocation`, `model`

## AGENT.md

**Location:** `.claude/agents/<agent-name>/AGENT.md` or `agents/<agent-name>.md`

**Frontmatter fields:** `name` (required), `description` (required), `tools`, `model`, `hooks` (object-keyed format), `color`
