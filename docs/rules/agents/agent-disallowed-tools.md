# Rule: agent-disallowed-tools

**Severity**: Error
**Fixable**: No
**Validator**: Agents
**Category**: Schema Validation

Agent disallowed-tools must be an array of tool names

## Rule Details

The `disallowed-tools` field restricts which Claude Code tools an agent cannot use. It must be formatted as an array of tool names and cannot be used simultaneously with the `tools` field (they are mutually exclusive).

This field is useful for security-sensitive agents or when you want to prevent specific tool usage. For example, an agent that only reads documentation might disallow file modification tools.

### Incorrect

Not an array:

```markdown
---
name: reader
description: Reads documentation files
disallowed-tools: Edit
---
```

Invalid format:

```markdown
---
name: reader
description: Reads documentation files
disallowed-tools:
  tool1: Edit
  tool2: Write
---
```

Used with tools field (mutually exclusive):

```markdown
---
name: reader
description: Reads documentation files
tools:
  - Read
  - Bash
disallowed-tools:
  - Edit
  - Write
---
```

### Correct

Valid disallowed-tools array:

```markdown
---
name: reader
description: Reads documentation files
disallowed-tools:
  - Edit
  - Write
  - NotebookEdit
---
```

Restricting file system modifications:

```markdown
---
name: analyzer
description: Analyzes code without making changes
disallowed-tools:
  - Edit
  - Write
  - Bash
---
```

## How To Fix

To fix disallowed-tools configuration:

1. **Format as array**: Use YAML array syntax with hyphens

   ```yaml
   disallowed-tools:
     - Edit
     - Write
   ```

2. **Remove tools field**: Cannot use both `tools` and `disallowed-tools` in the same agent
   - Use `tools` to allowlist specific tools
   - Use `disallowed-tools` to blocklist specific tools
   - Never use both together

3. **Use valid tool names**: Reference actual Claude Code tool names (Bash, Read, Edit, Write, Grep, Glob, etc.)

## Options

This rule does not have configuration options.

## When Not To Use It

Never disable this rule. Invalid `disallowed-tools` configuration causes:

- Runtime errors when agent tries to validate tool access
- Unexpected tool availability
- Security issues if restrictions aren't applied correctly
- Confusion about which tools are available

Always fix the configuration rather than disabling validation.

## Related Rules

- [agent-tools](./agent-tools.md) - Agent tools field validation
- [agent-name](./agent-name.md) - Agent name format validation

## Resources

- [Rule Implementation](../../src/rules/agents/agent-disallowed-tools.ts)
- [Rule Tests](../../tests/rules/agents/agent-disallowed-tools.test.ts)

## Version

Available since: v1.0.0
