# Rule: settings-permission-empty-pattern

**Severity**: Warning
**Fixable**: No
**Validator**: Settings
**Category**: Best Practices

Tool(pattern) syntax should not have empty patterns

## Rule Details

When using inline `Tool(pattern)` syntax in permission rules, the pattern should not be empty. Empty patterns `Tool()` suggest incomplete configuration and don't provide any filtering benefit over using just the tool name.

This rule detects permission rules with empty inline patterns in the `allow`, `deny`, or `ask` arrays. Empty patterns make the syntax more confusing without adding functionality, since `"Bash()"` is equivalent to `"Bash"` but less clear.

### Incorrect

Empty inline pattern:

```json
{
  "permissions": {
    "allow": ["Bash()"]
  }
}
```

Multiple rules with empty patterns:

```json
{
  "permissions": {
    "allow": ["Read()"],
    "deny": ["Write()"],
    "ask": ["Edit()"]
  }
}
```

Empty pattern with whitespace:

```json
{
  "permissions": {
    "deny": ["Bash(   )"]
  }
}
```

### Correct

Remove empty parentheses:

```json
{
  "permissions": {
    "allow": ["Bash", "Read", "Write"]
  }
}
```

Add a pattern to filter specific commands:

```json
{
  "permissions": {
    "allow": ["Bash(npm run *)", "Read(src/**/*.ts)"]
  }
}
```

Mix of tools with and without patterns:

```json
{
  "permissions": {
    "allow": ["Bash(npm run *)", "Read", "Write(*.json)"],
    "deny": ["Bash(rm -rf *)"]
  }
}
```

## How To Fix

To fix empty inline patterns:

1. **Remove the empty parentheses**: `"Bash()"` → `"Bash"`

   ```json
   {
     "permissions": {
       "allow": ["Bash", "Read"]
     }
   }
   ```

2. **Or add a pattern** if you want to filter specific operations:

   ```json
   {
     "permissions": {
       "allow": ["Bash(npm run *)", "Read(src/**)"]
     }
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
