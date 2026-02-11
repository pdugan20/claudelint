# Rule: skill-allowed-tools

**Severity**: Error
**Fixable**: No
**Validator**: Skills
**Category**: Best Practices

Skill allowed-tools must be an array of tool names, cannot be used with disallowed-tools

## Rule Details

This rule validates that when a skill includes an `allowed-tools` field in its frontmatter, it must be an array of string tool names, and that `allowed-tools` and `disallowed-tools` are not both specified (they are mutually exclusive).

The allowed-tools field restricts skill execution to only the specified Claude Code tools, providing precise control over capabilities. This is useful for security-sensitive operations, read-only skills, or limiting tool access for specific workflows.

### Incorrect

Invalid allowed-tools formats in SKILL.md frontmatter:

```markdown
---
name: read-only-skill
description: Read-only operations
allowed-tools: Read, Grep           # Comma-separated, not array
---
```

```markdown
---
name: read-only-skill
description: Read-only operations
allowed-tools: "Read"               # Single string, not array
---
```

```markdown
---
name: read-only-skill
description: Read-only operations
allowed-tools:
  - Read
  - Grep
  - 123                             # Number instead of string
---
```

Mutually exclusive with disallowed-tools:

```markdown
---
name: conflicting-skill
description: Invalid configuration
allowed-tools:
  - Read
  - Grep
disallowed-tools:                   # Cannot use both!
  - Write
  - Edit
---
```

### Correct

Valid allowed-tools array:

```markdown
---
name: read-only-skill
description: Read-only operations
allowed-tools:
  - Read
  - Grep
  - Glob
---
```

Alternative YAML syntax:

```markdown
---
name: read-only-skill
description: Read-only operations
allowed-tools: ["Read", "Grep", "Glob"]
---
```

Empty array (valid but restrictive):

```markdown
---
name: no-tools-skill
description: Pure computation, no tools
allowed-tools: []
---
```

Analysis-only skill:

```markdown
---
name: code-analyzer
description: Analyzes code without modifications
allowed-tools:
  - Read
  - Grep
  - Glob
  - LSP
---
```

## How To Fix

Fix allowed-tools configuration:

1. Convert to YAML array format
2. Ensure each tool name is a string
3. Use exact tool names (case-sensitive)
4. Remove `disallowed-tools` if present

Examples:

- `allowed-tools: Read` → `allowed-tools: ["Read"]`
- `allowed-tools: Read, Grep` → `allowed-tools: ["Read", "Grep"]`
- Remove either `allowed-tools` or `disallowed-tools` (not both)

Valid tool names include: `Bash`, `Read`, `Edit`, `Write`, `Glob`, `Grep`, `WebFetch`, `WebSearch`, `LSP`, `NotebookEdit`, `TaskCreate`, `TaskUpdate`, `TaskGet`, `TaskList`.

## Options

This rule does not have any configuration options.

## When Not To Use It

This is a critical validation rule that should rarely be disabled. Only consider disabling if:

- You're migrating from a system with different tool restriction syntax
- Tool access is managed by an external security layer
- You're testing tool restriction behavior

Fix the format rather than disabling the rule.

## Related Rules

- [skill-disallowed-tools](./skill-disallowed-tools.md) - Specify disallowed tools (mutually exclusive)
- [skill-context](./skill-context.md) - Execution context mode

## Resources

- [Rule Implementation](../../src/rules/skills/skill-allowed-tools.ts)
- [Rule Tests](../../tests/rules/skills/skill-allowed-tools.test.ts)

## Version

Available since: v1.0.0
