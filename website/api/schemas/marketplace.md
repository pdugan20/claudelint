---
description: "Schema reference for marketplace.json plugin catalog including owner, plugin entries, and source types."
---

# Marketplace Metadata

<SchemaRef
  validator="Plugin" validator-link="/validators/plugin"
  docs="Plugin marketplaces" docs-link="https://code.claude.com/docs/en/plugin-marketplaces#marketplace-schema"
/>

The `marketplace.json` file lives in `.claude-plugin/` and defines a plugin catalog for distribution.

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `$schema` | string | no | Schema URL for IDE validation |
| `name` | string | yes | Marketplace name |
| `description` | string | no | Marketplace description |
| `version` | string | no | Marketplace version |
| `owner` | object | yes | [Owner info](#owner) |
| `plugins` | array | yes | Array of [plugin entries](#plugin-entry) |
| `metadata` | object | no | Extra metadata (`pluginRoot`, etc.) |

## Owner

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | yes | Owner name |
| `email` | string | no | Contact email |

## Plugin Entry

Each entry in the `plugins` array:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | yes | Plugin name |
| `source` | string \| object | yes | Relative path or [source object](#plugin-source) |
| `description` | string | no | Plugin description |
| `version` | string | no | Plugin version |
| `author` | object | no | Author info (`name`, `email`) |
| `homepage` | string | no | Homepage URL |
| `repository` | string | no | Repository URL |
| `license` | string | no | License identifier |
| `keywords` | string[] | no | Search keywords |
| `category` | string | no | Plugin category |
| `tags` | string[] | no | Categorization tags |
| `strict` | boolean | no | Enable strict mode |

## Plugin Source

The `source` field can be a relative path string or an object:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `source` | string | yes | `github`, `url`, `npm`, or `pip` |
| `repo` | string | no | GitHub `owner/repo` (for `github`) |
| `url` | string | no | Git URL (for `url`) |
| `package` | string | no | Package name (for `npm`/`pip`) |
| `version` | string | no | Version constraint |
| `registry` | string | no | Custom registry URL |
| `ref` | string | no | Git ref (tag, branch, commit) |
| `sha` | string | no | Git commit SHA for pinning |

## Example

```json
{
  "name": "my-marketplace",
  "owner": { "name": "Dev Team" },
  "plugins": [
    {
      "name": "code-review",
      "source": "./plugins/code-review",
      "description": "Automated code review",
      "version": "1.0.0",
      "category": "development"
    },
    {
      "name": "external-plugin",
      "source": { "source": "github", "repo": "owner/repo", "ref": "v2.0.0" }
    }
  ]
}
```
