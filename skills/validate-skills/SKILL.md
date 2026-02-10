---
name: validate-skills
description: Validates Claude Code skills for schema, naming, documentation, and security. Use when user asks to "check my skill", "validate skill syntax", "why isn't my skill loading", "skill errors", or "dangerous command detected". Validates SKILL.md frontmatter, allowed-tools, file references, directory organization, and shell script security.
version: 1.0.0
disable-model-invocation: true
allowed-tools:
  - Bash(claudelint:*)
  - Read
---

# Validate Claude Code Skills

Runs `claudelint validate-skills` to validate Claude Code skill directories.

## Usage

```bash
claudelint validate-skills
```

## Options

- `--path <path>` - Custom path to skills directory
- `--skill <name>` - Validate specific skill
- `--verbose` - Show detailed output
- `--warnings-as-errors` - Treat warnings as errors

## Examples

### Example 1: Skill appears in slash menu but won't execute

**User says**: "I see my skill /deploy-app in the menu but when I run it, Claude says it can't find it"
**What happens**:

1. Checks directory name is `deploy-app/` but SKILL.md has `name: deployApp`
2. Shows mismatch: directory uses kebab-case, frontmatter uses camelCase
3. Explains skill names must match directory name exactly
4. Shows fix: change frontmatter to `name: deploy-app`

**Result**: Skill executes correctly after fixing name mismatch

### Example 2: Claude won't use Bash tool even though it's needed

**User says**: "My skill script.sh needs to run bash commands but Claude says 'Tool Bash not allowed'"
**What happens**:

1. Checks SKILL.md frontmatter has `allowed-tools: ["bash", "read"]`
2. Shows tool names are case-sensitive - found lowercase "bash" instead of "Bash"
3. Lists all valid tool names with correct capitalization
4. Shows fix: `allowed-tools: ["Bash", "Read"]`

**Result**: Claude can now execute bash commands in the skill

### Example 3: Skill validation blocks git commit with "dangerous command"

**User says**: "Pre-commit hook is failing on my cleanup skill with 'dangerous command detected: rm -rf'"
**What happens**:

1. Scans cleanup.sh script, finds `rm -rf $TEMP_DIR`
2. Flags it because `$TEMP_DIR` could be empty or `/` (dangerous)
3. Suggests safer alternative: validate directory first, use explicit path
4. Shows fixed version: `[[ -n "$TEMP_DIR" && "$TEMP_DIR" != "/" ]] && rm -rf "$TEMP_DIR"`

**Result**: Skill now validates paths before deletion, commit succeeds

### Command Examples

Validate all skills:

```bash
claudelint validate-skills
```

Validate specific skill:

```bash
claudelint validate-skills --skill my-skill
```

## What Gets Validated

### Required Fields

- `name` field must match directory name
- `description` must be present
- Name must be kebab-case (lowercase with hyphens)
- Name must not exceed 64 characters

### allowed-tools Validation

- Must be an array
- Warns for unknown tools
- Accepts: Bash, Read, Write, Edit, Grep, Glob, LSP, WebFetch, WebSearch, etc.

### Model Validation

- Validates model field if present
- Accepted values: sonnet, opus, haiku

### File References

- Checks that referenced files in SKILL.md exist
- Validates relative paths

### Directory Organization

- Warns if skill has >10 loose files (suggest subdirectories)
- Warns if directory nesting >3 levels deep

### Documentation

- Warns if CHANGELOG.md is missing
- Warns if SKILL.md lacks usage examples (no code blocks)
- Warns if multi-file skill (>3 scripts) lacks README.md
- Warns if skill lacks version field

### Best Practices

- Warns if shell scripts lack shebang (#!/bin/bash)
- Warns if scripts have no explanatory comments
- Detects inconsistent naming conventions

### Security

- Errors for dangerous commands (rm -rf /, dd, mkfs)
- Warns for eval/exec usage
- Warns for path traversal patterns

## Exit Codes

- `0` - No errors or warnings
- `1` - Warnings found
- `2` - Errors found

For troubleshooting, see [common issues](./references/common-issues.md). For customization, see [configuration](./references/configuration.md).

## See Also

- [validate-all](../validate-all/SKILL.md) - Run all validators
- [optimize-cc-md](../optimize-cc-md/SKILL.md) - Optimize CLAUDE.md files
