# Rule: settings-permission-invalid-rule

**Severity**: Error
**Fixable**: No
**Validator**: Settings
**Category**: Schema Validation

Permission rules must use valid Tool(pattern) syntax

## Rule Details

This rule triggers when permission rules in settings.json have syntax errors or conflicting pattern specifications. Permission rules can specify patterns in two ways: inline `Tool(pattern)` syntax or separate `pattern` field, but not both.

The rule validates:
- **Pattern conflict**: Cannot specify both inline pattern and separate pattern field
- **Empty inline pattern**: `Tool()` with empty parentheses is likely a mistake

Conflicting patterns create ambiguity about which pattern should be enforced. Empty inline patterns suggest incomplete configuration.

### Incorrect

settings.json with conflicting patterns:

```json
{
  "permissions": [
    {
      "tool": "Bash(npm test)",
      "pattern": "npm.*",
      "action": "allow"
    }
  ]
}
```

settings.json with empty inline pattern:

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

### Correct

settings.json with inline pattern only:

```json
{
  "permissions": [
    {
      "tool": "Bash(npm test)",
      "action": "allow"
    }
  ]
}
```

Or with separate pattern field:

```json
{
  "permissions": [
    {
      "tool": "Bash",
      "pattern": "npm test",
      "action": "allow"
    }
  ]
}
```

## Options

This rule does not have any configuration options.

## When Not To Use It

You should not disable this rule. Malformed permission rules lead to ambiguous security policies. Fix the syntax issues to ensure permissions work as intended.

## Related Rules

- [settings-invalid-permission](./settings-invalid-permission.md) - Validates permission action and tool name
- [settings-invalid-schema](./settings-invalid-schema.md) - Validates overall settings.json structure

## Resources

- [Rule Implementation](../../src/validators/settings.ts#L85)
- [Rule Tests](../../tests/validators/settings.test.ts)

## Version

Available since: v1.0.0
