# agent-name-filename-mismatch

<RuleHeader description="Agent name must match filename" severity="error" :fixable="false" :configurable="false" category="Agents" />

## Rule Details

This rule checks that the `name` field in agent frontmatter exactly matches the filename (without the `.md` extension). For example, an agent at `.claude/agents/code-reviewer.md` must have `name: code-reviewer` in its frontmatter. This consistency ensures agents are discoverable and prevents confusion when the filename and configuration disagree about the agent identity.

### Incorrect

Agent name does not match filename (file at .claude/agents/code-reviewer.md)

```yaml
---
name: review-agent
description: Reviews code for quality
---
```

### Correct

Agent name matches filename (file at .claude/agents/code-reviewer.md)

```yaml
---
name: code-reviewer
description: Reviews code for quality
---
```

## How To Fix

Either rename the file to match the agent name, or update the `name` field in frontmatter to match the filename (without the `.md` extension).

## Options

This rule does not have any configuration options.

## Related Rules

- [`agent-name`](/rules/agents/agent-name)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/agents/agent-name-filename-mismatch.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/agents/agent-name-filename-mismatch.test.ts)

## Version

Available since: v0.2.0
