# npm Scripts

Add claudelint to your package.json scripts for easy integration.

## Basic Setup

```json
{
  "scripts": {
    "lint:claude": "claudelint check-all",
    "lint:claude:fix": "claudelint check-all --fix"
  }
}
```

## With Other Linters

```json
{
  "scripts": {
    "lint": "npm-run-all --parallel lint:ts lint:claude",
    "lint:ts": "eslint src --ext .ts",
    "lint:claude": "claudelint check-all"
  }
}
```

## Pre-publish Validation

```json
{
  "scripts": {
    "prepublishOnly": "npm run lint:claude"
  }
}
```
