---
description: "Schema reference for .lsp.json language server configuration including commands, extensions, and options."
---

# LSP Configuration

<SchemaRef
  validator="LSP" validator-link="/validators/lsp"
  docs="LSP servers" docs-link="https://code.claude.com/docs/en/plugins-reference#lsp-servers"
/>

The `.lsp.json` file maps server names to their configurations:

```json
{
  "typescript": {
    "command": "typescript-language-server",
    "args": ["--stdio"],
    "extensionToLanguage": {
      ".ts": "typescript",
      ".tsx": "typescriptreact"
    }
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `command` | string | yes | Command to start the server |
| `extensionToLanguage` | object | yes | Map of file extensions to language IDs |
| `args` | string[] | no | Command arguments |
| `transport` | string | no | `stdio` or `socket` |
| `env` | object | no | Environment variables |
| `initializationOptions` | object | no | LSP initialization options |
| `settings` | object | no | LSP server settings |
| `workspaceFolder` | string | no | Override workspace folder path |
| `startupTimeout` | number | no | Startup timeout (ms, min 0) |
| `shutdownTimeout` | number | no | Shutdown timeout (ms, min 0) |
| `restartOnCrash` | boolean | no | Auto-restart on crash |
| `maxRestarts` | number | no | Max restart attempts (min 0) |
