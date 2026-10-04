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
| `$schema` | string | no | JSON Schema reference URL |
| `name` | string | yes | Plugin name |
| `version` | string | no | Version string (semantic versioning is recommended) |
| `description` | string | no | Plugin description |
| `author` | object | no | [Author info](#author) (must be an object, not a string) |
| `homepage` | string | no | Homepage URL |
| `repository` | string | no | Repository URL |
| `license` | string | no | License identifier |
| `keywords` | string[] | no | Search keywords |
| `commands` | string \| object \| (string \| object)[] | no | Flat command paths or a command map; each entry has exactly one of `source` or `content` |
| `agents` | string \| string[] | no | Path(s) to agent Markdown files |
| `skills` | string \| string[] | no | Path(s) to skill directories |
| `hooks` | string \| object \| (string \| object)[] | no | Additional [hooks config](/api/schemas/hooks) paths or inline config (see [Auto-discovery](#auto-discovery)) |
| `mcpServers` | string \| object \| (string \| object)[] | no | Additional [MCP config](/api/schemas/mcp) paths or inline config (see [Auto-discovery](#auto-discovery)) |
| `outputStyles` | string \| string[] | no | Path(s) to output style files |
| `lspServers` | string \| object \| (string \| object)[] | no | Additional [LSP config](/api/schemas/lsp) paths or inline config (see [Auto-discovery](#auto-discovery)) |
| `themes` | string \| string[] | no | Color theme files/directories that appear in `/theme` alongside built-in presets |
| `monitors` | string \| object[] | no | Background Monitor configurations that start automatically when the plugin is active |
| `userConfig` | object | no | User-configurable values prompted at enable time, keyed by valid identifier names |
| `channels` | object[] | no | Channel declarations that bind to MCP servers for message injection (Telegram, Slack, Discord style) |
| `dependencies` | (string \| object)[] | no | Other plugins this plugin requires, optionally with semver version constraints |
| `displayName` | string | no | Human-readable display name |
| `defaultEnabled` | boolean | no | Initial enablement when the user has not chosen a state; default true |
| `metadata` | object | no | Free-form data for other tooling |
| `workflows` | string \| string[] | no | Workflow script files or directories |
| `experimental` | object | no | Experimental components: `themes` and `evals` paths, and a `monitors` file or inline array |
| `icon` | string | no | Plugin directory listing image path |
| `documentationUrl` | string | no | HTTPS documentation URL for the directory listing |
| `supportUrl` | string | no | HTTPS support URL for the directory listing |
| `privacyPolicyUrl` | string | no | HTTPS privacy policy URL for the directory listing |
| `termsOfServiceUrl` | string | no | HTTPS terms URL for the directory listing |
| `settings` | object | no | Plugin defaults for `agent` and command-based `subagentStatusLine` |
| `types` | string | no | Path to mod state and noun TypeScript declarations |

`userConfig` options accept `type`, `title`, `description`, `required`, `default`,
`options`, `multiple`, `sensitive`, `min`, and `max`. A fixed `options` list applies
only to a non-sensitive, single string value; labels are 1–64 characters. Supply
a listed `default` or make the selection `required`. Unknown option keys are rejected.

Command map entries accept `source` or `content`, plus `description`, `argumentHint`,
`model`, and `allowedTools`. Inline monitor entries require `name`, `command`, and
`description`; optional `when` is `always` or `on-skill-invoke:<skill>`.

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

Paths are relative to the plugin root, outside `.claude-plugin/`. Use additional paths to avoid loading default resources twice. Inline hooks use an event map; hook files use a top-level `hooks` wrapper. MCP bundle HTTPS URLs and the `skills` path `"."` are supported.

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
