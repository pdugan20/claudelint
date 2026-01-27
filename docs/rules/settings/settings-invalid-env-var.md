# Invalid Environment Variable

Environment variable name or value is invalid.

## Rule Details

This rule enforces that environment variables in `settings.json` follow proper naming conventions and don't contain security risks. Environment variables should use uppercase names with underscores and shouldn't contain hardcoded secrets.

This rule checks for:

- **Invalid naming**: Variables should be `UPPERCASE_WITH_UNDERSCORES`
- **Empty values**: Variables shouldn't have empty or whitespace-only values
- **Hardcoded secrets**: Variables containing "secret", "key", "token", or "password" shouldn't have plaintext values

**Category**: Settings
**Severity**: warning
**Fixable**: No
**Since**: v1.0.0

### Violation Examples

Invalid naming (lowercase):

```json
{
  "env": {
    "api_key": "value",   Should be uppercase
    "nodeEnv": "production"   Should use underscores
  }
}
```

Invalid naming (mixed case):

```json
{
  "env": {
    "ApiKey": "value",   Should be all uppercase
    "Node_Env": "production"   Should be all uppercase
  }
}
```

Empty values:

```json
{
  "env": {
    "API_KEY": "",   Empty value
    "DATABASE_URL": "   "   Whitespace only
  }
}
```

Hardcoded secrets:

```json
{
  "env": {
    "API_KEY": "sk-1234567890abcdef",   Hardcoded secret
    "DATABASE_PASSWORD": "MySecretPass123",   Hardcoded password
    "AUTH_TOKEN": "Bearer xyz123"   Hardcoded token
  }
}
```

### Correct Examples

Proper naming:

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

Variable expansion for secrets:

```json
{
  "env": {
    "API_KEY": "${API_KEY}",
    "SECRET_TOKEN": "${SECRET_TOKEN}",
    "DB_PASSWORD": "${DB_PASSWORD}"
  }
}
```

Non-sensitive values:

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

## Naming Convention

### Valid Names

Environment variables must match: `/^[A-Z_][A-Z0-9_]*$/`

**Valid examples:**

```text
API_KEY           Uppercase with underscores
NODE_ENV          Uppercase
DATABASE_URL      Multiple words
DEBUG             Single word
_PRIVATE_VAR      Leading underscore allowed
API_KEY_V2        Numbers allowed
```

**Invalid examples:**

```text
api_key           Lowercase
apiKey            camelCase
Api_Key           Mixed case
API-KEY           Hyphens not allowed
2FA_TOKEN         Can't start with number
API KEY           Spaces not allowed
```

## Security: Variable Expansion

For sensitive values, use variable expansion instead of hardcoding:

### Hardcoded (insecure)

```json
{
  "env": {
    "API_KEY": "sk-1234567890abcdef"   Secret exposed in config
  }
}
```

### Variable expansion (secure)

```json
{
  "env": {
    "API_KEY": "${API_KEY}"   References environment variable
  }
}
```

Then set the actual value in your shell:

```bash
export API_KEY="sk-1234567890abcdef"
```

## How To Fix

### Option 1: Fix naming

```json
# Before - invalid naming
{
  "env": {
    "apiKey": "value",
    "node_env": "production"
  }
}

# After - correct naming
{
  "env": {
    "API_KEY": "value",
    "NODE_ENV": "production"
  }
}
```

### Option 2: Remove empty values

```json
# Before - empty values
{
  "env": {
    "API_KEY": "",
    "DEBUG": "true"
  }
}

# After - remove empty or set value
{
  "env": {
    "DEBUG": "true"
  }
}
```

### Option 3: Use variable expansion for secrets

```json
# Before - hardcoded secret
{
  "env": {
    "API_KEY": "sk-1234567890abcdef",
    "PASSWORD": "MySecretPass123"
  }
}

# After - variable expansion
{
  "env": {
    "API_KEY": "${API_KEY}",
    "PASSWORD": "${PASSWORD}"
  }
}
```

