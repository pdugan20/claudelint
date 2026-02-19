---
description: "Understand claudelint's validation philosophy: why it focuses exclusively on Claude-specific checks, delegates generic linting to other tools, and covers only project-scoped files."
---

# Design Philosophy

claudelint is built on a simple premise: Claude Code projects need their own linter, but that linter shouldn't try to do everything. These are the principles that guide what claudelint does and — just as importantly — what it doesn't.

## Separation of Concerns

claudelint follows the pattern established by successful linter ecosystems (ESLint + Prettier, markdownlint + Vale). It validates Claude-specific configurations and delegates everything else to specialized tools — markdownlint for markdown formatting, prettier for code style, Vale for prose quality. See the [Integrations Overview](/integrations/overview) for multi-tool setups.

claudelint enforces this through <RuleCount category="total" /> rules across <RuleCount category="categories" /> categories, all focused on Claude-specific validation:

- Context constraints (file size limits, import depth)
- Claude-specific syntax (`@import` statements)
- Configuration schemas (skills frontmatter, settings, hooks)
- Ecosystem validation (MCP servers, plugins)
- Cross-reference integrity (files referenced actually exist)

claudelint is available as both an [NPM package](/integrations/npm-scripts) for CI pipelines and npm scripts, and a [Claude Code plugin](/integrations/claude-code-plugin) for interactive use via slash commands. Both share the same validation engine and rule set.

## Project-Scoped by Design

claudelint validates **project-level** and **plugin-level** files only. Global user configurations (`~/.claude/`) and runtime flags (`--agents`) are out of scope. See [File Discovery](/guide/file-discovery) for the complete list of files and locations.

- **CI/CD integration** — claudelint runs in pipelines where only project files exist
- **Version control** — Project files are committed to git; global configs are personal preferences
- **Config as code** — Project config should be validated like any other committed artifact
- **Reproducibility** — Every developer sees the same validation results

## Guiding Principles

1. **Domain Expertise** — Focus on deep Claude knowledge, not generic rules
2. **No Conflicts** — Never overlap with existing tool responsibilities
3. **User Control** — Users configure complementary tools independently
4. **Performance** — Stay lightweight by avoiding redundant validation
5. **Ecosystem Integration** — Provide clear guidance on multi-tool setups

## See Also

- [Why claudelint?](/guide/why-claudelint) — The problem space and value proposition
- [Architecture](/development/architecture) — Internal system design and project structure
- [Rules Overview](/rules/overview) — Browse all <RuleCount category="total" /> rules by category
- [File Discovery](/guide/file-discovery) — How claudelint finds files to validate
- [Getting Started](/guide/getting-started) — Install and run your first check
