# skill-mcp-tool-qualified-name

<RuleHeader description="MCP tools in allowed-tools should use qualified mcp__server__tool format for clarity" severity="warn" :fixable="false" category="Skills" />

## Rule Details

MCP (Model Context Protocol) tools should use the fully qualified `mcp__<server>__<tool>` naming format in the `allowed-tools` list. Unqualified tool names can be ambiguous when multiple MCP servers provide tools with similar names. This rule skips recognized built-in tools (e.g., Bash, Read, Write) and tools already using the `mcp__` prefix. Any remaining unrecognized tool name triggers a warning, as it is likely an MCP tool reference that should be fully qualified.

### Incorrect

Unqualified MCP tool name in allowed-tools

```yaml
---
name: search
description: Searches across repositories
allowed-tools:
  - Bash
  - search_code
---
```

### Correct

Fully qualified MCP tool name

```yaml
---
name: search
description: Searches across repositories
allowed-tools:
  - Bash
  - mcp__github__search_code
---
```

Only built-in tools (no MCP tools)

```yaml
---
name: lint
description: Runs linting checks
allowed-tools:
  - Bash
  - Read
  - Write
---
```

## How To Fix

Replace the unqualified tool name with the fully qualified MCP format: `mcp__<server>__<tool>`. For example, change `search_code` to `mcp__github__search_code`.

## Options

This rule does not have any configuration options.

## Related Rules

- [`skill-allowed-tools`](/rules/skills/skill-allowed-tools)
- [`skill-allowed-tools-not-used`](/rules/skills/skill-allowed-tools-not-used)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/skills/skill-mcp-tool-qualified-name.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/skills/skill-mcp-tool-qualified-name.test.ts)

## Version

Available since: v0.2.0