Then set in your environment:

```bash
export API_KEY="sk-1234567890abcdef"
export PASSWORD="MySecretPass123"
```

### Option 4: Use short values for non-secrets

```json
# Before - flagged as possible secret (long value)
{
  "env": {
    "API_KEY": "public"   Short value, not flagged
  }
}

# After - if genuinely not a secret
{
  "env": {
    "NODE_ENV": "production",
    "DEBUG": "false"
  }
}
```

Note: Values under 10 characters aren't flagged as hardcoded secrets.

## Sensitive Variable Names

These variable names trigger secret detection:

- Contains `secret`: `API_SECRET`, `CLIENT_SECRET`, `SECRET_KEY`
- Contains `key`: `API_KEY`, `PRIVATE_KEY`, `ACCESS_KEY`
- Contains `token`: `AUTH_TOKEN`, `API_TOKEN`, `BEARER_TOKEN`
- Contains `password`: `DB_PASSWORD`, `USER_PASSWORD`, `ADMIN_PASSWORD`

For these variables, use variable expansion `${VAR}` instead of hardcoding values.

## Best Practices

1. **Use SCREAMING_SNAKE_CASE**: All environment variables should be uppercase with underscores

2. **Never commit secrets**: Always use variable expansion for sensitive values

3. **Document variables**: Add comments in your README about required environment variables

4. **Use .env files locally**: Store actual values in `.env` files (and gitignore them)

   ```bash
   # .env (gitignored)
   API_KEY=sk-1234567890abcdef
   DATABASE_URL=postgresql://localhost/mydb
   ```

5. **Set in production**: Use your hosting platform's environment variable settings

   ```bash
   # Heroku
   heroku config:set API_KEY=sk-1234567890abcdef

   # Docker
   docker run -e API_KEY=sk-1234567890abcdef myapp

   # GitHub Actions
   # Set in repository secrets UI
   ```

## Example Configurations

### Development setup

```json
{
  "env": {
    "NODE_ENV": "development",
    "DEBUG": "true",
    "LOG_LEVEL": "verbose",
    "API_KEY": "${API_KEY}",
    "DATABASE_URL": "${DATABASE_URL}"
  }
}
```

### Production setup

```json
{
  "env": {
    "NODE_ENV": "production",
    "DEBUG": "false",
    "LOG_LEVEL": "error",
    "API_KEY": "${API_KEY}",
    "DATABASE_URL": "${DATABASE_URL}",
    "SECRET_KEY": "${SECRET_KEY}"
  }
}
```

### Testing setup

```json
{
  "env": {
    "NODE_ENV": "test",
    "DEBUG": "false",
    "API_KEY": "${TEST_API_KEY}",
    "DATABASE_URL": "${TEST_DATABASE_URL}"
  }
}
```

## Options

This rule does not have any configuration options.

## When Not To Use It

You might disable this rule if:

- Your organization uses different naming conventions (though this is not recommended)
- You're using placeholder values temporarily during development
- You have non-sensitive values that trigger false positives

However, following standard conventions and avoiding hardcoded secrets benefits all projects.

## Configuration

To disable this rule:

```json
{
  "rules": {
    "settings-invalid-env-var": "off"
  }
}
```

To escalate to an error:

```json
{
  "rules": {
    "settings-invalid-env-var": "error"
  }
}
```

## Related Rules

- [settings-invalid-schema](./settings-invalid-schema.md) - Settings file schema validation
- [settings-invalid-permission](./settings-invalid-permission.md) - Permission rule validation

## Resources

- [Environment Variable Best Practices](https://12factor.net/config)
- [Secrets Management Guide](https://owasp.org/www-community/vulnerabilities/Use_of_hard-coded_password)
- [.env file format](https://github.com/motdotla/dotenv)

## Version

Available since: v1.0.0
