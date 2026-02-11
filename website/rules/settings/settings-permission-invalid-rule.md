# Rule: settings-permission-invalid-rule

**Severity**: Error
**Fixable**: No
**Validator**: Settings
**Recommended**: Yes

Permission rules must use valid Tool(pattern) syntax

## Rule Details

This rule checks the syntax of permission rule strings in settings.json. Each rule must be either a plain tool name like "Bash" or a tool name with a pattern like "Bash(npm run *)". It detects unmatched parentheses, empty rule strings, and malformed patterns. Incorrect syntax prevents the permission system from matching commands properly, which can lead to unexpected access behavior.

### Incorrect

Permission rule with unmatched parentheses

```json
{
  "permissions": {
    "allow": ["Bash(npm run build"]
  }
}
```

Empty permission rule string

```json
{
  "permissions": {
    "deny": [""]
  }
}
```

### Correct

Valid permission rules with proper syntax

```json
{
  "permissions": {
    "allow": ["Bash(npm run *)", "Read", "WebFetch(domain:example.com)"]
  }
}
```

## How To Fix

Ensure each permission rule uses the format "Tool" or "Tool(pattern)". Check for matched parentheses and non-empty values. Remove any trailing or leading whitespace.

## Options

This rule does not have any configuration options.

## Related Rules

- [`settings-invalid-permission`](/rules/settings/settings-invalid-permission)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/settings/settings-permission-invalid-rule.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/settings/settings-permission-invalid-rule.test.ts)

## Version

Available since: v1.0.0
