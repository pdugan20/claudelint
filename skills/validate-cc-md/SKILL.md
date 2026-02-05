---
name: validate-cc-md
description: Validate CLAUDE.md files for size, imports, and structure. Use when you want to "check my CLAUDE.md", "why is my CLAUDE.md too long", "validate imports", or "fix CLAUDE.md errors". Checks file size limits (30KB warning, 50KB error), @import directives, frontmatter in .claude/rules/, and section organization.
version: 1.0.0
tags:
  - validation
  - claude-code
  - linting
dependencies:
  - npm:claude-code-lint
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

### Example 1: Claude says context is too large

**User says**: "Claude keeps saying my instructions are too long and won't load them"
**What happens**:

1. Skill runs `claudelint check-claude-md`
2. Shows CLAUDE.md is 52KB (exceeds 50KB hard limit)
3. Identifies 3 largest sections: API docs (18KB), Git workflow (12KB), Testing guide (8KB)
4. Shows how to split: create .claude/rules/api.md and add `@import .claude/rules/api.md`

**Result**: User splits sections, CLAUDE.md now 28KB, Claude loads it successfully

### Example 2: Import shows "file not found" in Claude

**User says**: "I added @import .claude/rules/testing.md but Claude says the file doesn't exist"
**What happens**:

1. Skill validates @import path
2. Finds file is at `.claude/rules/tests.md` not `testing.md` (typo)
3. Also checks .claude/rules/tests.md exists and has valid frontmatter
4. Shows corrected import line

**Result**: User fixes filename typo, import loads correctly

### Example 3: Rules file won't apply to specific paths

**User says**: "My .claude/rules/backend.md isn't applying when I edit backend files"
**What happens**:

1. Skill checks frontmatter in .claude/rules/backend.md
2. Finds `paths: "backend/*"` (string) should be `paths: ["backend/**/*"]` (array with glob)
3. Explains paths field requires array of glob patterns
4. Shows corrected frontmatter

**Result**: Rules now apply to backend directory correctly

### Command Examples

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

## Common Issues

### Error: "File exceeds 50KB"

**Cause**: CLAUDE.md file is too large for Claude's context window
**Solution**: Split content into .claude/rules/ files using @import directives
**Example**: Move testing guidelines to .claude/rules/testing.md and add `@import .claude/rules/testing.md` to CLAUDE.md

### Error: "Import not found: .claude/rules/testing.md"

**Cause**: @import directive points to a file that doesn't exist
**Solution**: Check the path is correct relative to CLAUDE.md
**Common mistakes:**

- Using `@import ../rules/testing.md` (wrong - don't use ..)
- Using `@import rules/testing.md` (wrong - missing .claude/)
- Correct: `@import .claude/rules/testing.md`

### Error: "Circular import detected"

**Cause**: File A imports B which imports A (infinite loop)
**Solution**: Reorganize imports to be one-directional
**Example**: CLAUDE.md should import .claude/rules/ files, but those files should not import CLAUDE.md back

### Warning: "File exceeds 30KB"

**Cause**: File is approaching the safe limit for Claude's context
**Solution**: Not urgent, but consider splitting large sections into @imports
**Why 30KB?** Claude can handle up to ~50KB, but staying under 30KB leaves room for growth and keeps context manageable

## See Also

- [validate-all](../validate-all/SKILL.md) - Run all validators
- [format-cc](../format-cc/SKILL.md) - Format markdown files with markdownlint/prettier
