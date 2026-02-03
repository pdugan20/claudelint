# Plugin Manifest Specification

## Overview

Create `.claude-plugin/plugin.json` to transform claudelint from an npm-only tool into a Claude Code plugin.

## File Location

```
claude-lint/
├── .claude-plugin/
│   ├── plugin.json          ← CREATE THIS
│   └── marketplace.json     ← Already exists
├── .claude/
│   └── skills/              ← Already have skills here
└── package.json
```

## Minimal Required Manifest

```json
{
  "name": "claudelint"
}
```

That's it! Only `name` is required.

## Recommended Full Manifest

```json
{
  "name": "claudelint",
  "version": "0.2.0-beta.1",
  "description": "Comprehensive linter and validator for Claude Code projects",
  "author": {
    "name": "Pat Dugan",
    "url": "https://github.com/pdugan20"
  },
  "homepage": "https://github.com/pdugan20/claudelint",
  "repository": "https://github.com/pdugan20/claudelint",
  "license": "MIT",
  "keywords": [
    "linter",
    "validator",
    "claude-code",
    "quality",
    "best-practices",
    "skills",
    "hooks",
    "mcp",
    "agents"
  ]
}
```

## Field Reference

### Required Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `name` | string | Unique identifier (kebab-case) | `"claudelint"` |

### Optional Metadata

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `version` | string | Semantic version | `"0.2.0-beta.1"` |
| `description` | string | Brief explanation | `"Linter for Claude Code"` |
| `author` | object | Author info | `{"name": "Pat", "url": "..."}` |
| `homepage` | string | Documentation URL | `"https://..."` |
| `repository` | string | Source code URL | `"https://github.com/..."` |
| `license` | string | License identifier | `"MIT"` |
| `keywords` | array | Search tags | `["linter", "validator"]` |

### Optional Component Paths

| Field | Type | Description | Default | Example |
|-------|------|-------------|---------|---------|
| `commands` | string\|array | Additional command files | `commands/` | `"./custom/cmd.md"` |
| `agents` | string\|array | Additional agent files | `agents/` | `"./custom/agents/"` |
| `skills` | string\|array | Additional skill directories | `skills/` | `"./custom/skills/"` |
| `hooks` | string\|object | Hook config path or inline | `hooks/hooks.json` | `"./hooks.json"` |
| `mcpServers` | string\|object | MCP server config | `.mcp.json` | `"./mcp-config.json"` |

## Default Directory Behavior

**IMPORTANT**: Claude Code auto-loads from default directories even if not specified in manifest.

### Auto-Loaded Directories

If these exist at plugin root, they're loaded automatically:

- `.claude/skills/` - Our skills live here
- `commands/` - If we add commands later
- `agents/` - If we add agents later
- `hooks/hooks.json` - If we add hooks

### When to Use Custom Paths

Only specify custom paths if:

1. You have skills in BOTH default location AND custom location
2. You want to supplement defaults with additional directories
3. Your structure differs from conventions

### For claudelint

We DON'T need to specify custom paths because:

- Our skills are in `.claude/skills/` (default location)
- Our hooks are in `.claude/hooks/hooks.json` (could be referenced but optional)
- Everything follows conventions

## Sync with package.json

Keep these fields in sync:

| Field | plugin.json | package.json |
|-------|-------------|--------------|
| version | **Good** | **Good** |
| description | **Good** | **Good** |
| author | **Good** | **Good** |
| homepage | **Good** | **Good** |
| repository | **Good** | **Good** |
| license | **Good** | **Good** |
| keywords | **Good** | **Good** |

**Solution**: Use `npm run sync:versions` to sync version across files.

**New Script Needed**: Create script to sync metadata between package.json and plugin.json.

## Skill Namespacing

When plugin is installed, skills become namespaced:

### Before (Direct Use)

```bash
# User has skill in .claude/skills/validate/
/validate
```

### After (Plugin Use)

```bash
# User installs plugin
claude /plugin install github:pdugan20/claudelint

# Skills are namespaced
/claudelint:validate-all
/claudelint:format-cc
/claudelint:validate-cc-md
/claudelint:validate-skills
/claudelint:validate-settings
/claudelint:optimize-cc-md
```

**No code changes needed!** Namespacing happens automatically.

