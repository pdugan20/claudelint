# Design Philosophy

This document describes claudelint's validation philosophy, scope boundaries, and design principles.

## Overview

claudelint is designed as a dual-purpose tool:

1. **NPM Package** - Standalone CLI and library for validation
2. **Claude Code Plugin** - Interactive skills and hooks for Claude Code

Both interfaces share the same validation logic through a common core.

## Validation Philosophy

claudelint follows the **separation of concerns** pattern established by successful linter ecosystems (ESLint + Prettier, markdownlint + Vale).

### Complementary Tools, Not Comprehensive

claudelint is **not** a comprehensive linting solution. Instead, it:

- **Does one thing well** - Validates Claude-specific configurations
- **Works alongside existing tools** - Complements markdownlint, prettier, etc.
- **Avoids duplication** - Delegates generic validation to specialized tools

### Scope: Claude-Specific Validation Only

**In Scope:**

- Claude context constraints (file size limits, import depth)
- Claude-specific syntax (`@import` statements)
- Claude configuration schemas (skills frontmatter, settings, hooks)
- Claude ecosystem validation (MCP servers, plugins)
- Cross-reference integrity (files referenced actually exist)

**Out of Scope (delegate to existing tools):**

- Generic markdown formatting (MD041, MD031, etc.) - Use **markdownlint**
- Code formatting and whitespace - Use **prettier**
- Spelling and grammar - Use **Vale** or similar
- JSON/YAML syntax errors - Handled by parsers, not validated separately

### Design Principles

1. **Domain Expertise** - Focus on deep Claude knowledge, not generic rules
2. **No Conflicts** - Never overlap with existing tool responsibilities
3. **User Control** - Users configure complementary tools independently
4. **Performance** - Stay lightweight by avoiding redundant validation
5. **Ecosystem Integration** - Provide clear guidance on multi-tool setups

## Project-Scoped by Design

claudelint validates **project-level** and **plugin-level** files only. Global user configurations are explicitly out of scope.

### What's Covered

claudelint covers all project-level files (`.claude/`, `.mcp.json`, `CLAUDE.md`) and plugin-level files (`agents/`, `skills/`, `plugin.json`). See [File Discovery](/guide/file-discovery) for the complete file type reference.

**Not covered:** Global user configurations (`~/.claude/`) and runtime flags (`--agents`) are out of scope.

### Rationale

Project-scoped linting aligns with:

- **CI/CD integration** - claudelint runs in pipelines where only project files exist
- **Version control** - Project files are committed to git; global configs are personal preferences
- **Config as code** - Project config should be validated like any other committed artifact
- **Reproducibility** - Every developer working on the project sees the same validation results
