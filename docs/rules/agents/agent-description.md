# Rule: agent-description

**Severity**: Error
**Fixable**: No
**Validator**: Agents
**Category**: Best Practices

Agent description must be at least 10 characters, written in third person, with no XML tags

## Rule Details

The agent description field provides a brief summary of the agent's purpose and capabilities. It must be substantive, written in third person perspective, and free of XML tags.

This rule uses the `AgentFrontmatterSchema` validation to ensure descriptions follow Claude Code conventions. Third-person descriptions maintain consistency across agent documentation and provide clear, objective summaries.

### Incorrect

Too short:

```markdown
---
name: reviewer
description: Reviews
---
```

First person:

```markdown
---
name: reviewer
description: I review code changes for quality
---
```

Contains XML tags:

```markdown
---
name: reviewer
description: Reviews <code>changes</code> for quality
---
```

### Correct

Valid description in third person:

```markdown
---
name: code-reviewer
description: Reviews code changes for quality and best practices
---
```

Descriptive and informative:

```markdown
---
name: security-scanner
description: Analyzes code for security vulnerabilities and compliance issues
---
```

## How To Fix

To write valid agent descriptions:

1. **Ensure minimum length**: Write at least 10 characters, but aim for descriptive clarity (30-100 characters recommended)

2. **Use third person**: Write as if describing someone else
   - Correct: "Reviews code changes"
   - Incorrect: "I review code changes"

3. **Remove XML tags**: Use plain text only
   - Correct: "Analyzes TypeScript code for errors"
   - Incorrect: "Analyzes `TypeScript` code for errors"

4. **Be specific**: Clearly describe what the agent does
   - Good: "Generates comprehensive API documentation from source code"
   - Vague: "Helps with documentation"

## Options

This rule does not have configuration options.

## When Not To Use It

Never disable this rule. Valid descriptions are essential for:

- Agent discovery and selection
- Understanding agent capabilities
- Maintaining consistent documentation
- Integration with Claude Code UI

If a description seems too restrictive, the requirements (10+ characters, third person, no XML) are minimal and serve important purposes.

## Related Rules

- [agent-name](./agent-name.md) - Agent name format validation
- [agent-body-too-short](./agent-body-too-short.md) - Agent body content length

## Resources

- [Rule Implementation](../../src/rules/agents/agent-description.ts)
- [Rule Tests](../../tests/rules/agents/agent-description.test.ts)

## Version

Available since: v0.2.0
