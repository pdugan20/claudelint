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

## How To Fix

To resolve missing file errors:

1. **Check which files are missing** from the error message

2. **Create missing skill files**:
   ```bash
   mkdir -p .claude/skills/format-code
   touch .claude/skills/format-code/SKILL.md
   # Add frontmatter and content
   ```

3. **Create missing agent files**:
   ```bash
   mkdir -p .claude/agents
   touch .claude/agents/reviewer.md
   # Add frontmatter and content
   ```

4. **Create missing hook files**:
   ```bash
   mkdir -p .claude/hooks
   touch .claude/hooks/pre-commit.json
   # Add hook configuration
   ```

5. **Create missing command files**:
   ```bash
   mkdir -p .claude/commands
   touch .claude/commands/build.md
   # Add command documentation
   ```

6. **Create MCP configuration** if needed:
   ```bash
   touch .mcp.json
   # Add MCP server configuration
   ```

7. **Or remove the reference** from plugin.json if not needed:
   ```json
   {
     "skills": ["format-code"],
     "agents": []
   }
   ```

8. **Run validation**:
   ```bash
   claudelint check-plugin
   ```

## Options

This rule does not have configuration options.

## When Not To Use It

Never disable this rule. Missing files cause plugin installation failures, components not loading, runtime errors when components are invoked, and broken plugin functionality. Always ensure referenced files exist rather than disabling validation.

## Related Rules

- [plugin-invalid-manifest](./plugin-invalid-manifest.md) - Manifest schema validation
- [plugin-invalid-version](./plugin-invalid-version.md) - Version format validation

## Resources

- [Rule Implementation](../../src/rules/plugin/plugin-missing-file.ts)
- [Rule Tests](../../tests/rules/plugin/plugin-missing-file.test.ts)
- [Plugin Development Guide](https://github.com/anthropics/claude-code)

## Version

Available since: v1.0.0
