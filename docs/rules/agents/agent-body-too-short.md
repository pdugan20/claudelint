# Rule: agent-body-too-short

**Severity**: Warning
**Fixable**: No
**Validator**: Agents
**Category**: Schema Validation

Agent body content should meet minimum length requirements

## Rule Details

Agents should include substantive instructions beyond frontmatter. Very short body content suggests incomplete documentation or insufficient guidance for the agent's behavior and capabilities.

The body content is measured after the frontmatter block. This rule helps ensure agents have meaningful system prompts that provide clear direction.

### Incorrect

Empty body:

```markdown
---
name: code-reviewer
description: Reviews code changes for quality and best practices
---
```

Body too short:

```markdown
---
name: code-reviewer
description: Reviews code changes for quality and best practices
---

Review code.
```

### Correct

Sufficient body content with clear instructions:

```markdown
---
name: code-reviewer
description: Reviews code changes for quality and best practices
---

# System Prompt

This agent specializes in code review. When reviewing code:

1. Check for syntax errors and potential bugs
2. Validate adherence to coding standards
3. Suggest performance improvements
4. Identify security vulnerabilities
5. Ensure proper error handling

Focus on constructive feedback and provide specific examples.
```

## How To Fix

To resolve body length issues:

1. Add a "System Prompt" section with detailed instructions
2. Document the agent's purpose, behavior, and capabilities
3. Include specific guidelines for how the agent should operate
4. Add examples of expected inputs and outputs
5. Document any constraints or limitations

The default minimum length is 50 characters, but longer, more detailed instructions are recommended for better agent performance.

## Options

This rule accepts a configuration object with the following property:

### `minLength`

Minimum number of characters required in the agent body content.

Type: `number` (positive integer)
Default: `50`

Example configuration:

```json
{
  "rules": {
    "agent-body-too-short": ["warn", { "minLength": 100 }]
  }
}
```

Schema:

```typescript
{
  minLength?: number; // positive integer
}
```

Default options:

```typescript
{
  minLength: 50
}
```

## When Not To Use It

You might reduce the `minLength` threshold for simple agents that genuinely require minimal instructions. However, most agents benefit from detailed system prompts. Consider whether your agent truly needs minimal documentation or if it would perform better with more guidance.

Never disable this rule entirely - even simple agents should have some body content explaining their purpose.

## Related Rules

- [agent-missing-system-prompt](./agent-missing-system-prompt.md) - Validates presence of "System Prompt" section

## Resources

- [Rule Implementation](../../src/rules/agents/agent-body-too-short.ts)
- [Rule Tests](../../tests/rules/agents/agent-body-too-short.test.ts)

## Version

Available since: v0.2.0
