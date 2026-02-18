---
description: "Schema reference for plugin.json manifest files including all component paths and author fields."
---

# Plugin Manifest

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
| `hooks` | string \| object | no | Path to hooks file or inline [hooks config](/api/schemas/hooks) |
| `mcpServers` | string \| object | no | Path to [MCP config](/api/schemas/mcp) or inline server config |
| `outputStyles` | string \| string[] | no | Path(s) to output style files |
| `lspServers` | string \| object | no | Path to [LSP config](/api/schemas/lsp) or inline server config |

## Plugin Author

The `author` field must be an object (string format is not supported by Claude Code):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | yes | Author name |
| `email` | string | no | Contact email |
| `url` | string | no | Author URL |
