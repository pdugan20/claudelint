# Rule: skill-allowed-tools-not-used

**Severity**: Warning
**Fixable**: No
**Validator**: Skills
**Category**: Skills

Tools listed in allowed-tools are never referenced in the skill body

## Rule Details

This rule warns when a tool declared in the `allowed-tools` frontmatter is never mentioned in the skill body content. Unused tool declarations grant unnecessary permissions and may indicate stale configuration from a previous version of the skill.

The rule handles several tool formats:

- **Base tools**: `Bash`, `Read`, `Write` - checks for the tool name in the body
- **Scoped tools**: `Bash(claudelint:*)` - extracts the base name (`Bash`) and checks for that
- **MCP tools**: `mcp__firebase__firebase_login` - also checks for the short name (`firebase_login`)

### Incorrect

Tool declared but not mentioned in body:

```markdown
---
allowed-tools:
  - Bash
  - Write
---

# My Skill

Use the Bash tool to run validation.
```

`Write` is declared but never referenced.

### Correct

All declared tools referenced in body:

```markdown
---
allowed-tools:
  - Bash
  - Write
---

# My Skill

Use Bash to run validation. Use Write to save results.
```

## How To Fix

Either:

1. **Remove unused tools** from the `allowed-tools` list to minimize permissions
2. **Add usage instructions** in the body that reference the tool, explaining when and how it's used

## Options

This rule does not have any configuration options.

## When Not To Use It

Disable this rule if your skill uses tools implicitly through sub-processes or other indirect mechanisms where the tool name doesn't appear in documentation.

## Related Rules

- [skill-allowed-tools](./skill-allowed-tools.md) - Validates allowed-tools format and mutual exclusivity
- [skill-mcp-tool-qualified-name](./skill-mcp-tool-qualified-name.md) - Ensures MCP tools use qualified names

## Resources

- [Rule Implementation](../../src/rules/skills/skill-allowed-tools-not-used.ts)
- [Rule Tests](../../tests/rules/skills/skill-allowed-tools-not-used.test.ts)

## Version

Available since: v1.0.0
