---
description: Run claudelint in GitHub Actions, GitLab CI, and other pipelines to catch Claude Code configuration errors before they reach production.
---

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

      - name: Validate with annotations
        run: claudelint check-all --format github
```

Errors and warnings appear directly on the PR diff at the relevant lines. No permissions or upload steps needed.

### Alternative Annotations

#### Problem Matcher (Stylish Format) {#problem-matcher}

If you prefer the default `stylish` format but still want PR annotations, use a problem matcher:

```yaml
- name: Register problem matcher
  run: echo "::add-matcher::.github/claudelint-problem-matcher.json"

- name: Run claudelint
  run: npx claudelint check-all
```

The problem matcher parses stylish output and converts errors/warnings into GitHub annotations. Place `.github/claudelint-problem-matcher.json` in your repo (available in the [claudelint repository](https://github.com/pdugan20/claudelint/blob/main/.github/claudelint-problem-matcher.json)).

#### SARIF Upload (Code Scanning)

Use SARIF when you need persistent results, trend tracking, or more than 50 annotations per run (GitHub limits workflow annotations to 50 per run):

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

### Optimizing CI Runs

#### Changed Files Only

Speed up PR checks by only validating files that changed:

```yaml
- name: Lint changed files only
  run: claudelint check-all --since origin/main --format github

- name: Lint uncommitted changes
  run: claudelint check-all --changed --format github
```

Use `--since <ref>` to check files changed since a git ref (ideal for PRs), or `--changed` for uncommitted changes.

#### Selective Validators

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

- name: Validate agents
  run: claudelint validate-agents

- name: Validate commands
  run: claudelint validate-commands

- name: Validate LSP config
  run: claudelint validate-lsp

- name: Validate output styles
  run: claudelint validate-output-styles
```

#### Caching

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

## Git Hooks

### Husky

Run claudelint as a git hook with [Husky](https://typicode.github.io/husky/):

```bash
npx husky init
```

Add to `.husky/pre-commit` for a fast check on every commit:

```sh
npx claudelint check-all --fast --changed --quiet
```

Add to `.husky/pre-push` for a thorough check before pushing:

```sh
npx claudelint check-all
```

### lint-staged

Run claudelint only on staged files using [lint-staged](https://github.com/lint-staged/lint-staged):

```json
{
  "lint-staged": {
    "*.md": "claudelint validate-claude-md --allow-empty-input",
    ".claude/**/*.json": "claudelint check-all --allow-empty-input"
  }
}
```

### Pre-commit (Python)

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
| `--strict` | Fail on any issue (errors + warnings + info) |
| `--max-warnings <n>` | Fail if warning count exceeds limit |
| `--allow-empty-input` | Exit 0 when no files found (useful with lint-staged) |
| `--cache` | Enable result caching (default in `check-all`) |
| `--no-cache` | Disable caching |
| `--config <path>` | Custom config file path |
| `--fix` | Auto-fix fixable issues |
| `--fix-dry-run` | Preview fixes without applying |
| `--changed` | Only check files with uncommitted changes |
| `--since <ref>` | Only check files changed since a git ref |
| `--fast` | Skip expensive checks (good for pre-commit) |
| `-o, --output-file <path>` | Write results to a file |
| `--timing` | Show per-validator timing breakdown |
| `--stats` | Include per-rule statistics in output |

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

## Monitoring Config Drift

Not every rule needs to be a hard gate. Setting rules to `warn` lets CI surface trends before they become problems — you get a heads-up in your PR checks without blocking the build.

[CLAUDE.md](/validators/claude-md) size is a good example. Claude Code performance degrades once the file exceeds 40KB, but you probably want to know well before that:

```json
{
  "rules": {
    "claude-md-size": {
      "severity": "warn",
      "options": { "maxSize": 30000 }
    }
  }
}
```

This pattern works with any configurable rule — skill body length, word counts, import depth. Set the threshold where you want the early signal, and let CI do the monitoring.

## Monorepo Support

For monorepo projects with multiple packages:

```yaml
- name: Validate all workspaces
  run: claudelint check-all --workspaces

- name: Validate specific package
  run: claudelint check-all --workspace my-package
```
