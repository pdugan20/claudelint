# agent-hooks

<RuleHeader description="Agent hooks must be an object with event name keys" severity="error" :fixable="false" category="Agents" />

## Rule Details

This rule enforces that the `hooks` field in agent markdown frontmatter is a valid object keyed by event names. The supported event names are PreToolUse, PostToolUse, PostToolUseFailure, PermissionRequest, and Notification. Each key maps to an array of hook matchers. Validation is delegated to the AgentFrontmatterSchema.shape.hooks Zod schema. Correctly structured hooks allow the agent framework to register event handlers at runtime.

### Incorrect

Hooks defined as an array instead of an object

```yaml
---
name: build-agent
description: Runs build pipelines
hooks:
  - PreToolUse
  - PostToolUse
---
```

Hooks defined as a plain string

```yaml
---
name: build-agent
description: Runs build pipelines
hooks: PreToolUse
---
```

### Correct

Hooks as an object with event name keys

```yaml
---
name: build-agent
description: Runs build pipelines
hooks:
  PreToolUse:
    - matcher: Bash
      command: echo "pre-check"
---
```

## How To Fix

Reformat the `hooks` field as an object where each key is a valid event name (PreToolUse, PostToolUse, etc.) and each value is an array of hook matcher objects.

## Options

This rule does not have any configuration options.

## Related Rules

- [`agent-hooks-invalid-schema`](/rules/agents/agent-hooks-invalid-schema)
- [`hooks-invalid-event`](/rules/hooks/hooks-invalid-event)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/agents/agent-hooks.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/agents/agent-hooks.test.ts)

## Version

Available since: v0.2.0
