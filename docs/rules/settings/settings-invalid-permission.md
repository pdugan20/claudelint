# Rule: settings-invalid-permission

**Severity**: Error
**Fixable**: No
**Validator**: Settings
**Category**: Schema Validation

Permission rules must use valid action values

## Rule Details

Permission rules control which tools Claude Code can use and under what conditions. Each permission rule must have a valid tool name from the available tools, a valid action (`allow`, `ask`, or `deny`), and if a pattern is specified, it must be non-empty.

This rule detects invalid actions (e.g., "grant", "permit"), invalid tool names (e.g., "ShellCommand"), and empty pattern strings. Permissions control access to file operations, shell commands, web access, and other tools. Invalid permission rules fall back to default permissions and may create security vulnerabilities.

### Incorrect

Invalid action:

```json
{
  "permissions": [
    {
      "tool": "Bash",
      "action": "grant"
    }
  ]
}
```

Empty pattern:

```json
{
  "permissions": [
    {
      "tool": "Bash",
      "action": "allow",
      "pattern": ""
    }
  ]
}
```

### Correct

Valid permission rules:

```json
{
  "permissions": [
    {
      "tool": "Bash",
      "action": "allow",
      "pattern": "npm *"
    },
    {
      "tool": "Write",
      "action": "ask",
      "pattern": "src/**/*.ts"
    },
    {
      "tool": "Read",
      "action": "allow"
    }
  ]
}
```

With deny rules:

```json
{
  "permissions": [
    {
      "tool": "Bash",
      "action": "allow"
    },
    {
      "tool": "Bash",
      "action": "deny",
      "pattern": "rm -rf *"
    }
  ]
}
```

## Options

This rule does not have configuration options.

## When Not To Use It

Never disable this rule. Invalid permissions cause settings to be ignored, fallback to default permissions, unexpected behavior, and security vulnerabilities. Always fix invalid permission rules rather than disabling validation.

## Related Rules

- [settings-invalid-schema](./settings-invalid-schema.md) - Settings file schema validation
- [settings-invalid-env-var](./settings-invalid-env-var.md) - Environment variable validation

## Resources

- [Implementation](../../../src/validators/settings.ts)
- [Tests](../../../tests/validators/settings.test.ts)
- [Permissions Documentation](https://github.com/anthropics/claude-code)
- [Glob Pattern Syntax](https://github.com/isaacs/node-glob#glob-primer)

## Version

Available since: v1.0.0
