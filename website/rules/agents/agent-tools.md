# Rule: agent-tools

**Severity**: Error
**Fixable**: No
**Validator**: Agents
**Recommended**: Yes

Agent tools must be an array of tool names, cannot be used with disallowed-tools

## Rule Details

This rule enforces two constraints on the `tools` field in agent markdown frontmatter. First, `tools` must be a valid array of strings representing tool names the agent is allowed to use. Second, `tools` and `disallowedTools` are mutually exclusive -- specifying both is an error. Array validation is delegated to AgentFrontmatterSchema.shape.tools, while cross-field validation uses AgentFrontmatterWithRefinements. This prevents conflicting tool access configurations.

### Incorrect

Tools as a single string instead of array

```yaml
---
name: code-agent
description: Writes and edits code
tools: Bash
---
```

Both tools and disallowedTools specified

```yaml
---
name: code-agent
description: Writes and edits code
tools:
  - Bash
  - Edit
disallowedTools:
  - Write
---
```

### Correct

Tools as a valid array of tool names

```yaml
---
name: code-agent
description: Writes and edits code
tools:
  - Bash
  - Edit
  - Read
---
```

Using disallowedTools alone (without tools)

```yaml
---
name: safe-agent
description: Agent with restricted access
disallowedTools:
  - Bash
---
```

## How To Fix

Ensure `tools` is a YAML array of strings. If you need to restrict certain tools, use either `tools` (allowlist) or `disallowedTools` (blocklist), but not both.

## Options

This rule does not have any configuration options.

## Related Rules

- [`agent-disallowed-tools`](/rules/agents/agent-disallowed-tools)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/agents/agent-tools.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/agents/agent-tools.test.ts)

## Version

Available since: v1.0.0
