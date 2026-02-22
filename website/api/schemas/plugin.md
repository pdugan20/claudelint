---
description: "Schema reference for plugin.json manifest files including all component paths and author fields."
---

# Plugin Manifest

<SchemaRef
  validator="Plugin" validator-link="/validators/plugin"
  docs="Plugin manifest schema" docs-link="https://code.claude.com/docs/en/plugins-reference#complete-schema"
/>

The `plugin.json` file lives in the `.claude-plugin/` directory and declares the plugin's components.

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | yes | Plugin name |
| `version` | string | no | Semantic version |
| `description` | string | no | Plugin description |
| `author` | object | no | [Author info](#author) (must be an object, not a string) |
| `homepage` | string | no | Homepage URL |
| `repository` | string | no | Repository URL |
| `license` | string | no | License identifier |
| `keywords` | string[] | no | Search keywords |
| `commands` | string \| string[] | no | Path(s) to command directories |
| `agents` | string \| string[] | no | Path(s) to agent directories |
| `skills` | string \| string[] | no | Path(s) to skill directories |
| `hooks` | string \| string[] \| object | no | Additional [hooks config](/api/schemas/hooks) paths or inline config (see [Auto-discovery](#auto-discovery)) |
| `mcpServers` | string \| string[] \| object | no | Additional [MCP config](/api/schemas/mcp) paths or inline config (see [Auto-discovery](#auto-discovery)) |
| `outputStyles` | string \| string[] | no | Path(s) to output style files |
| `lspServers` | string \| string[] \| object | no | Additional [LSP config](/api/schemas/lsp) paths or inline config (see [Auto-discovery](#auto-discovery)) |

## Author

The `author` field must be an object (string format is not supported):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | yes | Author name |
| `email` | string | no | Contact email |
| `url` | string | no | Author URL |

## Auto-discovery

Claude Code automatically loads components from default locations in the plugin root. The `hooks`, `mcpServers`, and `lspServers` fields in plugin.json are for **additional** files beyond these defaults:

- **Hooks** — `hooks/hooks.json` (loaded automatically)
- **MCP** — `.mcp.json` (loaded automatically)
- **LSP** — `.lsp.json` (loaded automatically)

Specifying the default location in plugin.json (e.g., `"hooks": "./hooks/hooks.json"`) causes a duplicate error. Only use these fields to reference files at non-default paths.

## Example

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "A Claude Code plugin for automated testing",
  "author": {
    "name": "Dev Team",
    "email": "dev@example.com"
  },
  "skills": "./skills/",
  "hooks": "./config/extra-hooks.json",
  "mcpServers": "./config/extra-mcp.json"
}
```
