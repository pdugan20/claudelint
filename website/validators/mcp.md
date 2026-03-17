---
description: Validate .mcp.json configuration files for transport types, URL formats, environment variable syntax, and server command validity with claudelint.
---

# MCP Servers Validator

The MCP validator checks `.mcp.json` configuration files for transport types, URLs, environment variables, and server configuration.

## What It Checks

- Transport type validity (stdio, SSE, HTTP, WebSocket)
- URL format validation per transport type
- Environment variable syntax
- Variable expansion patterns
- Command validation for stdio transport

## Rules

This validator includes <RuleCount category="mcp" /> rules. See the [MCP rules category](/rules/mcp/mcp-http-empty-url) for the complete list.

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; margin: 16px 0;">

<RuleCard
  rule-id="mcp-invalid-transport"
  description="Unknown or invalid MCP transport type"
  severity="error"
  category="MCP"
  link="/rules/mcp/mcp-invalid-transport"
/>

<RuleCard
  rule-id="mcp-stdio-empty-command"
  description="Stdio transport is missing the command field"
  severity="error"
  category="MCP"
  link="/rules/mcp/mcp-stdio-empty-command"
/>

<RuleCard
  rule-id="mcp-http-invalid-url"
  description="HTTP transport URL is malformed or invalid"
  severity="error"
  category="MCP"
  link="/rules/mcp/mcp-http-invalid-url"
/>

<RuleCard
  rule-id="mcp-invalid-env-var"
  description="Environment variable name is invalid"
  severity="warning"
  category="MCP"
  link="/rules/mcp/mcp-invalid-env-var"
/>

</div>

## CLI Usage

```bash
claudelint validate-mcp
claudelint validate-mcp --verbose
```

## Plugin Skill

If you have the [claudelint plugin](/integrations/claude-code-plugin) installed, you can run this validator inside Claude Code with `/validate-mcp` or by asking "Validate my MCP config."

## See Also

- [Claude Code MCP Servers](https://code.claude.com/docs/en/mcp) - Official MCP documentation
- [Configuration](/guide/configuration) - Customize rule severity
