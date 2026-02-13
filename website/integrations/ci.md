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
      - uses: actions/checkout@v6

      - uses: actions/setup-node@v6
        with:
          node-version: '20'

      - run: npm install -g claude-code-lint

      - name: Validate all configuration
        run: claudelint check-all
```

### GitHub Actions Annotations {#github-actions-annotations}

Use `--format github` to get inline annotations on PR diffs with no extra setup:

```yaml
name: Lint Claude Config
on: [push, pull_request]

jobs:
  claudelint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6

      - uses: actions/setup-node@v6
        with:
          node-version: '20'

      - run: npm install -g claude-code-lint

      - name: Validate with annotations
        run: claudelint check-all --format github
```

Errors and warnings appear directly on the PR diff at the relevant lines. No permissions or upload steps needed.

::: tip When to use `github` vs `sarif`
`--format github` is the simplest option — annotations appear immediately with no extra config. Use `--format sarif` with Code Scanning upload when you need persistent results, trend tracking, or more than 50 annotations per run (GitHub limits workflow annotations to 50 per run).
:::

### Problem Matcher (Stylish Format) {#problem-matcher}

If you prefer the default `stylish` format but still want PR annotations, use a problem matcher. Copy the matcher file from the claudelint repo:

```yaml
- name: Register problem matcher
  run: echo "::add-matcher::.github/claudelint-problem-matcher.json"

- name: Run claudelint
  run: npx claudelint check-all
```

The problem matcher parses stylish output and converts errors/warnings into GitHub annotations. Place `.github/claudelint-problem-matcher.json` in your repo (available in the [claudelint repository](https://github.com/pdugan20/claudelint/blob/main/.github/claudelint-problem-matcher.json)).

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
      - uses: actions/checkout@v6

      - uses: actions/setup-node@v6
        with:
          node-version: '20'

      - run: npm install -g claude-code-lint

      - name: Run claudelint (SARIF)
        run: claudelint check-all --format sarif > results.sarif
        continue-on-error: true

      - name: Upload SARIF
        uses: github/codeql-action/upload-sarif@v4
        with:
          sarif_file: results.sarif
```

### Selective Validators

Instead of `check-all`, run individual validators as separate steps:

```yaml
- name: Check CLAUDE.md files
  run: claudelint validate-claude-md

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
  uses: actions/cache@v5
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
| `--format github` | GitHub Actions annotations (inline on PR diffs) |
| `--format sarif` | SARIF output for GitHub Code Scanning |
| `--format json` | JSON output for custom processing |
| `--format compact` | One-line-per-issue for log parsing |
| `-q, --quiet` | Suppress warnings, show only errors |
| `--warnings-as-errors` | Fail on warnings too |
| `--strict` | Fail on any issue (errors + warnings) |
| `--allow-empty-input` | Exit 0 when no files found (useful with lint-staged) |
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