## Installation Flow

**CRITICAL UNDERSTANDING**: Plugin install and npm install are SEPARATE channels.

### As Plugin (for Skills)

```bash
# Install from GitHub - Claude Code clones the repo
claude /plugin install github:pdugan20/claudelint

# Or local install for testing
claude /plugin install --source /path/to/claude-lint
```

**What happens:**

1. Claude Code clones/copies the repository
2. Reads `.claude/skills/` from the Git repo
3. Skills become available with `/claudelint:` namespace
4. npm package is NOT involved

### As npm Package (for CLI)

```bash
# Global install - only gets CLI tool
npm install -g claude-code-lint
```

**What happens:**

1. npm installs package from registry
2. Only `dist/`, `bin/`, `README.md`, `LICENSE` included
3. CLI works: `claudelint validate`
4. Skills NOT accessible in Claude Code (that requires plugin install)

**Important:** `.claude/` directory is NOT in npm package - it's only in the Git repo for plugin installation.

## Validation

### Check plugin.json is Valid

```bash
# Validate JSON syntax
cat .claude-plugin/plugin.json | jq .

# Should output formatted JSON with no errors
```

### Test Plugin Installation

```bash
# From project root
claude /plugin install --source .

# Check if skills are available
claude /skills
# Should show claudelint:* skills
```

## Files to Update

### 1. Create plugin.json

**File**: `.claude-plugin/plugin.json`

```json
{
  "name": "claudelint",
  "version": "0.2.0-beta.1",
  "description": "Comprehensive linter and validator for Claude Code projects",
  "author": {
    "name": "Pat Dugan",
    "url": "https://github.com/pdugan20"
  },
  "homepage": "https://github.com/pdugan20/claudelint",
  "repository": "https://github.com/pdugan20/claudelint",
  "license": "MIT",
  "keywords": ["linter", "validator", "claude-code", "quality", "best-practices"]
}
```

### 2. Update package.json files array (CLI only)

**File**: `package.json`

**Current (WRONG):**

```json
{
  "files": [
    "dist",
    "bin",
    ".claude-plugin",  // Not needed in npm - plugin install uses GitHub
    "skills",          // WRONG - directory doesn't exist
    "README.md",
    "LICENSE"
  ]
}
```

**Correct (CLI only):**

```json
{
  "files": [
    "dist",           // Compiled CLI code
    "bin",            // Binary wrapper
    "README.md",
    "LICENSE"
  ]
}
```

**Why remove `.claude-plugin` and `skills`?**

- Plugin install clones from **GitHub**, not npm
- npm package is **CLI-only**
- Including `.claude/` in npm package is unnecessary bloat
- Skills are only accessible via plugin install from Git repo

### 3. Update .npmignore if exists

Ensure `.claude-plugin/` is NOT ignored.

### 4. Update README

Add plugin installation section:

```markdown
## Installation

### As Claude Code Plugin (Recommended)

```bash
claude /plugin install github:pdugan20/claudelint
```

Skills available as:

- `/claudelint:validate-all`
- `/claudelint:format-cc`
- `/claudelint:validate-cc-md`
- `/claudelint:validate-skills`
- `/claudelint:validate-hooks`
- `/claudelint:validate-settings`
- `/claudelint:validate-mcp`
- `/claudelint:validate-plugin`
- `/claudelint:optimize-cc-md`

### As npm CLI Tool

```bash
npm install -g claude-code-lint
claudelint validate
```

Note: npm installation does not auto-install skills.

```

## Testing Checklist

- [ ] `plugin.json` exists in `.claude-plugin/`
- [ ] JSON is valid (no syntax errors)
- [ ] `name` field matches expected value
- [ ] `version` synced with package.json
- [ ] `.claude-plugin/` included in package.json `files` array
- [ ] Local plugin installation works: `claude /plugin install --source .`
- [ ] Skills accessible with namespace: `/claudelint:validate-all`, `/claudelint:format-cc`, etc.
- [ ] All skill names are specific (no generic single-word verbs)
- [ ] README updated with plugin installation instructions

## References

- [Plugin manifest docs from research](../../skills-quality-validation/anthropic-best-practices-summary.md)
- Agent research output from earlier in this conversation
