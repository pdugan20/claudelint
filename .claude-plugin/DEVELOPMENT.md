# Plugin Development Guide

This document explains how to develop and test the claudelint plugin.

## Plugin Structure

Claude Code plugins follow a specific directory structure. **IMPORTANT**: Only `plugin.json` goes inside `.claude-plugin/`. All component directories (`skills/`, `commands/`, `agents/`, `hooks/`) must be at the **repository root**, not inside `.claude-plugin/` or `.claude/`. See the [official plugin docs](https://code.claude.com/docs/en/plugins-reference#plugin-directory-structure).

```text
claude-lint/                     # Repository root
├── .claude-plugin/
│   ├── plugin.json              # Plugin manifest (ONLY this goes here)
│   ├── README.md
│   └── scripts/
│       └── check-dependency.sh  # SessionStart hook script
├── skills/                      # Skills at ROOT (not .claude/skills/)
│   ├── validate-all/
│   │   └── SKILL.md
│   ├── validate-cc-md/
│   │   └── SKILL.md
│   ├── validate-skills/
│   │   └── SKILL.md
│   ├── validate-settings/
│   │   └── SKILL.md
│   ├── validate-hooks/
│   │   └── SKILL.md
│   ├── validate-mcp/
│   │   └── SKILL.md
│   ├── validate-plugin/
│   │   └── SKILL.md
│   ├── format-cc/
│   │   └── SKILL.md
│   └── optimize-cc-md/
│       └── SKILL.md
├── package.json                 # npm package config
└── src/                         # Source code
```

### Critical Requirements

1. **plugin.json MUST be in `.claude-plugin/` directory**
   - NOT at repository root
   - NOT in `.claude/` directory
   - This is enforced by Claude Code's plugin loader

2. **Skills MUST be at root `skills/` directory**
   - NOT in `.claude/skills/` — that's for standalone (non-plugin) skills
   - NOT inside `.claude-plugin/`
   - Claude Code auto-discovers from `skills/` at the plugin root

3. **Author field MUST be an object**
   - NOT a string
   - Format: `{"name": "...", "email": "...", "url": "..."}`
   - Name is required, email/url are optional

## Development Testing

### Testing the Plugin Locally

Use `--plugin-dir` to load the plugin from source:

```bash
cd /path/to/test-project
claude --plugin-dir /path/to/claude-lint
```

This tells Claude Code to load the plugin directly from your development directory.

### Verify Plugin Loaded

Once Claude starts:

```bash
/skills list
```

You should see 9 claudelint skills with descriptions:

- validate-all
- validate-cc-md
- validate-skills
- validate-settings
- validate-hooks
- validate-mcp
- validate-plugin
- format-cc
- optimize-cc-md

### Debug Mode

If the plugin doesn't load, use debug mode:

```bash
claude --plugin-dir /path/to/claude-lint --debug
```

Check the debug logs in `~/.claude/debug/` for plugin loading errors.

Common errors:

- **"author: Invalid input: expected object, received string"**
  - Fix: author must be `{"name": "..."}` not a string
- **"No skills found"**
  - Fix: skills/ directory must be at root level
- **"Plugin JSON Wrong Location"**
  - Fix: plugin.json must be in `.claude-plugin/` directory

## Plugin vs Workspace Configuration

**Important distinction:**

### Plugin Source (this repo)

- Has `.claude-plugin/plugin.json` with plugin metadata
- Contains skills at root level in `skills/` directory
- Tested with `claude --plugin-dir .`

### User Workspace (where plugin is used)

- NO `plugin.json` file in workspace
- Plugin enabled via `settings.json` `enabledPlugins` field OR
- Plugin loaded via `--plugin-dir` for testing
- npm package installed in `node_modules/` for CLI access

**Common mistake**: Creating `plugin.json` in user workspace - this doesn't exist!

## Manual Testing Workflow

We have comprehensive manual tests in `scripts/test/manual/`:

```bash
# Task 1: Baseline (no skill)
./scripts/test/manual/task-1-optimize-without-skill/setup.sh

# Task 2: With skill (development testing)
./scripts/test/manual/task-2-optimize-with-skill/setup.sh
cd /tmp/claudelint-test-2
claude --plugin-dir /Users/patdugan/Documents/GitHub/claude-lint
```

See `/tmp/claudelint-manual-testing-guide.md` for complete testing protocol.

## Schema Validation

Our schemas MUST match Claude Code's actual validation:

### Testing Schema Compliance

```bash
# Build the package
npm run build

# Run self-validation
npm run check:self

# Validate plugin structure
npx claudelint validate-plugin

# Test plugin loading
claude --plugin-dir . --debug
```

### Schema Sync Checks

We maintain both Zod schemas (TypeScript) and JSON schemas (reference):

```bash
# Verify schemas match
npm run check:schema-sync
```

This prevents drift between:

1. Our Zod schemas (`src/validators/schemas.ts`)
2. Our JSON schemas (`schemas/*.schema.json`)
3. Claude Code's actual validation

## Common Development Issues

### Issue: Skills not loading after code changes

**Cause**: Plugin cache is stale

**Fix**:

```bash
rm -rf ~/.claude/plugins/cache
# Restart Claude Code
```

### Issue: Schema validation passes but Claude rejects

**Cause**: Our schema doesn't match Claude Code's actual validator

**Fix**:

1. Test with `claude --plugin-dir . --debug`
2. Check debug logs for actual error
3. Update our schemas to match
4. Add test case to prevent regression

### Issue: plugin.json location error

**Cause**: plugin.json not in `.claude-plugin/` directory

**Fix**:

```bash
# Correct structure:
.claude-plugin/plugin.json

# NOT:
plugin.json
.claude/plugin.json
```

## Release Checklist

Before releasing a new version:

- [ ] All tests pass: `npm test`
- [ ] Self-validation passes: `npm run check:self`
- [ ] Schema sync passes: `npm run check:schema-sync`
- [ ] Manual testing complete (Tasks 1-6)
- [ ] Plugin loads with `claude --plugin-dir .`
- [ ] All skills appear in `/skills list`
- [ ] Skills execute correctly in test workspace
- [ ] Update CHANGELOG.md for skills
- [ ] Bump version in plugin.json and package.json
- [ ] Create release: `npm run release`

## Documentation

- **Plugin structure**: This file
- **Manual testing**: `/tmp/claudelint-manual-testing-guide.md`
- **Schema findings**: `docs/projects/manual-testing-infrastructure-refactor/`
- **Rule documentation**: [claudelint.com/rules](https://claudelint.com/rules/overview)

## References

- [Claude Code Plugin Reference](https://code.claude.com/docs/en/plugins-reference)
- [Plugin Directory Structure](https://code.claude.com/docs/en/plugins-reference#plugin-directory-structure)
- [Debugging Plugins](https://code.claude.com/docs/en/plugins-reference#debugging-and-development-tools)
