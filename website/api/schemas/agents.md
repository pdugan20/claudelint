---
description: "Schema reference for agent file YAML frontmatter fields, types, and constraints."
---

# Agent Frontmatter

<SchemaRef
  validator="Agents" validator-link="/validators/agents"
  docs="Subagent frontmatter fields" docs-link="https://code.claude.com/docs/en/sub-agents#supported-frontmatter-fields"
/>

Agent files are flat `.md` files (e.g., `.claude/agents/code-reviewer.md`). The file body is the system prompt.

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `name` | string | yes | Lowercase with hyphens, max 64 chars, no XML tags |
| `description` | string | yes | Min 10 chars, no XML tags, third-person voice |
| `model` | string | no | `sonnet`, `opus`, `haiku`, or `inherit` ([valid values](/api/schemas#model-names)) |
| `tools` | string[] | no | List of [tool names](/api/schemas#tool-names) to allow |
| `disallowedTools` | string[] | no | List of [tool names](/api/schemas#tool-names) to disallow |
| `permissionMode` | string | no | `default`, `acceptEdits`, `dontAsk`, `bypassPermissions`, `plan`, or `delegate` |
| `skills` | string[] | no | Skills this agent can use |
| `hooks` | object | no | [Hooks configuration](/api/schemas/hooks) |
| `memory` | string | no | `user`, `project`, or `local` |
| `maxTurns` | number | no | Maximum agent turns (positive integer) |
| `mcpServers` | string[] | no | MCP servers available to the agent |
| `color` | string | no | `blue`, `cyan`, `green`, `yellow`, `magenta`, `red`, or `pink` |

## Cross-Field Validations

- `tools` and `disallowedTools` are mutually exclusive
