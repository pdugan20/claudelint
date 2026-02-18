# Marketplace.json Spec Reference

Reference document derived from official Claude Code documentation. Used as the source of truth for fixing `MarketplaceMetadataSchema` and related rules.

## Sources

- <https://code.claude.com/docs/en/plugin-marketplaces> (primary)
- <https://code.claude.com/docs/en/plugins-reference> (plugin.json schema)
- <https://github.com/anthropics/claude-code/blob/main/.claude-plugin/marketplace.json> (15 bundled plugins)
- <https://github.com/anthropics/claude-plugins-official/blob/main/.claude-plugin/marketplace.json> (50+ plugins)

## File Location

`.claude-plugin/marketplace.json` in the marketplace repository root.

This is NOT the same as plugin.json. A marketplace repo catalogs multiple plugins. Individual plugins have `.claude-plugin/plugin.json`.

## Top-Level Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `$schema` | string | No | Validation schema URL |
| `name` | string | Yes | Marketplace identifier (kebab-case). Used in install commands: `pluginname@marketplace-name` |
| `owner` | object | Yes | Marketplace maintainer info |
| `plugins` | array | Yes | List of available plugins |
| `description` | string | No | Brief marketplace description |
| `version` | string | No | Marketplace version |
| `metadata` | object | No | Additional metadata |

### Owner Object

| Field | Type | Required |
|-------|------|----------|
| `name` | string | Yes |
| `email` | string | No |

### Metadata Object

| Field | Type | Description |
|-------|------|-------------|
| `description` | string | Brief marketplace description |
| `version` | string | Marketplace version |
| `pluginRoot` | string | Base directory prepended to relative plugin source paths |

## Plugin Entry Schema

Each entry in the `plugins` array.

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Plugin identifier (kebab-case) |
| `source` | string or object | Where to fetch the plugin |

### Optional Metadata Fields

| Field | Type | Description |
|-------|------|-------------|
| `description` | string | Brief plugin description |
| `version` | string | Plugin version (semver) |
| `author` | object | Author info (`name` required, `email` optional) |
| `homepage` | string | Documentation URL |
| `repository` | string | Source code URL |
| `license` | string | SPDX license identifier |
| `keywords` | array | Tags for discovery |
| `category` | string | Functional category |
| `tags` | array | Additional tags |
| `strict` | boolean | Whether plugin.json is authority for components (default: true) |

### Optional Component Fields

These override/supplement the plugin's own plugin.json:

| Field | Type |
|-------|------|
| `commands` | string or array |
| `agents` | string or array |
| `skills` | string or array |
| `hooks` | string, array, or object |
| `mcpServers` | string or object |
| `outputStyles` | string or array |
| `lspServers` | string or object |

## Plugin Sources

### Relative Path

```json
{ "source": "./plugins/my-plugin" }
```

Must start with `./`. Only works with git-based marketplaces.

### GitHub

```json
{
  "source": {
    "source": "github",
    "repo": "owner/repo",
    "ref": "v2.0.0",
    "sha": "a1b2c3d4..."
  }
}
```

### Git URL

```json
{
  "source": {
    "source": "url",
    "url": "https://gitlab.com/team/plugin.git",
    "ref": "main",
    "sha": "a1b2c3d4..."
  }
}
```

### npm

```json
{
  "source": {
    "source": "npm",
    "package": "package-name",
    "version": "^1.0.0",
    "registry": "https://registry.npmjs.org"
  }
}
```

### pip

```json
{
  "source": {
    "source": "pip",
    "package": "package-name",
    "version": ">=1.0.0",
    "registry": "https://pypi.org/simple"
  }
}
```

## Reserved Marketplace Names

Cannot be used by third-party marketplaces:

- `claude-code-marketplace`
- `claude-code-plugins`
- `claude-plugins-official`
- `anthropic-marketplace`
- `anthropic-plugins`
- `agent-skills`
- `life-sciences`

Names impersonating official marketplaces are also blocked.

## Real-World Example (Anthropic Bundled)

```json
{
  "$schema": "https://anthropic.com/claude-code/marketplace.schema.json",
  "name": "claude-code-plugins",
  "version": "1.0.0",
  "description": "Bundled plugins for Claude Code",
  "owner": {
    "name": "Anthropic",
    "email": "support@anthropic.com"
  },
  "plugins": [
    {
      "name": "code-review",
      "description": "Automated PR code review with multiple specialized agents",
      "version": "1.0.0",
      "author": {
        "name": "Anthropic",
        "email": "support@anthropic.com"
      },
      "source": "./plugins/code-review",
      "category": "development"
    }
  ]
}
```

## Real-World Example (External Plugin via Git URL)

```json
{
  "name": "atlassian",
  "description": "Connect to Atlassian products including Jira and Confluence",
  "category": "productivity",
  "source": {
    "source": "url",
    "url": "https://github.com/atlassian/atlassian-mcp-server.git"
  },
  "homepage": "https://github.com/atlassian/atlassian-mcp-server"
}
```

## What Our Old Schema Had (All Wrong)

These fields DO NOT exist in marketplace.json:

- `icon` -- not a field
- `screenshots` -- not a field
- `readme` -- not a field
- `changelog` -- not a field
- `author` as a flat string -- it's an object with `name`/`email` (and it's per-plugin, not top-level)
- `description` as required -- it's optional
- `version` as required semver -- it's optional
