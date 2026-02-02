# Rule: settings-permission-invalid-rule

**Severity**: Error
**Fixable**: No
**Validator**: Settings
**Category**: Schema Validation

Permission rules must use valid Tool(pattern) syntax

## Rule Details

This rule validates the syntax of permission rules in settings.json. Permission rules are strings that specify tools and optional patterns using `Tool` or `Tool(pattern)` syntax.

The rule validates:

- **Unmatched parentheses**: Every opening `(` must have a matching closing `)`
- **Empty rules**: Permission rules cannot be empty strings
- **Invalid format**: Rules must use valid `Tool` or `Tool(pattern)` format

Syntax errors in permission rules cause undefined behavior and may prevent security policies from being enforced correctly.

### Incorrect

settings.json with unmatched opening parenthesis:

```json
{
  "permissions": {
    "allow": ["Bash(npm run"]
  }
}
```

settings.json with unmatched closing parenthesis:

```json
{
  "permissions": {
    "deny": ["Read)test)"]
  }
}
```

settings.json with empty rule:

```json
{
  "permissions": {
    "ask": [""]
  }
}
```

settings.json with multiple unmatched parens:

```json
{
  "permissions": {
    "allow": ["Bash((test)"]
  }
}
```

### Correct

settings.json with valid Tool syntax:

```json
{
  "permissions": {
    "allow": ["Bash", "Read", "Write"]
  }
}
```

settings.json with valid Tool(pattern) syntax:

```json
{
  "permissions": {
    "allow": ["Bash(npm run *)", "Read(src/**/*.ts)"],
    "deny": ["Bash(rm -rf *)", "WebFetch(domain:untrusted.com)"]
  }
}
```

Mixed valid formats:

```json
{
  "permissions": {
    "allow": ["Bash(npm run *)", "Read", "Write(*.json)"],
    "ask": ["Edit"]
  }
}
```

## How To Fix

To resolve permission rule syntax errors:

1. **Unmatched parentheses** - Ensure every `(` has a matching `)`:
   - Wrong: `"Bash(npm run"`
   - Right: `"Bash(npm run *)"`
   - Wrong: `"Read)test)"`
   - Right: `"Read(test)"`

2. **Empty rules** - Remove empty strings from the arrays:
   - Wrong: `"ask": ["Write", ""]`
   - Right: `"ask": ["Write"]`

3. **Verify syntax**:
   - Valid: `"Bash"` - tool name only
   - Valid: `"Bash(npm run *)"` - tool with pattern
   - Invalid: `"Bash(npm run"` - missing closing paren
   - Invalid: `"Bash((test)"` - unmatched opening paren

## Options

This rule does not have any configuration options.

## When Not To Use It

You should not disable this rule. Malformed permission rules lead to ambiguous security policies. Fix the syntax issues to ensure permissions work as intended.

## Related Rules

- [settings-invalid-permission](./settings-invalid-permission.md) - Validates permission action and tool name
- [settings-invalid-schema](./settings-invalid-env-var.md) - Validates overall settings.json structure

## Resources

- [Rule Implementation](../../src/rules/settings/settings-permission-invalid-rule.ts)
- [Rule Tests](../../tests/validators/settings.test.ts)

## Version

Available since: v1.0.0
