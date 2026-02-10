# Rule: skill-mcp-tool-qualified-name

**Severity**: Warning
**Fixable**: No
**Validator**: Skills
**Category**: Skills

MCP tools in allowed-tools should use qualified mcp__server__tool format for clarity

## Rule Details

This rule warns when an entry in the `allowed-tools` frontmatter is not a recognized built-in Claude Code tool and doesn't use the qualified MCP tool format (`mcp__<server>__<tool>`). Unqualified tool names can be ambiguous when multiple MCP servers provide tools with similar names.

Built-in tools recognized by this rule: Bash, Read, Write, Edit, Glob, Grep, Task, WebFetch, WebSearch, LSP, AskUserQuestion, EnterPlanMode, ExitPlanMode, Skill, TaskCreate, TaskUpdate, TaskGet, TaskList, TaskOutput, TaskStop, NotebookEdit.

Scoped built-in tools like `Bash(pattern)` are also recognized.

### Incorrect

Unqualified tool name (could be from any MCP server):

```yaml
allowed-tools:
  - firebase_login
```

Mix of qualified and unqualified:

```yaml
allowed-tools:
  - mcp__firebase__firebase_login
  - custom_tool
```

### Correct

All MCP tools use qualified format:

```yaml
allowed-tools:
  - mcp__firebase__firebase_login
  - mcp__sentry__get_issues
```

Built-in tools (no qualification needed):

```yaml
allowed-tools:
  - Bash
  - Read
  - Write
```

## How To Fix

Prefix unqualified MCP tool names with `mcp__<server-name>__`:

```yaml
# Before
allowed-tools:
  - firebase_login

# After
allowed-tools:
  - mcp__firebase__firebase_login
```

## Options

This rule does not have any configuration options.

## When Not To Use It

Disable this rule if you are using a custom tool loading mechanism that doesn't follow the MCP naming convention.

## Related Rules

- [skill-allowed-tools](./skill-allowed-tools.md) - Validates allowed-tools format
- [skill-allowed-tools-not-used](./skill-allowed-tools-not-used.md) - Checks tools are referenced in body

## Resources

- [Rule Implementation](../../src/rules/skills/skill-mcp-tool-qualified-name.ts)
- [Rule Tests](../../tests/rules/skills/skill-mcp-tool-qualified-name.test.ts)

## Version

Available since: v1.0.0
