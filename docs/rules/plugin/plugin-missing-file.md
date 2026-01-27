# Missing File

Plugin references non-existent file.

## Rule Details

This rule enforces that all files referenced in `plugin.json` actually exist in the expected locations. When a plugin declares skills, agents, hooks, commands, or MCP servers, the corresponding files must be present in the plugin directory structure.

Missing file errors include:

- Referenced skill without SKILL.md file
- Referenced agent without agent markdown file
- Referenced hook without hook JSON file
- Referenced command without command markdown file
- Referenced MCP server without .mcp.json configuration

**Category**: Plugin
**Severity**: error
**Fixable**: No
**Since**: v1.0.0

### Violation Examples

Skill reference without file:

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "My plugin",
  "skills": ["format-code"]   .claude/skills/format-code/SKILL.md not found
}
```

Agent reference without file:

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "My plugin",
  "agents": ["code-reviewer"]   .claude/agents/code-reviewer.md not found
}
```

Hook reference without file:

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "My plugin",
  "hooks": ["pre-commit"]   .claude/hooks/pre-commit.json not found
}
```

Command reference without file:

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "My plugin",
  "commands": ["build"]   .claude/commands/build.md not found
}
```

### Correct Examples

All referenced files exist:

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "My plugin",
  "skills": ["format-code"],   .claude/skills/format-code/SKILL.md exists
  "agents": ["reviewer"],       .claude/agents/reviewer.md exists
  "hooks": ["pre-commit"],      .claude/hooks/pre-commit.json exists
  "commands": ["build"]         .claude/commands/build.md exists
}
```

Plugin with directory structure:

```text
my-plugin/
├── plugin.json
└── .claude/
    ├── skills/
    │   └── format-code/
    │       └── SKILL.md         Referenced in plugin.json
    ├── agents/
    │   └── reviewer.md          Referenced in plugin.json
    ├── hooks/
    │   └── pre-commit.json      Referenced in plugin.json
    └── commands/
        └── build.md             Referenced in plugin.json
```

## Expected File Locations

### Skills

**Pattern**: `.claude/skills/<skill-name>/SKILL.md`

```json
{
  "skills": ["format-code", "run-tests"]
}
```

**Expected files:**

```text
.claude/skills/format-code/SKILL.md
.claude/skills/run-tests/SKILL.md
```

### Agents

**Pattern**: `.claude/agents/<agent-name>.md`

```json
{
  "agents": ["code-reviewer", "test-generator"]
}
```

**Expected files:**

```text
.claude/agents/code-reviewer.md
.claude/agents/test-generator.md
```

### Hooks

**Pattern**: `.claude/hooks/<hook-name>.json`

```json
{
  "hooks": ["pre-commit", "post-tool-use"]
}
```

**Expected files:**

```text
.claude/hooks/pre-commit.json
.claude/hooks/post-tool-use.json
```

### Commands

**Pattern**: `.claude/commands/<command-name>.md`

```json
{
  "commands": ["build", "test", "deploy"]
}
```

**Expected files:**

```text
.claude/commands/build.md
.claude/commands/test.md
.claude/commands/deploy.md
```

### MCP Servers

**Pattern**: `.mcp.json` at repository root

```json
{
  "mcpServers": ["file-operations", "code-analyzer"]
}
```

**Expected file:**

```text
.mcp.json  (containing server configurations)
```

Note: The validator checks that `.mcp.json` exists but doesn't validate that specific server names are defined inside it. Use the MCP validator for that.

## How To Fix

### Option 1: Create the missing files

```bash
# Create missing skill
mkdir -p .claude/skills/format-code
touch .claude/skills/format-code/SKILL.md

# Create missing agent
mkdir -p .claude/agents
touch .claude/agents/code-reviewer.md

# Create missing hook
mkdir -p .claude/hooks
touch .claude/hooks/pre-commit.json

# Create missing command
mkdir -p .claude/commands
touch .claude/commands/build.md
```

### Option 2: Remove the reference from plugin.json

```json
# Before - references non-existent file
{
  "skills": ["format-code", "missing-skill"]
}

# After - removed missing reference
{
  "skills": ["format-code"]
}
```

### Option 3: Fix the reference name

```json
# Before - typo in name
{
  "skills": ["foramt-code"]  // File is actually "format-code"
}

# After - correct name
{
  "skills": ["format-code"]
}
```

### Option 4: Move file to correct location

```bash
# Before - file in wrong location
.claude/format-code-skill/SKILL.md

# Move to correct location
mkdir -p .claude/skills/format-code
mv .claude/format-code-skill/SKILL.md .claude/skills/format-code/SKILL.md
rmdir .claude/format-code-skill
```

## Complete Setup Examples

### Simple Plugin Structure

**plugin.json:**

```json
{
  "name": "simple-tools",
  "version": "1.0.0",
  "description": "Simple development tools",
  "skills": ["hello"]
}
```

**Directory structure:**

```text
simple-tools/
├── plugin.json
├── README.md
└── .claude/
    └── skills/
        └── hello/
            └── SKILL.md
