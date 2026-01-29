# Rule: plugin-missing-file

**Severity**: Error
**Fixable**: No
**Validator**: Plugin
**Category**: Cross-Reference

Files referenced in plugin.json must exist

## Rule Details

When a plugin declares skills, agents, hooks, commands, or MCP servers in `plugin.json`, the corresponding files must exist in specific locations following Claude Code's directory conventions. Each component type has a defined file path pattern that must be followed.

This rule detects missing skill SKILL.md files, missing agent markdown files, missing hook JSON files, missing command markdown files, and missing .mcp.json when MCP servers are referenced. File names are case-sensitive and must match references exactly.

### Incorrect

Skill reference without file:

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "My plugin",
  "skills": ["format-code"]
}
```

```text
.claude/skills/format-code/SKILL.md not found
```

Multiple missing component files:

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "My plugin",
  "skills": ["missing-skill"],
  "agents": ["missing-agent"],
  "hooks": ["missing-hook"]
}
```

### Correct

All referenced files exist:

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "My plugin",
  "skills": ["format-code"],
  "agents": ["reviewer"],
  "hooks": ["pre-commit"],
  "commands": ["build"]
}
```

Plugin with matching directory structure:

```text
my-plugin/
├── plugin.json
└── .claude/
    ├── skills/
    │   └── format-code/
    │       └── SKILL.md
    ├── agents/
    │   └── reviewer.md
    ├── hooks/
    │   └── pre-commit.json
    └── commands/
        └── build.md
```

## Options

This rule does not have configuration options.

## When Not To Use It

Never disable this rule. Missing files cause plugin installation failures, components not loading, runtime errors when components are invoked, and broken plugin functionality. Always ensure referenced files exist rather than disabling validation.

## Related Rules

- [plugin-invalid-manifest](./plugin-invalid-manifest.md) - Manifest schema validation
- [plugin-invalid-version](./plugin-invalid-version.md) - Version format validation

## Resources

- [Implementation](../../../src/validators/plugin.ts)
- [Tests](../../../tests/validators/plugin.test.ts)
- [Plugin Development Guide](https://github.com/anthropics/claude-code)

## Version

Available since: v1.0.0
