# Rule: agent-tools

**Severity**: Error
**Fixable**: No
**Validator**: Agents
**Category**: Schema Validation

Agent tools must be an array of tool names, cannot be used with disallowed-tools

## Rule Details

The `tools` field restricts an agent to a specific allowlist of Claude Code tools. It must be formatted as an array of tool names and is mutually exclusive with the `disallowed-tools` field - you can only use one or the other, not both.

Use `tools` when you want to explicitly allow only certain tools (allowlist approach). Use `disallowed-tools` when you want to block specific tools but allow everything else (blocklist approach).

### Incorrect

Not an array:

```markdown
---
name: reader
description: Reads and analyzes files
tools: Read
---
```

Invalid object format:

```markdown
---
name: reader
description: Reads and analyzes files
tools:
  tool1: Read
  tool2: Grep
---
```

Used with disallowed-tools (mutually exclusive):

```markdown
---
name: reader
description: Reads and analyzes files
tools:
  - Read
  - Grep
disallowed-tools:
  - Edit
  - Write
---
```

### Correct

Valid tools array:

```markdown
---
name: reader
description: Reads and analyzes files without modifications
tools:
  - Read
  - Grep
  - Glob
---
```

Single tool restriction:

```markdown
---
name: bash-only
description: Only executes bash commands
tools:
  - Bash
---
```

Read-only agent:

```markdown
---
name: analyzer
description: Analyzes code without making changes
tools:
  - Read
  - Grep
  - Glob
  - LSP
---
```

## How To Fix

To fix tools configuration:

1. **Format as array**: Use YAML array syntax with hyphens

   ```yaml
   tools:
     - Read
     - Write
     - Edit
   ```

2. **Choose one approach**: Cannot use both `tools` and `disallowed-tools`
   - **Allowlist approach** (use `tools`): Specify exactly which tools are allowed
   - **Blocklist approach** (use `disallowed-tools`): Specify which tools to block, allow everything else
   - **Remove one field**: Delete either `tools` or `disallowed-tools`

3. **Use valid tool names**: Reference actual Claude Code tool names
   - Common tools: `Bash`, `Read`, `Write`, `Edit`, `Grep`, `Glob`, `WebSearch`, `LSP`, `NotebookEdit`
   - Tool names are case-sensitive

4. **Consider your use case**:
   - Use `tools` for security-sensitive agents that should only use specific tools
   - Use `disallowed-tools` for agents that need most tools except a few restricted ones

## Options

This rule does not have configuration options.

## When Not To Use It

Never disable this rule. Invalid `tools` configuration causes:

- Runtime errors when agent tries to validate tool access
- Confusing conflicts when both allowlist and blocklist are present
- Unexpected tool availability
- Security issues if restrictions aren't applied correctly

Always fix the configuration rather than disabling validation.

## Related Rules

- [agent-disallowed-tools](./agent-disallowed-tools.md) - Agent disallowed-tools field validation
- [agent-skills](./agent-skills.md) - Agent skills array validation

## Resources

- [Rule Implementation](../../src/rules/agents/agent-tools.ts)
- [Rule Tests](../../tests/rules/agents/agent-tools.test.ts)

## Version

Available since: v1.0.0
