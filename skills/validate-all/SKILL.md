---
name: validate-all
description: Runs comprehensive claudelint validation on all Claude Code project files. Use when user asks to "check everything", "run all validators", "full audit", "validate my entire project", or "what's wrong with my config". Validates CLAUDE.md, skills, settings, hooks, MCP servers, and plugin manifests.
version: 1.0.0
argument-hint: "[flags]"
allowed-tools:
  - Bash(claudelint:*)
---

# Validate Claude Code Project

Runs `claudelint check-all` to validate all Claude Code project files including CLAUDE.md, skills, settings, hooks, MCP servers, and plugin manifests.

## Usage

```bash
claudelint check-all $ARGUMENTS
```

## Options

Available flags:

- `--verbose` - Show detailed validation output
- `--warnings-as-errors` - Treat warnings as errors
- `--explain` - Show detailed explanations and fix suggestions
- `--format <format>` - Output format: stylish, json, compact (default: stylish)
- `--config <path>` - Path to custom config file
- `--fast` - Fast mode: skip expensive checks
- `--color` / `--no-color` - Control color output

## Examples

### Example 1: Plugin won't load after changes

**User says**: "I just updated my CLAUDE.md and added a new skill, but now my plugin isn't loading"
**What happens**:

1. Skill runs `claudelint check-all`
2. Finds CLAUDE.md exceeds 50KB (blocking issue)
3. Finds new skill has wrong capitalization in allowed-tools
4. Shows both issues need fixing before plugin will load

**Result**: User identifies why plugin broke and fixes both issues

### Example 2: Pre-commit validation failed

**User says**: "My git pre-commit hook is failing but I don't know which validator is the problem"
**What happens**:

1. Skill runs `claudelint check-all --verbose`
2. Shows validate-mcp failed: invalid transport type "sse" (deprecated)
3. Shows validate-hooks passed, validate-skills passed, etc.
4. Points to specific .mcp.json file and line number

**Result**: User fixes the one failing validator (MCP config) and commit succeeds

### Example 3: After npm install, verify everything still works

**User says**: "I just upgraded claude-code-lint, make sure I didn't break anything"
**What happens**:

1. Skill runs `claudelint check-all`
2. Detects new rules flagging previously-allowed patterns
3. Shows deprecation warnings for old syntax
4. Suggests migration path for deprecated features

**Result**: User knows what needs updating after version upgrade

### Command Examples

Basic validation:

```bash
claudelint check-all
```

Verbose output with explanations:

```bash
claudelint check-all --verbose --explain
```

JSON output for CI/CD:

```bash
claudelint check-all --format json
```

Use custom config:

```bash
claudelint check-all --config .claudelintrc.custom.json
```

Treat warnings as errors (strict mode):

```bash
claudelint check-all --warnings-as-errors
```

## What Gets Validated

The validate skill checks:

1. **CLAUDE.md files** - File size, imports, frontmatter, sections
2. **Skills** - SKILL.md schema, naming, documentation, security
3. **Settings** - settings.json schema, permissions, environment variables
4. **Hooks** - hooks.json schema, events, commands
5. **MCP Servers** - .mcp.json schema, transport config, variables
6. **Plugins** - plugin.json schema, semantic versioning, references

## Exit Codes

- `0` - No errors or warnings
- `1` - Warnings found (or warnings treated as errors)
- `2` - Errors found or fatal error (invalid config, crash)

For troubleshooting, see [common issues](./references/common-issues.md). For customization, see [configuration](./references/configuration.md).

## See Also

- [validate-cc-md](../validate-cc-md/SKILL.md) - Validate only CLAUDE.md files
- [validate-skills](../validate-skills/SKILL.md) - Validate only skills
- [validate-settings](../validate-settings/SKILL.md) - Validate only settings
- [format-cc](../format-cc/SKILL.md) - Format Claude files with prettier/markdownlint
