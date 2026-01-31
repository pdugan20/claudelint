# Rule: settings-invalid-env-var

**Severity**: Warning
**Fixable**: No
**Validator**: Settings
**Category**: Schema Validation

Environment variables must follow naming conventions

## Rule Details

Environment variables in settings must follow the pattern `/^[A-Z_][A-Z0-9_]*$/` (uppercase with underscores) and shouldn't have empty values. Variables with names containing "secret", "key", "token", or "password" should use variable expansion `${VAR}` instead of hardcoded values to prevent committing secrets.

This rule detects invalid naming (lowercase, camelCase, mixed case, hyphens), empty or whitespace-only values, and hardcoded secrets in sensitive variable names. Values under 10 characters aren't flagged as secrets to avoid false positives.

### Incorrect

Invalid naming:

```json
{
  "env": {
    "api_key": "value",
    "nodeEnv": "production"
  }
}
```

Empty values:

```json
{
  "env": {
    "API_KEY": "",
    "DATABASE_URL": "   "
  }
}
```

Hardcoded secrets:

```json
{
  "env": {
    "API_KEY": "sk-1234567890abcdef",
    "DATABASE_PASSWORD": "MySecretPass123"
  }
}
```

### Correct

Proper naming with variable expansion:

```json
{
  "env": {
    "API_KEY": "${API_KEY}",
    "NODE_ENV": "development",
    "DATABASE_URL": "${DATABASE_URL}",
    "DEBUG": "true"
  }
}
```

Non-sensitive literal values:

```json
{
  "env": {
    "NODE_ENV": "production",
    "LOG_LEVEL": "info",
    "PORT": "3000",
    "ENABLE_CACHE": "true"
  }
}
```

## How To Fix

To resolve environment variable errors:

1. **Invalid naming** - Convert to SCREAMING_SNAKE_CASE:
   - `api_key` → `API_KEY`
   - `nodeEnv` → `NODE_ENV`
   - `database-url` → `DATABASE_URL`

2. **Empty values** - Either:
   - Remove the variable entirely if not needed
   - Use variable expansion: `"${VAR_NAME}"`
   - Provide a valid default value

3. **Hardcoded secrets** - Use variable expansion:
   - `"API_KEY": "sk-123..."` → `"API_KEY": "${API_KEY}"`
   - `"PASSWORD": "secret"` → `"PASSWORD": "${DATABASE_PASSWORD}"`
   - Store actual values in system environment variables or `.env` files (gitignored)

4. **Verify naming convention**:
   - Start with uppercase letter or underscore
   - Use only uppercase letters, numbers, and underscores
   - No hyphens, lowercase, or camelCase

Example fix:

```json
{
  "env": {
    "NODE_ENV": "production",
    "API_KEY": "${API_KEY}",
    "DATABASE_URL": "${DATABASE_URL}",
    "LOG_LEVEL": "info"
  }
}
```

## Options

This rule does not have configuration options.

## When Not To Use It

Consider disabling if your organization uses different naming conventions (not recommended) or you have non-sensitive values that trigger false positives. However, following standard conventions and avoiding hardcoded secrets benefits all projects.

## Related Rules

- [settings-invalid-schema](./settings-invalid-env-var.md) - Settings file schema validation
- [settings-invalid-permission](./settings-invalid-permission.md) - Permission rule validation

## Resources

- [Rule Implementation](../../src/rules/settings/settings-invalid-env-var.ts)
- [Rule Tests](../../tests/rules/settings/settings-invalid-env-var.test.ts)
- [Environment Variable Best Practices](https://12factor.net/config)
- [Secrets Management Guide](https://owasp.org/www-community/vulnerabilities/Use_of_hard-coded_password)

## Version

Available since: v1.0.0
