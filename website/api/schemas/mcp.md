---
description: "Schema reference for .mcp.json MCP server configuration including all transport types."
---

# MCP Configuration

<SchemaRef
  validator="MCP" validator-link="/validators/mcp"
  docs="MCP servers" docs-link="https://code.claude.com/docs/en/mcp"
/>

The `.mcp.json` file configures Model Context Protocol servers. It supports a wrapped format (`{ "mcpServers": { ... } }`) for project scope or a flat format (`{ "server-name": { ... } }`) for plugin scope.

## Fields

Server configuration varies by [transport type](/api/schemas#mcp-transport-types).

### stdio

Default transport when `command` is present.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | no | Optional, inferred from `command` |
| `command` | string | yes | Command to execute |
| `args` | string[] | no | Command arguments |
| `env` | object | no | Environment variables |

### http

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | yes | Must be `"http"` |
| `url` | string | yes | HTTP endpoint URL |
| `headers` | object | no | HTTP headers |
| `env` | object | no | Environment variables |

### sse (deprecated)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | yes | Must be `"sse"` |
| `url` | string | yes | SSE endpoint URL |
| `headers` | object | no | HTTP headers |
| `env` | object | no | Environment variables |

### websocket

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | yes | Must be `"websocket"` |
| `url` | string | yes | WebSocket URL |
| `env` | object | no | Environment variables |

## Example

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    },
    "analytics": {
      "type": "http",
      "url": "https://mcp.example.com/analytics"
    }
  }
}
```
