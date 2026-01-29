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

## Options

This rule does not have configuration options.

## When Not To Use It

Consider disabling if your organization uses different naming conventions (not recommended) or you have non-sensitive values that trigger false positives. However, following standard conventions and avoiding hardcoded secrets benefits all projects.

## Related Rules

- [settings-invalid-schema](./settings-invalid-schema.md) - Settings file schema validation
- [settings-invalid-permission](./settings-invalid-permission.md) - Permission rule validation

## Resources

- [Implementation](../../../src/validators/settings.ts)
- [Tests](../../../tests/validators/settings.test.ts)
- [Environment Variable Best Practices](https://12factor.net/config)
- [Secrets Management Guide](https://owasp.org/www-community/vulnerabilities/Use_of_hard-coded_password)

## Version

Available since: v1.0.0
