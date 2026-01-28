# Rule: settings-invalid-env-var

**Severity**: Warning
**Fixable**: No
**Validator**: Settings
**Category**: Security

Validates that environment variables use proper naming conventions (UPPERCASE_WITH_UNDERSCORES) and don't contain hardcoded secrets.

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

1. **Fix naming**: Convert to UPPERCASE_WITH_UNDERSCORES (e.g., `apiKey` → `API_KEY`, `node_env` → `NODE_ENV`)
2. **Remove empty values**: Delete variables with empty strings or only whitespace
3. **Use variable expansion for secrets**: Replace hardcoded values with `${VAR}` for sensitive variables
4. **Set actual values in environment**: Use `.env` files locally (gitignored), hosting platform settings in production
5. **Use short literals for non-secrets**: Non-sensitive config values can be literal strings

**Valid Names:**

- `API_KEY`, `NODE_ENV`, `DATABASE_URL`, `DEBUG`, `_PRIVATE_VAR`, `API_KEY_V2`

**Invalid Names:**

- `api_key` (lowercase), `apiKey` (camelCase), `Api_Key` (mixed), `API-KEY` (hyphens)

**Sensitive Variable Names (require expansion):**

- Contains `secret`: `API_SECRET`, `CLIENT_SECRET`, `SECRET_KEY`
- Contains `key`: `API_KEY`, `PRIVATE_KEY`, `ACCESS_KEY`
- Contains `token`: `AUTH_TOKEN`, `API_TOKEN`, `BEARER_TOKEN`
- Contains `password`: `DB_PASSWORD`, `USER_PASSWORD`, `ADMIN_PASSWORD`

**Setting Values:**

```bash
# .env file (local, gitignored)
API_KEY=sk-1234567890abcdef
DATABASE_URL=postgresql://localhost/mydb

# Or export in shell
export API_KEY="sk-1234567890abcdef"
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
