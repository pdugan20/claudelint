# Rule: plugin-components-wrong-location

**Severity**: Warning
**Fixable**: No
**Validator**: Plugin
**Category**: Best Practices

Plugin components should be in .claude/ not .claude-plugin/

## Rule Details

Plugin components (skills, agents, hooks, commands) must be located in the `.claude/` directory, not in `.claude-plugin/`. The `.claude-plugin/` directory is reserved for plugin metadata and internal configuration, while `.claude/` is the standard location for all functional components that Claude Code loads and executes.

This separation ensures:

- **Consistent discovery**: Claude Code knows where to find components
- **Clear organization**: Metadata is separated from functional code
- **Standard conventions**: All plugins follow the same directory structure
- **Easier debugging**: Components are in expected locations

This rule checks for the existence of `skills/`, `agents/`, `hooks/`, or `commands/` directories inside `.claude-plugin/` and warns if any are found. Components should be moved to `.claude/` instead.

### Incorrect

Components in wrong location:

```text
my-plugin/
├── plugin.json
└── .claude-plugin/
    ├── skills/           # Wrong location
    │   └── build/
    ├── agents/           # Wrong location
    │   └── reviewer.md
    └── hooks/            # Wrong location
        └── pre-commit.json
```

### Correct

Components in correct location:

```text
my-plugin/
├── plugin.json
├── .claude-plugin/       # Only metadata here
│   └── cache/
└── .claude/              # Components go here
    ├── skills/
    │   └── build/
    │       └── SKILL.md
    ├── agents/
    │   └── reviewer.md
    └── hooks/
        └── pre-commit.json
```

Complete correct structure:

```text
my-plugin/
├── plugin.json
├── marketplace.json
├── .claude-plugin/       # Plugin metadata only
│   ├── cache/
│   └── state/
└── .claude/              # All functional components
    ├── skills/
    │   ├── build/
    │   │   └── SKILL.md
    │   └── test/
    │       └── SKILL.md
    ├── agents/
    │   └── reviewer.md
    ├── hooks/
    │   └── pre-commit.json
    └── commands/
        └── deploy.md
```

## How To Fix

To move components to the correct location:

1. **Check for misplaced components**:

   ```bash
   # Look for component directories in .claude-plugin/
   ls -la .claude-plugin/
   ```

2. **Create correct directory structure**:

   ```bash
   # Ensure .claude/ exists
   mkdir -p .claude
   ```

3. **Move skills directory** if present:

   ```bash
   # Move from wrong location to correct location
   mv .claude-plugin/skills .claude/skills
   ```

4. **Move agents directory** if present:

   ```bash
   mv .claude-plugin/agents .claude/agents
   ```

5. **Move hooks directory** if present:

   ```bash
   mv .claude-plugin/hooks .claude/hooks
   ```

6. **Move commands directory** if present:

   ```bash
   mv .claude-plugin/commands .claude/commands
   ```

7. **Verify structure**:

   ```bash
   # Check that components are now in .claude/
   tree .claude
   ```

8. **Run validation**:

   ```bash
   claude-code-lint check-plugin
   ```

## Options

This rule does not have configuration options.

## When Not To Use It

You should not disable this rule. Claude Code expects components to be in `.claude/` and will not discover them in `.claude-plugin/`. Using the wrong location will cause:

- Components not loading at runtime
- Skills not appearing in the skills list
- Agents not being discoverable
- Hooks not executing when triggered

Always place components in `.claude/` following Claude Code conventions. Only disable this rule if you're maintaining a legacy plugin structure temporarily during migration.

## Related Rules

- [plugin-json-wrong-location](./plugin-json-wrong-location.md) - Validates plugin.json location
- [plugin-missing-file](./plugin-missing-file.md) - Ensures referenced files exist

## Resources

- [Rule Implementation](../../src/rules/plugin/plugin-components-wrong-location.ts)
- [Rule Tests](../../tests/rules/plugin/plugin-components-wrong-location.test.ts)
- [Plugin Development Guide](https://github.com/anthropics/claude-code)

## Version

Available since: v1.0.0
