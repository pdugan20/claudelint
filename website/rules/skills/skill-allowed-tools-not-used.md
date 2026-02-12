# skill-allowed-tools-not-used

<RuleHeader description="Tools listed in allowed-tools are never referenced in the skill body" severity="warn" :fixable="false" category="Skills" />

## Rule Details

This rule checks each tool listed in the `allowed-tools` frontmatter array against the SKILL.md body content. If a tool name is never mentioned in the body, it is likely stale configuration left over from a previous version. Unused tool declarations grant unnecessary permissions and make the skill harder to audit. The rule supports both plain tool names and MCP-qualified names (e.g., `mcp__server__tool`), checking for the short name portion of MCP tools as well.

### Incorrect

Tool listed in allowed-tools but never mentioned in body

```yaml
---
name: build
description: Builds the project
allowed-tools:
  - Bash
  - Read
  - WebFetch
---

## Usage

Run `Bash` to execute the build.
Use `Read` to check config.
```

### Correct

All allowed tools are referenced in the body

```yaml
---
name: build
description: Builds the project
allowed-tools:
  - Bash
  - Read
---

## Usage

Use `Bash` to run the build command.
Use `Read` to inspect configuration files.
```

## How To Fix

Remove unused tools from the `allowed-tools` list, or add instructions in the skill body that reference the tool so the AI model knows when and how to use it.

## Options

This rule does not have any configuration options.

## Related Rules

- [`skill-allowed-tools`](/rules/skills/skill-allowed-tools)
- [`skill-mcp-tool-qualified-name`](/rules/skills/skill-mcp-tool-qualified-name)

## Resources

- [Rule Implementation](https://github.com/pdugan20/claudelint/blob/main/src/rules/skills/skill-allowed-tools-not-used.ts)
- [Rule Tests](https://github.com/pdugan20/claudelint/blob/main/tests/rules/skills/skill-allowed-tools-not-used.test.ts)

## Version

Available since: v0.2.0
