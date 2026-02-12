# settings-permission-empty-pattern

<RuleHeader description="Tool(pattern) syntax should not have empty patterns" severity="warn" :fixable="false" :configurable="true" category="Settings" />

## Rule Details

This rule checks permission entries in `settings.json` across the `allow`, `deny`, and `ask` arrays for the `Tool(pattern)` syntax and warns when the pattern inside the parentheses is empty. An empty pattern like `Bash()` is likely a mistake and should either include a glob pattern like `Bash(npm test)` or be simplified to just the tool name `Bash`. Empty patterns may cause unexpected permission matching behavior.

### Incorrect

Permission with empty inline pattern

```json
{
  "permissions": {
    "allow": [
      "Bash()",
      "Write()"
    ]
  }
}
```

### Correct

Permission with a specific pattern

```json
{
  "permissions": {
    "allow": [
      "Bash(npm test)",
      "Write(src/**)"
    ]
  }
}
```

Permission without inline pattern syntax

```json
{
  "permissions": {
    "allow": [
      "Bash",
      "Write"
    ]
  }
}
```

## How To Fix

Either add a meaningful pattern inside the parentheses (e.g., `Bash(npm test)`) or remove the parentheses entirely to use the bare tool name (e.g., `Bash`).

## Options

Default options:

```json
{
  "allowEmpty": false
}
```

Allow empty inline patterns:

```json
{
  "allowEmpty": true
}
```

## When Not To Use It

Disable this rule or set `allowEmpty: true` if your permission system intentionally uses empty patterns as a wildcard syntax.

## Related Rules

- [`settings-file-path-not-found`](/rules/settings/settings-file-path-not-found)
- [`settings-invalid-env-var`](/rules/settings/settings-invalid-env-var)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/settings/settings-permission-empty-pattern.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/settings/settings-permission-empty-pattern.test.ts)

## Version

Available since: v0.2.0
