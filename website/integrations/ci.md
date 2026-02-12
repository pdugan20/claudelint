# CI/CD Integration Guide

Run `claudelint` in your CI pipeline to catch configuration issues before they reach production.

## GitHub Actions

### Basic Setup

```yaml
name: Lint Claude Config
on: [push, pull_request]

jobs:
  claudelint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - run: npm install -g claude-code-lint

      - name: Validate all configuration
        run: claudelint check-all
```

### With SARIF Upload (Inline PR Annotations)

```yaml
name: Claude Config Analysis
on: [push, pull_request]

jobs:
  claudelint:
    runs-on: ubuntu-latest
    permissions:
      security-events: write
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - run: npm install -g claude-code-lint

      - name: Run claudelint (SARIF)
        run: claudelint check-all --format sarif > results.sarif
        continue-on-error: true

      - name: Upload SARIF
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: results.sarif
```

### Selective Validators

Instead of `check-all`, run individual validators as separate steps:

```yaml
- name: Check CLAUDE.md files
  run: claudelint check-claude-md

- name: Validate skills
  run: claudelint validate-skills

- name: Validate settings
  run: claudelint validate-settings

- name: Validate hooks
  run: claudelint validate-hooks

- name: Validate MCP servers
  run: claudelint validate-mcp

- name: Validate plugin manifest
  run: claudelint validate-plugin
```

### With Caching

Add caching to speed up repeated runs:

```yaml
- name: Cache claudelint results
  uses: actions/cache@v4
  with:
    path: .claudelint-cache
    key: claudelint-${{ hashFiles('**/*.md', '**/*.json') }}
    restore-keys: claudelint-

- name: Run claudelint
  run: claudelint check-all --cache
```

## GitLab CI

```yaml
claudelint:
  image: node:20
  stage: lint
  script:
    - npm install -g claude-code-lint
    - claudelint check-all --format compact
  cache:
    key: claudelint
    paths:
      - .claudelint-cache/
  rules:
    - changes:
        - "**/*.md"
        - ".claude/**"
        - ".mcp.json"
        - "skills/**"
```

## Pre-commit (Python)

Using the [pre-commit](https://pre-commit.com/) framework:

```yaml
# .pre-commit-config.yaml
repos:
  - repo: local
    hooks:
      - id: claudelint
        name: claudelint
        language: system
        entry: npx claude-code-lint check-all
        pass_filenames: false
        files: '\.(md|json)$'
```

## Configuration

### Exit Codes

| Code | Meaning |
|------|---------|
| 0 | No issues found |
| 1 | Validation issues found |
| 2 | Configuration or runtime error |

### Useful Flags

| Flag | Description |
|------|-------------|
| `--format sarif` | SARIF output for GitHub Code Scanning |
| `--format json` | JSON output for custom processing |
| `--format compact` | One-line-per-issue for log parsing |
| `--warnings-as-errors` | Fail on warnings too |
| `--strict` | Fail on any issue (errors + warnings) |
| `--cache` | Enable result caching (default in `check-all`) |
| `--no-cache` | Disable caching |
| `--config <path>` | Custom config file path |
| `--fix` | Auto-fix fixable issues |
| `--fix-dry-run` | Preview fixes without applying |

### Configuration File

Create `.claudelintrc.json` in your project root:

```json
{
  "rules": {
    "skill-body-too-long": ["warn", { "maxLines": 600 }],
    "skill-body-word-count": ["warn", { "maxWords": 7000 }],
    "skill-description-max-length": ["warn", { "maxLength": 300 }]
  },
  "output": {
    "format": "stylish"
  }
}
```

## Monorepo Support

For monorepo projects with multiple packages:

```yaml
- name: Validate all workspaces
  run: claudelint check-all --workspaces

- name: Validate specific package
  run: claudelint check-all --workspace my-package
```
