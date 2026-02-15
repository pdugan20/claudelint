# Configuration

Create a `.claudelintrc.json` file to customize validation:

```json
{
  "rules": {
    "claude-md-size": "warn",
    "claude-md-import-missing": "error"
  },
  "output": {
    "format": "stylish",
    "verbose": false
  }
}
```

See [configuration docs](../../../docs/configuration.md) for full options.

## Ignoring Files

Create a `.claudelintignore` file to exclude files:

```text
# Test fixtures
fixtures/
**/*.test.md

# Generated files
**/*.generated.ts
```

## Integration

Add to package.json scripts:

```json
{
  "scripts": {
    "lint:claude": "claudelint check-all",
    "lint:claude:fix": "claudelint format --fix"
  }
}
```

Add to pre-commit hooks:

```bash
#!/bin/sh
claudelint check-all --warnings-as-errors
```
