---
description: "Schema reference for .mcp.json MCP server configuration including all transport types."
---

# MCP Configuration

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

## Server Configuration by Transport

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

See [MCP Transport Types](/api/schemas#mcp-transport-types) for the full list of valid transport values.
