# settings-invalid-env-var

<RuleHeader description="Environment variables must follow naming conventions" severity="warn" :fixable="false" category="Settings" />

## Rule Details

This rule checks the `env` object in `settings.json` for three issues: (1) environment variable names that do not follow the `UPPER_CASE_WITH_UNDERSCORES` convention (must start with a letter and contain only uppercase letters, digits, and underscores), (2) empty or whitespace-only values, and (3) potential hardcoded secrets in variables whose names contain "secret", "key", "token", or "password". Secrets should use variable expansion syntax instead of plain text values.

### Incorrect

Lowercase env var name and empty value

```json
{
  "env": {
    "myApiUrl": "https://api.example.com",
    "EMPTY_VAR": ""
  }
}
```

Hardcoded secret value

```json
{
  "env": {
    "API_SECRET_KEY": "sk-abc123def456ghi789"
  }
}
```

### Correct

Proper env var naming with variable expansion for secrets

```json
{
  "env": {
    "API_URL": "https://api.example.com",
    "API_SECRET_KEY": "${CLAUDE_API_KEY}"
  }
}
```

## How To Fix

Rename environment variables to use `UPPER_CASE_WITH_UNDERSCORES` format. Remove or provide values for empty entries. For sensitive values, use variable expansion syntax like `${SYSTEM_ENV_VAR}` instead of hardcoding secrets.

## Options

This rule does not have any configuration options.

## Related Rules

- [`settings-file-path-not-found`](/rules/settings/settings-file-path-not-found)
- [`settings-permission-empty-pattern`](/rules/settings/settings-permission-empty-pattern)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/settings/settings-invalid-env-var.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/settings/settings-invalid-env-var.test.ts)

## Version

Available since: v0.2.0
