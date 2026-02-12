# Rule: skill-disallowed-tools

**Severity**: Error
**Fixable**: No
**Validator**: Skills
**Category**: Best Practices

Skill disallowed-tools must be an array of tool names

## Rule Details

This rule validates that when a skill includes a `disallowed-tools` field in its frontmatter, it must be an array of string tool names. The disallowed-tools field restricts which Claude Code tools cannot be used during skill execution, providing control over skill capabilities and preventing unsafe operations.

The field is optional, but when present must be a properly formatted YAML array of strings. Each string should be a valid tool name like `Bash`, `Edit`, `Write`, etc. Invalid formats will trigger this rule.

### Incorrect

Invalid disallowed-tools formats in SKILL.md frontmatter:

```markdown
---
name: read-only-skill
description: Read-only operations
disallowed-tools: Edit, Write, Bash    # Comma-separated, not array
---
```

```markdown
---
name: read-only-skill
description: Read-only operations
disallowed-tools: "Edit"               # Single string, not array
---
```

```markdown
---
name: read-only-skill
description: Read-only operations
disallowed-tools:
  - Edit
  - Write
  - 123                                # Number instead of string
---
```

### Correct

Valid disallowed-tools array:

```markdown
---
name: read-only-skill
description: Read-only operations
disallowed-tools:
  - Edit
  - Write
  - Bash
---
```

Alternative YAML syntax:

```markdown
---
name: read-only-skill
description: Read-only operations
disallowed-tools: ["Edit", "Write", "Bash"]
---
```

Empty array (valid but not useful):

```markdown
---
name: safe-skill
description: No restrictions
disallowed-tools: []
---
```

Common tool restrictions:

```markdown
---
name: analysis-only
description: Analyzes code without modifications
disallowed-tools:
  - Edit
  - Write
  - Bash
  - NotebookEdit
---
```

## How To Fix

Convert the disallowed-tools field to a properly formatted array:

1. Use YAML array syntax with dashes or brackets
2. Ensure each tool name is a string
3. Use exact tool names (case-sensitive)
4. List only tools you want to prevent

Examples:

- `disallowed-tools: Edit` → `disallowed-tools: ["Edit"]`
- `disallowed-tools: Edit, Write` → `disallowed-tools: ["Edit", "Write"]`

Valid tool names include: `Bash`, `Read`, `Edit`, `Write`, `Glob`, `Grep`, `WebFetch`, `WebSearch`, `LSP`, `NotebookEdit`, `TaskCreate`, `TaskUpdate`, `TaskGet`, `TaskList`.

## Options

This rule does not have any configuration options.

## When Not To Use It

This is a critical validation rule that should rarely be disabled. Only consider disabling if:

- You're migrating from a system with different tool restriction syntax
- Tool restrictions are managed by an external configuration
- You're testing tool restriction behavior

Fix the format rather than disabling the rule.

## Related Rules

- [skill-allowed-tools](./skill-allowed-tools.md) - Specify allowed tools (mutually exclusive)
- [skill-context](./skill-context.md) - Execution context mode

## Resources

- [Rule Implementation](../../src/rules/skills/skill-disallowed-tools.ts)
- [Rule Tests](../../tests/rules/skills/skill-disallowed-tools.test.ts)

## Version

Available since: v0.2.0
