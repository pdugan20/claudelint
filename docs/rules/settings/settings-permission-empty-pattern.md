# Rule: settings-permission-empty-pattern

**Severity**: Warning
**Fixable**: No
**Validator**: Settings
**Category**: Best Practices

Tool(pattern) syntax should not have empty patterns

## Rule Details

When using inline `Tool(pattern)` syntax in permission rules, the pattern should not be empty. Empty patterns `Tool()` suggest incomplete configuration and don't provide any filtering benefit over using just the tool name.

This rule detects permission rules with empty inline patterns. Empty patterns make the syntax more confusing without adding functionality, since `Bash()` is equivalent to `Bash` but less clear.

### Incorrect

Empty inline pattern:

```json
{
  "permissions": [
    {
      "tool": "Bash()",
      "action": "allow"
    }
  ]
}
```

Multiple rules with empty patterns:

```json
{
  "permissions": [
    {
      "tool": "Read()",
      "action": "allow"
    },
    {
      "tool": "Write()",
      "action": "ask"
    }
  ]
}
```

### Correct

Remove empty parentheses:

```json
{
  "permissions": [
    {
      "tool": "Bash",
      "action": "allow"
    }
  ]
}
```

Add a pattern:

```json
{
  "permissions": [
    {
      "tool": "Bash(npm *)",
      "action": "allow"
    }
  ]
}
```

Use separate pattern field:

```json
{
  "permissions": [
    {
      "tool": "Bash",
      "pattern": "npm *",
      "action": "allow"
    }
  ]
}
```

## How To Fix

To fix empty inline patterns:

1. **Remove the empty parentheses**: `"tool": "Bash()"` → `"tool": "Bash"`

2. **Or add a pattern** if you want to filter:

   ```json
   {
     "tool": "Bash(npm *)",
     "action": "allow"
   }
   ```

3. **Or use separate pattern field** for clarity:

   ```json
   {
     "tool": "Bash",
     "pattern": "npm *",
     "action": "allow"
   }
   ```

The empty parentheses syntax provides no benefit - either add a pattern to filter specific commands, or remove the parentheses entirely.

## Options

This rule has the following configuration options:

### `allowEmpty`

Allow empty inline patterns in Tool(pattern) syntax. When enabled, rules like `Bash()` or `Read()` will not trigger warnings.

**Type**: `boolean`
**Default**: `false`

**Schema**:

```typescript
{
  allowEmpty: boolean
}
```

**Example configuration**:

```json
{
  "rules": {
    "settings-permission-empty-pattern": ["warn", { "allowEmpty": true }]
  }
}
```

**Note**: Empty patterns provide no functional benefit over using just the tool name. This option should only be used if you have a specific need for placeholder patterns in your configuration.

## When Not To Use It

This rule helps maintain clean, clear permission syntax. There's no good reason to disable it - always fix empty patterns rather than disabling the warning.

## Related Rules

- [settings-permission-invalid-rule](./settings-permission-invalid-rule.md) - Validates Tool(pattern) syntax conflicts
- [settings-invalid-permission](./settings-invalid-permission.md) - Validates permission actions and tool names

## Resources

- [Rule Implementation](../../src/rules/settings/settings-permission-empty-pattern.ts)
- [Rule Tests](../../tests/rules/settings/settings-permission-empty-pattern.test.ts)

## Version

Available since: v1.0.0
