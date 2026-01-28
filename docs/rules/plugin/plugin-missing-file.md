# Rule: plugin-missing-file

**Severity**: Error
**Fixable**: No
**Validator**: Plugin
**Category**: File System

Validates that all files referenced in `plugin.json` exist in the expected locations within the plugin directory structure.

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

1. **Create missing files**: Use mkdir/touch to create required files in expected locations
2. **Remove invalid references**: Delete references to components you don't want to provide
3. **Fix reference names**: Correct typos in component names to match actual files
4. **Move files to correct locations**: Relocate misplaced files to follow directory conventions
5. **Match case sensitivity**: Ensure file names match references exactly (case-sensitive on Unix systems)

**Expected File Patterns:**

- Skills: `.claude/skills/<skill-name>/SKILL.md`
- Agents: `.claude/agents/<agent-name>.md`
- Hooks: `.claude/hooks/<hook-name>.json`
- Commands: `.claude/commands/<command-name>.md`
- MCP Servers: `.mcp.json` (at repository root)

**Common Mistakes:**

- Using lowercase `skill.md` instead of uppercase `SKILL.md`
- Missing the `skills/` directory level (`.claude/my-skill/` instead of `.claude/skills/my-skill/`)
- Typos in component names
- Leftover references after deleting components
- Case mismatches between references and file names

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
