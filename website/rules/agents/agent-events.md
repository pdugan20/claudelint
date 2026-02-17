---
description: "Agent events must be an array with maximum 3 event names"
---

# agent-events

<RuleHeader description="Agent events must be an array with maximum 3 event names" severity="error" :fixable="false" :configurable="false" category="Agents" />

## Rule Details

This rule validates the `events` field in agent frontmatter. Events must be an array of strings with a maximum of 3 items. This constraint keeps agents focused on a small set of triggers rather than responding to every possible event. The validation is enforced via the AgentFrontmatterWithRefinements schema.

### Incorrect

Agent with too many events

```markdown
---
name: my-agent
description: Monitors everything
events:
  - PreToolUse
  - PostToolUse
  - Stop
  - SessionStart
---
```

### Correct

Agent with a focused set of events

```markdown
---
name: my-agent
description: Validates tool usage
events:
  - PreToolUse
  - PostToolUse
---
```

## How To Fix

Reduce the `events` array to at most 3 entries. If you need to respond to more events, consider splitting the logic across multiple focused agents.

## Options

This rule does not have any configuration options.

## Related Rules

- [`agent-hooks`](/rules/agents/agent-hooks)
- [`agent-description`](/rules/agents/agent-description)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/agents/agent-events.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/agents/agent-events.test.ts)

## Version

Available since: v0.2.0
