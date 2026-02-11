# Rule: agent-name-directory-mismatch

**Severity**: Error
**Fixable**: No
**Validator**: Agents
**Recommended**: Yes

Agent name must match parent directory name

## Rule Details

This rule checks that the `name` field in AGENT.md frontmatter exactly matches the name of the directory containing the file. For example, an agent at `.claude/agents/code-review/AGENT.md` must have `name: code-review` in its frontmatter. This consistency ensures agents are discoverable by directory traversal and prevents confusion when the file system and configuration disagree about an agent identity.

### Incorrect

Agent name does not match directory (file at .claude/agents/code-review/AGENT.md)

```yaml
---
name: review-agent
description: Reviews code for quality
---
```

### Correct

Agent name matches directory (file at .claude/agents/code-review/AGENT.md)

```yaml
---
name: code-review
description: Reviews code for quality
---
```

## How To Fix

Either rename the parent directory to match the agent name, or update the `name` field in frontmatter to match the parent directory name.

## Options

This rule does not have any configuration options.

## Related Rules

- [`agent-name`](/rules/agents/agent-name)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/agents/agent-name-directory-mismatch.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/agents/agent-name-directory-mismatch.test.ts)

## Version

Available since: v1.0.0
