# agent-missing-system-prompt

<RuleHeader description="Agent should include a &quot;System Prompt&quot; section" severity="warn" :fixable="false" category="Agents" />

## Rule Details

This rule checks that AGENT.md files contain a heading matching "System Prompt" (case-insensitive, levels 1-3). A dedicated system prompt section provides clear, maintainable behavioral instructions for the agent. Without it, the agent may lack the structured guidance needed for consistent responses. The rule scans the body content (after frontmatter) using a regex pattern for headings like `# System Prompt`, `## System Prompt`, or `### System Prompt`.

### Incorrect

Agent file without a System Prompt section

```markdown
---
name: code-review
description: Reviews code for quality
---

## Instructions

Review all code changes carefully.
```

### Correct

Agent file with a System Prompt section

```markdown
---
name: code-review
description: Reviews code for quality
---

## System Prompt

You are a code review agent. Analyze code changes for correctness, performance, and maintainability.
```

## How To Fix

Add a markdown heading titled "System Prompt" (at level 1, 2, or 3) followed by the agent behavioral instructions. For example: `## System Prompt`.

## Options

This rule does not have any configuration options.

## When Not To Use It

Disable this rule if your project uses a different convention for naming the agent instructions section.

## Related Rules

- [`agent-body-too-short`](/rules/agents/agent-body-too-short)
- [`agent-name`](/rules/agents/agent-name)
- [`agent-description`](/rules/agents/agent-description)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/agents/agent-missing-system-prompt.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/agents/agent-missing-system-prompt.test.ts)

## Version

Available since: v0.2.0
