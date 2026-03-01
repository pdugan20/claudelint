---
description: "Explore claudelint's internal architecture: the validation pipeline, rules vs validators, project structure, and key subsystems."
---

# Architecture

This document describes the internal architecture of claudelint for contributors. For the project's validation philosophy, scope boundaries, and design principles, see [Design Philosophy](/development/design-philosophy).

## System Overview

claudelint runs all validators in parallel, each executing its category's rules against discovered files, then aggregates and formats the results.

<PipelineDiagram />

## Rules vs Validators

claudelint uses a **rule-based architecture** inspired by ESLint. Understanding the distinction between rules and validators is critical for contributors.

### Rules

Rules are what contributors write. They are individual, focused validation checks located in [`src/rules/{category}/{rule-id}.ts`](https://github.com/pdugan20/claudelint/tree/main/src/rules/).

**Characteristics:**

- **<RuleCount category="total" /> rules total** organized into <RuleCount category="categories" /> categories (ClaudeMd, Skills, Settings, Hooks, MCP, Plugin, Agents, Output Styles, LSP, Commands)
- **User-configurable** - Can be enabled/disabled, severity changed per-project
- **Self-contained** - Each rule validates one specific aspect
- **Metadata-driven** - Include id, name, description, severity, fixable flag
- **ESLint-style** - Similar pattern to ESLint rules

### Validators

Validators are internal orchestrators — classes in `src/validators/` that collect and run rules.

**Characteristics:**

- **10 validators** (one per category)
- **Not user-facing** - Users interact with rules, not validators
- **Implementation detail** - Orchestrate file discovery, parsing, rule execution
- **Extend FileValidator or SchemaValidator** - Share common validation infrastructure

See the [Validators reference](/validators/overview) for details on each validator.

## Validation Pipeline

A `claudelint check-all` invocation flows through these stages:

### Configuration

The CLI loads configuration from `.claudelintrc.json` (if present), merging CLI flags, config file settings, and default values. Config controls which rules are enabled, severity overrides, and options like `--fix` and `--cache`. See the [Configuration Guide](/guide/configuration) for resolution order.

### File Discovery

Each validator declares file patterns (e.g., `SKILL.md`, `.mcp.json`). Validators discover matching files in the project directory, respecting `.gitignore` and path filters. See [File Discovery](/guide/file-discovery) for the complete list.

### Parallel Execution

All enabled validators run concurrently via `Promise.all()`. Each validator independently:

1. Finds files matching its patterns
2. Reads and parses file contents (Markdown, JSON, YAML)
3. Executes its category's rules via `executeRulesForCategory()`
4. Aggregates results

Total wall-clock time equals the slowest validator, not the sum.

### Rule Execution

Each rule receives a `RuleContext` with the file path, content, and user-configured options. Rules call `context.report()` to emit violations with messages, line numbers, and optional auto-fixes. See the [Rule System](/development/rule-system) for implementation patterns.

### Result Formatting

Results are formatted for output. Built-in formatters: `stylish` (default table), `json`, `compact`, `sarif`, and `github` (for PR annotations). Custom formatters can be loaded by path. See the [API Formatters docs](/api/formatters) for details.

### Exit Code

- **0** — No errors or warnings
- **1** — Warnings found (or errors with `--warnings-as-errors`)
- **2** — Errors found

## Project Structure

```text
claudelint/
├── src/
│   ├── api/               # Programmatic API (ClaudeLint class, formatters)
│   ├── cli/               # CLI commands (Commander.js)
│   ├── rules/             # Validation rules (auto-discovered)
│   │   ├── claude-md/     # CLAUDE.md rules
│   │   ├── skills/        # Skills rules
│   │   ├── settings/      # Settings rules
│   │   ├── hooks/         # Hooks rules
│   │   ├── mcp/           # MCP rules
│   │   ├── plugin/        # Plugin rules
│   │   ├── agents/        # Agents rules
│   │   ├── lsp/           # LSP rules
│   │   ├── output-styles/ # Output Styles rules
│   │   └── commands/      # Commands rules
│   ├── schemas/           # Zod schemas for frontmatter validation
│   ├── types/             # TypeScript types and interfaces
│   ├── validators/        # Validator orchestrators
│   └── utils/             # Shared utilities
├── tests/                 # Test files
├── skills/                # Claude Code plugin skills
├── .claude-plugin/        # Plugin manifest and metadata
├── website/               # VitePress documentation site
├── scripts/               # Build and automation scripts
└── schemas/               # Generated JSON schemas
```

## Key Subsystems

### API Layer

claudelint exposes both a CLI and a [programmatic API](/api/overview) that share the same validation engine. The API in [`src/api/`](https://github.com/pdugan20/claudelint/tree/main/src/api) provides a class-based interface (`ClaudeLint`) and functional utilities (`lint`, `lintText`, `formatResults`), making claudelint embeddable in other tools, editors, and CI scripts.

### Schema Layer

Zod schemas in [`src/schemas/`](https://github.com/pdugan20/claudelint/tree/main/src/schemas) define the expected structure of skill frontmatter, agent frontmatter, output style frontmatter, and other configuration formats. [Schema-delegating rules](/development/rule-system#schema-delegating-rules) wrap these schemas as thin validators, keeping validation logic in one place while making each check individually configurable.

### Caching

The [`ValidationCache`](/development/internals#caching) caches results keyed by validator name. Cache entries are invalidated when the claudelint version, configuration, or file modification times change. Enable with `--cache` or the `cache` config option.

### Diagnostic Collection

Library code uses [`DiagnosticCollector`](/development/internals#diagnostic-collection) instead of `console` directly. This keeps the library testable, supports programmatic usage, and provides structured diagnostics with source tracking.

## See Also

- [Rule System](/development/rule-system) — Rule interface, implementation patterns, and registries
- [Internals](/development/internals) — Caching, parallel execution, and CLI implementation details
- [Custom Rules](/development/custom-rules) — Build your own validation rules
- [Contributing](/development/contributing) — Contribution guidelines and rule checklist
