# Rule: agent-missing-system-prompt

**Severity**: Warning
**Fixable**: No
**Validator**: Agents
**Category**: Best Practices

Agent should include a "System Prompt" section

## Rule Details

Agents should clearly document their system prompt or instructions in a dedicated "System Prompt" section. This section provides structured guidance for maintainability and helps other developers understand the agent's purpose and behavior.

While not strictly required (hence the warning severity), including an explicit System Prompt section is a best practice that improves agent documentation and makes it easier to locate and update instructions.

### Incorrect

Missing System Prompt section:

```markdown
---
name: code-reviewer
description: Reviews code changes for quality
---

This agent reviews code and provides feedback.
```

No heading for system prompt:

```markdown
---
name: code-reviewer
description: Reviews code changes for quality
---

Reviews code changes focusing on:
- Code quality
- Best practices
- Potential bugs
```

### Correct

Clear System Prompt section:

```markdown
---
name: code-reviewer
description: Reviews code changes for quality
---

# System Prompt

This agent specializes in code review. Review all code changes for:

1. Syntax errors and potential bugs
2. Code style and best practices
3. Performance considerations
4. Security vulnerabilities

Provide constructive feedback with specific examples.
```

With subsections:

```markdown
---
name: security-scanner
description: Scans code for security vulnerabilities
---

## System Prompt

Analyze code for security issues.

### Focus Areas

- SQL injection vulnerabilities
- XSS attack vectors
- Authentication weaknesses
- Data exposure risks

### Guidelines

Always provide severity levels and remediation steps.
```

## How To Fix

To add a proper System Prompt section:

1. Add a heading with "System Prompt" (case-insensitive):
   ```markdown
   # System Prompt
   ```
   or
   ```markdown
   ## System Prompt
   ```

2. Include detailed instructions after the heading

3. Document the agent's:
   - Primary purpose and goals
   - Behavioral guidelines
   - Constraints or limitations
   - Expected outputs or responses

## Options

This rule does not have configuration options.

## When Not To Use It

This is a warning-level rule because some agents might legitimately not need a formal "System Prompt" section:

- Very simple agents with self-explanatory body content
- Agents that are still in early development
- Agents where the entire body serves as the system prompt

However, for production agents and team collaboration, including an explicit System Prompt section is strongly recommended even if technically optional.

## Related Rules

- [agent-body-too-short](./agent-body-too-short.md) - Ensures sufficient body content
- [agent-description](./agent-description.md) - Validates description field

## Resources

- [Rule Implementation](../../src/rules/agents/agent-missing-system-prompt.ts)
- [Rule Tests](../../tests/rules/agents/agent-missing-system-prompt.test.ts)

## Version

Available since: v1.0.0
