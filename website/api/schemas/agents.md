---
description: "Schema reference for agent file YAML frontmatter fields, types, and constraints."
---

# Agent Frontmatter

<SchemaRef
  validator="Agents" validator-link="/validators/agents"
  docs="Subagent frontmatter fields" docs-link="https://code.claude.com/docs/en/sub-agents#supported-frontmatter-fields"
/>

Agent files are flat `.md` files (e.g., `.claude/agents/code-reviewer.md`). The YAML frontmatter configures the agent; the file body is the system prompt.

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | yes | Lowercase with hyphens, max 64 chars |
| `description` | string | yes | Min 10 chars, third-person voice |
| `model` | string | no | Alias (`sonnet`, `opus`, `haiku`, `inherit`) or full model ID (e.g. `claude-opus-4-6`) |
| `tools` | string[] | no | [Tool names](/api/schemas#tool-names) to allow |
| `disallowedTools` | string[] | no | [Tool names](/api/schemas#tool-names) to disallow |
| `permissionMode` | string | no | [Permission mode](/api/schemas#permission-modes): `default`, `acceptEdits`, `auto`, `dontAsk`, `bypassPermissions`, or `plan` |
| `skills` | string[] | no | Skills this agent can use |
| `hooks` | object | no | [Hooks configuration](/api/schemas/hooks) |
| `memory` | string | no | `user`, `project`, or `local` |
| `effort` | string | no | [Effort level](/api/schemas#effort-levels): `low`, `medium`, `high`, `xhigh`, or `max` |
| `maxTurns` | number | no | Maximum agent turns (positive integer) |
| `mcpServers` | (string\|object)[] | no | MCP server references or inline definitions |
| `color` | string | no | [Display color](/api/schemas#agent-colors): `red`, `blue`, `green`, `yellow`, `purple`, `orange`, `pink`, or `cyan` |
| `background` | boolean | no | Run as background task (default: `false`) |
| `isolation` | string | no | `worktree` — run in a temporary git worktree |
| `initialPrompt` | string | no | Auto-submitted as the first user turn when this agent runs as the main session agent (via `--agent` or the `agent` setting). Prepended to any user-provided prompt |

**Cross-field validations:**

- `tools` and `disallowedTools` are mutually exclusive

## Example

```yaml
---
name: code-reviewer
description: Reviews code changes for quality, security, and best practices.
model: sonnet
tools:
  - Read
  - Glob
  - Grep
color: blue
---
```
