---
name: validate-skills
description: Validate Claude Code skills for schema, naming, documentation, and security. Use when you want to "check my skill", "validate skill syntax", "why isn't my skill loading", "skill errors", or "dangerous command detected". Validates SKILL.md frontmatter, allowed-tools, file references, directory organization, and shell script security.
version: 1.0.0
allowed-tools:
  - Bash
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

### Example 1: Fix skill naming

**User says**: "My skill isn't loading in Claude"
**What happens**:

1. Checks if directory name matches SKILL.md `name:` field
2. Validates kebab-case naming convention (lowercase-with-hyphens)
3. Checks for reserved words (claude, anthropic)
4. Shows correct name format

**Result**: Skill renamed correctly and loads properly in Claude Code

### Example 2: Fix tool permissions

**User says**: "Getting 'unknown tool' error"
**What happens**:

1. Validates `allowed-tools` array syntax
2. Checks each tool name against valid tools list
3. Shows correct capitalization (PascalCase: Bash, Read, Write)
4. Suggests corrections for common mistakes

**Result**: allowed-tools field corrected and skill has proper permissions

### Example 3: Security review

**User says**: "Need to validate shell scripts are safe"
**What happens**:

1. Scans scripts for dangerous commands (rm -rf, dd, mkfs)
2. Checks for eval/exec usage
3. Detects path traversal patterns
4. Suggests safer alternatives for flagged commands

**Result**: Security issues identified and resolved before deployment

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

## Configuration

Configure rules in `.claudelintrc.json`:

```json
{
  "rules": {
    "skill-missing-shebang": "warn",
    "skill-dangerous-command": "error",
    "skill-eval-usage": "error"
  }
}
```

## Exit Codes

- `0` - No errors or warnings
- `1` - Warnings found
- `2` - Errors found

## Common Issues

### Error: "Skill name must match directory name"

**Cause**: SKILL.md `name:` field doesn't match the directory name
**Solution**: Rename directory to match, or update the name field
**Example:**

```text
Directory: my-skill/
SKILL.md: name: myskill  [WRONG]

Fix: Change to name: my-skill  [CORRECT]
```

### Warning: "Unknown tool in allowed-tools: bash"

**Cause**: Tool name has incorrect capitalization
**Solution**: Tool names are case-sensitive - use PascalCase
**Valid tool names**: Bash, Read, Write, Edit, Grep, Glob, LSP, WebFetch, WebSearch, Task, TaskOutput, TaskStop, AskUserQuestion, Skill, EnterPlanMode, ExitPlanMode, NotebookEdit
**Example:**

```yaml
# Wrong:
allowed-tools: ["bash", "read"]

# Correct:
allowed-tools: ["Bash", "Read"]
```

### Error: "Dangerous command detected: rm -rf"

**Cause**: Skill contains commands that could damage the system
**Solution**: Review and remove dangerous commands, or use safer alternatives
**Dangerous patterns:**

- `rm -rf /` or `rm -rf *`
- `dd if=/dev/zero of=/dev/sda`
- `mkfs.*`
- `:(){ :|:& };:` (fork bomb)

**Safe alternatives:**

- Use specific paths: `rm -rf ./build` instead of `rm -rf *`
- Validate paths before deletion
- Use `rm -ri` for interactive confirmation

### Warning: "Shell script missing shebang"

**Cause**: Shell script doesn't start with `#!/bin/bash`
**Solution**: Add shebang as first line of script
**Example:**

```bash
#!/bin/bash
# My skill script
set -e
...
```

### Warning: "Skill lacks version field"

**Cause**: SKILL.md frontmatter doesn't include `version:`
**Solution**: Add semantic version to frontmatter
**Example:**

```yaml
---
name: my-skill
description: Does something useful
version: 1.0.0  # Add this
---
```

## See Also

- [validate](../validate/SKILL.md) - Run all validators
- [validators documentation](../../docs/validators.md) - Complete validation rules
