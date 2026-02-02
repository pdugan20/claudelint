---
name: validate-agents-md
description: Validate CLAUDE.md files for size, imports, and structure
version: 1.0.0
allowed-tools:
  - Bash
  - Read
---

# Validate CLAUDE.md Files

Runs `claudelint check-claude-md` to validate CLAUDE.md files including:

- File size limits (30KB warning, 50KB error)
- @import directive validation
- Frontmatter validation in .claude/rules/ files
- Section organization

## Usage

```bash
claudelint check-claude-md
```

## Options

- `--path <path>` - Validate specific CLAUDE.md file
- `--verbose` - Show detailed output
- `--warnings-as-errors` - Treat warnings as errors
- `--explain` - Show detailed explanations and fix suggestions

## Examples

Validate all CLAUDE.md files:

```bash
claudelint check-claude-md
```

Validate specific file:

```bash
claudelint check-claude-md --path /path/to/CLAUDE.md
```

Verbose output with explanations:

```bash
claudelint check-claude-md --verbose --explain
```

## What Gets Validated

### File Size

- Warns if file exceeds 30KB (approaching context limit)
- Errors if file exceeds 50KB (exceeds safe context limit)
- Suggests splitting into .claude/rules/ for large files

### Import Validation

- Checks that @import directives point to existing files
- Detects circular import dependencies
- Validates import depth limits

### Frontmatter (for .claude/rules/ files)

- Validates YAML frontmatter syntax
- Checks `paths` field is string or array
- Ensures frontmatter is properly closed

### Content Organization

- Warns if CLAUDE.md has >20 sections
- Suggests moving content to .claude/rules/ for better organization

## Configuration

Rules can be configured in `.claudelintrc.json`:

```json
{
  "rules": {
    "size-error": "error",
    "size-warning": "warn",
    "import-missing": "error",
    "import-circular": "error"
  }
}
```

## Inline Disable

Disable specific rules inline:

```markdown
<!-- claudelint-disable size-warning -->

Large file content here...

<!-- claudelint-enable size-warning -->
```

Or disable for a single line:

```markdown
<!-- claudelint-disable-next-line import-missing -->

@import non-existent-file.md
```

## Exit Codes

- `0` - No errors or warnings
- `1` - Warnings found (or warnings treated as errors)
- `2` - Errors found

## See Also

- [validate](../validate/SKILL.md) - Run all validators
- [format](../format/SKILL.md) - Format markdown files with markdownlint/prettier
