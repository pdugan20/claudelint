# Rule: agent-disallowed-tools

**Severity**: Error
**Fixable**: No
**Validator**: Agents
**Recommended**: Yes

Agent disallowedTools must be an array of tool names

## Rule Details

This rule enforces that the `disallowedTools` field in agent markdown frontmatter is a valid array of strings. Each entry should be a tool name that the agent is prohibited from using. Validation is delegated to the AgentFrontmatterSchema Zod schema. Proper formatting prevents runtime errors when the agent framework parses tool restrictions.

### Incorrect

disallowedTools as a single string instead of array

```yaml
---
name: safe-agent
description: Agent with tool restrictions
disallowedTools: Bash
---
```

disallowedTools with non-string entries

```yaml
---
name: safe-agent
description: Agent with tool restrictions
disallowedTools:
  - 123
  - true
---
```

### Correct

disallowedTools as a valid array of tool names

```yaml
---
name: safe-agent
description: Agent with tool restrictions
disallowedTools:
  - Bash
  - Write
---
```

## How To Fix

Ensure `disallowedTools` is formatted as a YAML array of strings. Each entry should be a valid tool name like Bash, Write, Edit, or WebFetch.

## Options

This rule does not have any configuration options.

## Related Rules

- [`agent-tools`](/rules/agents/agent-tools)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/agents/agent-disallowed-tools.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/agents/agent-disallowed-tools.test.ts)

## Version

Available since: v1.0.0
