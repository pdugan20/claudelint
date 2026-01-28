# Rule: rule-id

**Severity**: Error | Warning
**Fixable**: Yes | No
**Validator**: Skills | Hooks | MCP | Plugin | Settings | CLAUDE.md | Agents | Commands | LSP | Output Styles
**Category**: Security | Best Practices | Schema Validation | Cross-Reference | File System

Brief one-sentence description of what this rule does.

## Rule Details

Detailed explanation of when this rule triggers and why it exists (2-3 sentences).

The rule helps developers by [explain benefit]. This prevents [explain problems it solves].

### Incorrect

Code that violates this rule:

```language
# Bad example
```

### Correct

Code that follows this rule:

```language
# Good example
```

## How To Fix

Brief step-by-step remediation:

1. First step
2. Second step (if applicable)
3. Third step (if applicable)

Or use claudelint auto-fix:

```bash
claudelint check-all --fix
```

## Options

This rule has the following options:

### `option1`

Description of option (if rule has configurable options).

```json
{
  "rules": {
    "rule-id": ["error", { "option1": true }]
  }
}
```

Or state: "This rule does not have any configuration options."

## When Not To Use It

Brief guidance on scenarios where you might want to disable this rule.

## Related Rules

- [related-rule-1](./related-rule-1.md) - Brief description of relationship
- [related-rule-2](./related-rule-2.md) - Brief description of relationship

## Resources

- [Rule Implementation](../../src/validators/validator-name.ts#L123)
- [Rule Tests](../../tests/validators/validator-name.test.ts#L456)
- [Claude Code Documentation](https://github.com/anthropics/claude-code)

## Version

Available since: v1.0.0

---

## Documentation Guidelines

**Line Count Targets:**
- Simple rules (no options, basic check): 80-120 lines
- Complex rules (multiple options, nuanced logic): 150-250 lines

**Example Guidelines:**
- Maximum 2 incorrect examples
- Maximum 2 correct examples
- Use language-specific syntax highlighting (not `text`)
- Keep examples concise and focused

**Section Guidelines:**
- Rule Details: 2-3 sentences + examples (not multiple subsections)
- How To Fix: Keep brief (3-5 steps max)
- Options: Only if rule has configurable options
- When Not To Use It: Brief guidance (2-3 sentences)
- Related Rules: 2-5 max with brief context

**What to Avoid:**
- Multiple organization/pattern sections
- Separate "Benefits" or "Why It Matters" sections (include in Rule Details)
- Excessive examples (1-2 per concept maximum)
- Redundant explanations across sections
- Migration steps unless absolutely necessary

**What to Include:**
- Clear metadata badges at top
- Concise but complete Rule Details
- Actionable "How To Fix" section
- Source code links for contributors
