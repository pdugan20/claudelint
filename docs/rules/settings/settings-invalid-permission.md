# Rule: settings-invalid-permission

**Severity**: Error
**Fixable**: No
**Validator**: Settings
**Category**: Schema Validation

Permission rules must use valid tool names

## Rule Details

Permission rules control which tools Claude Code can use and under what conditions. Each permission rule must specify a valid tool name from the available Claude Code tools. Rules can optionally include patterns using the `Tool(pattern)` syntax.

This rule detects invalid tool names (e.g., "ShellCommand", "InvalidTool"). Permissions control access to file operations, shell commands, web access, and other tools. Invalid tool names cause settings to be ignored and may create security vulnerabilities.

Valid tool names include:

- `Bash`, `Read`, `Write`, `Edit`, `Glob`, `Grep`
- `Task`, `Skill`, `TodoWrite`, `ExitPlanMode`, `KillShell`
- `WebFetch`, `WebSearch`, `NotebookEdit`
- `mcp__*` (MCP server tools, e.g., `mcp__myserver`)

### Incorrect

Invalid tool name:

```json
{
  "permissions": {
    "allow": ["InvalidTool", "ShellCommand"]
  }
}
```

Invalid tool with pattern:

```json
{
  "permissions": {
    "deny": ["FakeTool(pattern)"]
  }
}
```

### Correct

Valid permission rules:

```json
{
  "permissions": {
    "allow": ["Bash(npm run *)", "Read(src/**/*.ts)", "Write"],
    "deny": ["Bash(rm -rf *)", "WebFetch"],
    "ask": ["Write(*.config.json)", "Edit"]
  }
}
```

With MCP server tools:

```json
{
  "permissions": {
    "allow": ["Bash", "Read", "mcp__myserver"]
  }
}
```

## How To Fix

To resolve invalid tool name errors:

1. **Check the tool name spelling**:
   - Use exact capitalization: `Bash`, not `bash` or `BASH`
   - Use official names: `Read`, not `ReadFile`

2. **Use valid Claude Code tool names**:
   - Common tools: `Bash`, `Read`, `Write`, `Edit`, `WebSearch`, `WebFetch`
   - Task tools: `Task`, `Skill`, `TodoWrite`, `ExitPlanMode`
   - Search tools: `Glob`, `Grep`
   - MCP tools: `mcp__servername` (prefix with `mcp__`)

3. **Verify pattern syntax**:
   - Valid: `"Bash(npm run *)"` - tool name with pattern
   - Valid: `"Read"` - tool name without pattern
   - Invalid: `"InvalidTool(pattern)"` - nonexistent tool

Example fix:

```json
{
  "permissions": {
    "allow": ["Bash(npm run *)", "Read", "Write"]
  }
}
```

## Options

This rule does not have configuration options.

## When Not To Use It

Never disable this rule. Invalid permissions cause settings to be ignored, fallback to default permissions, unexpected behavior, and security vulnerabilities. Always fix invalid permission rules rather than disabling validation.

## Related Rules

- [settings-invalid-schema](./settings-invalid-env-var.md) - Settings file schema validation
- [settings-invalid-env-var](./settings-invalid-env-var.md) - Environment variable validation

## Resources

- [Rule Implementation](../../src/rules/settings/settings-invalid-permission.ts)
- [Rule Tests](../../tests/rules/settings/settings-invalid-permission.test.ts)
- [Claude Code Settings Documentation](https://code.claude.com/docs/en/settings)
- [Official Settings JSON Schema](https://json.schemastore.org/claude-code-settings.json)
- [Glob Pattern Syntax](https://github.com/isaacs/node-glob#glob-primer)

## Version

Available since: v1.0.0
