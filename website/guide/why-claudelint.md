# Why claudelint?

claudelint validates your Claude Code project configuration to catch issues early, enforce best practices, and improve developer experience.

## The Problem

Claude Code projects involve many configuration files - CLAUDE.md, skills, settings, hooks, MCP servers, plugins, and more. Without validation:

- Typos in configuration go unnoticed until runtime
- Security issues like path traversal or eval usage slip through
- Inconsistent naming and missing metadata reduce discoverability
- Missing shebangs, versions, or changelogs cause deployment issues

## The Solution

claudelint provides <RuleCount category="total" /> validation rules across <RuleCount category="categories" /> categories, catching these issues before they reach production.

## Key Features

- **Comprehensive** - <RuleCount category="total" /> rules across CLAUDE.md, skills, settings, hooks, MCP, plugins, agents, LSP, output styles, and commands
- **Fast** - Parallel validation with smart caching for ~2.4x speedup
- **Auto-fix** - Automatically fix common issues with `--fix`
- **Configurable** - Per-rule severity, inline disables, `.claudelintrc.json` config
- **Multiple Formats** - Stylish, JSON, SARIF, and compact output
- **CI-Ready** - Exit codes, SARIF output, GitHub Actions integration
- **Monorepo Support** - Config inheritance, workspace detection, parallel validation