```

### Full Plugin Structure

**plugin.json:**

```json
{
  "name": "dev-toolkit",
  "version": "2.0.0",
  "description": "Complete development toolkit",
  "skills": ["format", "lint"],
  "agents": ["reviewer"],
  "hooks": ["pre-commit"],
  "commands": ["build"],
  "mcpServers": ["analyzer"]
}
```

**Directory structure:**

```text
dev-toolkit/
├── plugin.json
├── .mcp.json
├── README.md
└── .claude/
    ├── skills/
    │   ├── format/
    │   │   ├── SKILL.md
    │   │   └── format.sh
    │   └── lint/
    │       ├── SKILL.md
    │       └── lint.sh
    ├── agents/
    │   └── reviewer.md
    ├── hooks/
    │   └── pre-commit.json
    └── commands/
        └── build.md
```

### Multi-Skill Plugin

**plugin.json:**

```json
{
  "name": "code-quality",
  "version": "1.5.0",
  "description": "Code quality tools",
  "skills": [
    "format-javascript",
    "format-python",
    "lint-javascript",
    "lint-python"
  ]
}
```

**Directory structure:**

```text
code-quality/
├── plugin.json
└── .claude/
    └── skills/
        ├── format-javascript/
        │   ├── SKILL.md
        │   └── format.sh
        ├── format-python/
        │   ├── SKILL.md
        │   └── format.py
        ├── lint-javascript/
        │   ├── SKILL.md
        │   └── lint.sh
        └── lint-python/
            ├── SKILL.md
            └── lint.py
```

## Common Mistakes

### Mistake 1: Wrong file name

```json
# plugin.json references "format-code"
{
  "skills": ["format-code"]
}

# But file is named differently
.claude/skills/format-code/skill.md   Should be SKILL.md (uppercase)
```

**Fix:**

```bash
mv .claude/skills/format-code/skill.md .claude/skills/format-code/SKILL.md
```

### Mistake 2: Wrong directory structure

```json
# plugin.json references "code-formatter"
{
  "skills": ["code-formatter"]
}

# But file is in wrong location
.claude/code-formatter/SKILL.md   Missing skills/ directory
```

**Fix:**

```bash
mkdir -p .claude/skills/code-formatter
mv .claude/code-formatter/SKILL.md .claude/skills/code-formatter/SKILL.md
rmdir .claude/code-formatter
```

### Mistake 3: Typo in reference

```json
# plugin.json has typo
{
  "skills": ["foramt-code"]   Typo
}

# File exists but with correct spelling
.claude/skills/format-code/SKILL.md   Exists
```

**Fix:**

```json
{
  "skills": ["format-code"]   Fixed typo
}
```

### Mistake 4: Leftover references after deletion

```json
# plugin.json still references deleted skill
{
  "skills": ["format-code", "old-skill"]
}

# old-skill was deleted
.claude/skills/old-skill/   Doesn't exist anymore
```

**Fix:**

```json
{
  "skills": ["format-code"]   Removed deleted skill
}
```

### Mistake 5: Case sensitivity issues

```json
# plugin.json uses lowercase
{
  "agents": ["codereview"]
}

# File uses different casing
.claude/agents/CodeReview.md   Case mismatch
```

**Fix:**

```bash
# Rename file to match reference
mv .claude/agents/CodeReview.md .claude/agents/codereview.md
```

Or:

```json
# Update reference to match file
{
  "agents": ["CodeReview"]
}
```

## Validation Workflow

### 1. Create Component Files

```bash
# Create skill
mkdir -p .claude/skills/my-skill
echo "# My Skill" > .claude/skills/my-skill/SKILL.md

# Create agent
mkdir -p .claude/agents
echo "# My Agent" > .claude/agents/my-agent.md

# Create hook
mkdir -p .claude/hooks
echo '{"hooks":[]}' > .claude/hooks/my-hook.json

# Create command
mkdir -p .claude/commands
echo "# My Command" > .claude/commands/my-command.md
```

### 2. Reference in plugin.json

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "My plugin",
  "skills": ["my-skill"],
  "agents": ["my-agent"],
  "hooks": ["my-hook"],
  "commands": ["my-command"]
}
```

### 3. Validate

```bash
claudelint
```

## Validation Checklist

Before publishing your plugin, verify:

- [ ] All skill references have corresponding `.claude/skills/<name>/SKILL.md` files
- [ ] All agent references have corresponding `.claude/agents/<name>.md` files
- [ ] All hook references have corresponding `.claude/hooks/<name>.json` files
- [ ] All command references have corresponding `.claude/commands/<name>.md` files
- [ ] If mcpServers are referenced, `.mcp.json` exists
- [ ] File names match references exactly (case-sensitive)
- [ ] No typos in skill/agent/hook/command names
- [ ] Directory structure follows Claude Code conventions

## Options

This rule does not have any configuration options.

## When Not To Use It

You should **never** disable this rule. Missing files will cause:

- Plugin installation failures
- Components not loading
- Runtime errors when components are invoked
- Broken plugin functionality
- Poor user experience

Always ensure referenced files exist rather than disabling this rule.

## Configuration

This rule should not be disabled, but if absolutely necessary:

```json
{
  "rules": {
    "plugin-missing-file": "off"
  }
}
```

To change to a warning (not recommended):

```json
{
  "rules": {
    "plugin-missing-file": "warning"
  }
}
```

## Related Rules

- [plugin-invalid-manifest](./plugin-invalid-manifest.md) - Manifest schema validation
- [plugin-invalid-version](./plugin-invalid-version.md) - Version format validation

## Resources

- [Claude Code Plugin Development Guide](https://github.com/anthropics/claude-code)
- [Plugin Directory Structure](https://github.com/anthropics/claude-code/blob/main/docs/plugins.md)

## Version

Available since: v1.0.0
