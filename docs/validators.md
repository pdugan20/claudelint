# Validators

Comprehensive documentation for all validators in the Claude Validator toolkit.

## Overview

Claude Validator includes validators for all major Claude Code components:

1. CLAUDE.md files (memory system)
2. Skills (agent workflows)
3. Settings (configuration)
4. Hooks (event handlers)
5. MCP Servers (external integrations)
6. Plugins (packaged extensions)
7. Agents (subagents)
8. Commands/Prompts
9. LSP Servers
10. Output Styles

## CLAUDE.md Validator

### What It Validates

- **File size** - Performance limits (35KB warning, 40KB error)
- **Markdown formatting** - Compliance with markdownlint rules
- **Import syntax** - `@path/to/file` references
- **Recursive imports** - Maximum depth of 5
- **YAML frontmatter** - In `.claude/rules/*.md` files
- **Glob patterns** - `paths` field in frontmatter

### Rules

#### Size Limits

- **Warning**: Files > 35KB
- **Error**: Files > 40KB
- **Rationale**: Claude Code performance degrades with large context files

#### Import Syntax

Valid:

```markdown
@project/src/config.ts
@project/docs/architecture.md
```

Invalid:

```markdown
@project/missing-file.ts  # File doesn't exist
@project/../../../etc/passwd  # Path traversal
```

#### Frontmatter in Rules

Valid:

```yaml
---
paths:
  - "src/**/*.ts"
  - "!src/**/*.test.ts"
---
```

Invalid:

```yaml
---
paths: "src/**/*.ts"  # Should be array
invalid_field: true   # Unknown field
---
```

### Usage

```bash
# Validate CLAUDE.md files
claude-validator check-claude-md

# Specify custom path
claude-validator check-claude-md --path .claude/CLAUDE.md

# Verbose output
claude-validator check-claude-md --verbose
```

### Exit Codes

- `0` - All checks passed
- `1` - Warnings found (or with `--warnings-as-errors`)
- `2` - Errors found

---

## Skills Validator

### What It Validates

- **Directory structure** - `SKILL.md` exists
- **Frontmatter schema** - All required and optional fields
- **Field types** - Correct data types
- **File references** - Referenced files exist
- **Markdown formatting** - Proper markdown syntax
- **String substitutions** - Valid `$ARGUMENTS`, `$0`, etc.

### Frontmatter Fields

#### Required

- `name` - Unique identifier (lowercase, hyphens, max 64 chars)
- `description` - When Claude should use this skill

#### Optional

- `argument-hint` - Expected arguments
- `disable-model-invocation` - User-only (true) vs auto-invoke (false)
- `user-invocable` - Visibility control (default: true)
- `allowed-tools` - Tool restrictions array
- `model` - Override model (sonnet, opus, haiku, inherit)
- `context` - Fork context vs inline (fork, inline, auto)
- `agent` - Subagent type selection
- `hooks` - Lifecycle hooks

### Rules

#### Skill Naming

Valid:

```yaml
name: validate-all
name: check-claude-md
name: run-tests
```

Invalid:

```yaml
name: ValidateAll  # No uppercase
name: validate_all  # No underscores
name: validate all  # No spaces
name: this-is-a-very-long-skill-name-that-exceeds-sixty-four-characters  # Too long
```

#### Allowed Tools

Valid:

```yaml
allowed-tools: [Bash, Read, Write]
allowed-tools: [Grep, Glob]
```

Invalid:

```yaml
allowed-tools: [InvalidTool]  # Tool doesn't exist
allowed-tools: Bash  # Should be array
```

#### File References

If SKILL.md references:

```markdown
See [template](./template.md) for examples.
```

Then `template.md` must exist in the skill directory.

### Usage

```bash
# Validate all skills
claude-validator validate-skills

# Validate specific path
claude-validator validate-skills --path .claude/skills

# Validate single skill
claude-validator validate-skills --skill my-skill

# Verbose output
claude-validator validate-skills --verbose
```

---

## Settings Validator

### What It Validates

- **JSON syntax** - Well-formed JSON
- **Schema compliance** - All fields match expected types
- **Permission rules** - Valid syntax
- **Tool names** - Tools exist
- **Model names** - Valid model aliases
- **File paths** - Referenced files exist
- **Environment variables** - Valid names

### Settings Schema

```typescript
interface Settings {
  permissions?: PermissionRule[];
  env?: Record<string, string>;
  model?: "sonnet" | "opus" | "haiku" | "inherit";
  apiKeyHelper?: string;
  hooks?: Hook[];
  attribution?: AttributionConfig;
  statusLine?: string;
  outputStyle?: string;
  sandbox?: SandboxConfig;
  enabledPlugins?: Record<string, boolean>;
  extraKnownMarketplaces?: Record<string, MarketplaceConfig>;
  strictKnownMarketplaces?: boolean;
}
```

### Rules

#### Permission Rules

Valid:

```json
{
  "permissions": [
    {
      "tool": "Bash",
      "action": "allow",
      "pattern": "git *"
    },
    {
      "tool": "Write",
      "action": "ask"
    }
  ]
}
```

Invalid:

```json
{
  "permissions": [
    {
      "tool": "InvalidTool",  // Tool doesn't exist
      "action": "allow"
    }
  ]
}
```

#### Model Names

Valid:

```json
{
  "model": "sonnet"
}
```

Invalid:

```json
{
  "model": "gpt-4"  // Not a valid Claude model
}
```

### Usage

```bash
# Validate settings
claude-validator validate-settings

# Validate specific file
claude-validator validate-settings --path .claude/settings.json
```

---

## Hooks Validator

### What It Validates

- **JSON schema** - hooks.json syntax
- **Event names** - Valid hook events
- **Hook types** - command, prompt, or agent
- **Script files** - Existence and executability
- **Matcher patterns** - Valid regex/glob patterns
- **Variable expansion** - Correct syntax

### Hook Events

Valid events:

- `PreToolUse` - Before tool calls
- `PostToolUse` - After successful execution
- `PostToolUseFailure` - After tool failure
- `PermissionRequest` - During permission dialogs
- `UserPromptSubmit` - When user submits prompts
- `Notification` - When notifications sent
- `Stop` - When Claude finishes
- `SubagentStart` - Subagent begins
- `SubagentStop` - Subagent completes
- `PreCompact` - Before conversation compaction
- `Setup` - During initialization
- `SessionStart` - Session begins
- `SessionEnd` - Session ends

### Rules

#### Hook Configuration

Valid:

```json
{
  "hooks": [
    {
      "event": "PreToolUse",
      "matcher": {
        "tool": "Write",
        "pattern": "*.ts"
      },
      "type": "command",
      "command": "npm run lint"
    }
  ]
}
```

Invalid:

```json
{
  "hooks": [
    {
      "event": "InvalidEvent",  // Unknown event
      "type": "command",
      "command": "missing-script.sh"  // Script doesn't exist
    }
  ]
}
```

### Usage

```bash
# Validate hooks
claude-validator validate-hooks

# Validate specific file
claude-validator validate-hooks --path .claude/hooks/hooks.json
```

---

## MCP Server Validator

### What It Validates

- **JSON schema** - .mcp.json syntax
- **Server names** - Uniqueness
- **Transport types** - stdio, HTTP, or SSE
- **Commands/URLs** - Valid syntax
- **Environment variables** - Proper expansion syntax
- **Variable patterns** - `${VAR}` and `${VAR:-default}`

### Rules

#### Server Configuration

Valid:

```json
{
  "mcpServers": {
    "github": {
      "transport": "stdio",
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-server-github"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  }
}
```

Invalid:

```json
{
  "mcpServers": {
    "github": {
      "transport": "invalid",  // Unknown transport
      "command": "missing-command"  // Command not in PATH
    }
  }
}
```

### Usage

```bash
# Validate MCP servers
claude-validator validate-mcp

# Validate specific file
claude-validator validate-mcp --path .mcp.json
```

---

## Plugin Validator

### What It Validates

- **Manifest schema** - plugin.json structure
- **Semantic versioning** - Version format
- **Directory structure** - Files in correct locations
- **File references** - All referenced files exist
- **Cross-references** - Skills, agents, hooks exist
- **Marketplace schema** - marketplace.json structure

### Rules

#### Directory Structure

Correct:

```text
my-plugin/
├── .claude-plugin/
│   └── plugin.json
├── skills/
├── agents/
└── hooks/
```

Incorrect:

```text
my-plugin/
├── .claude-plugin/
│   ├── plugin.json
│   ├── skills/        # Should be at root!
│   └── agents/        # Should be at root!
```

#### Plugin Manifest

Valid:

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "My awesome plugin",
  "skills": ["./skills/my-skill"],
  "hooks": "./hooks/hooks.json"
}
```

Invalid:

```json
{
  "name": "My Plugin",  // No spaces/uppercase
  "version": "1.0",  // Invalid semver
  "skills": ["./missing-skill"]  // File doesn't exist
}
```

### Usage

```bash
# Validate plugin
claude-validator validate-plugin

# Validate from specific directory
claude-validator validate-plugin --path ./my-plugin
```

---

## Agents Validator

### What It Validates

- **Frontmatter schema** - All fields
- **Tool lists** - Allowed vs disallowed tools
- **Model selection** - Valid model names
- **Permission modes** - Valid modes
- **Skill references** - Skills exist

### Frontmatter Fields

- `name` - Unique identifier
- `description` - When Claude delegates
- `tools` - Allowed tools (allowlist)
- `disallowedTools` - Blocked tools (denylist)
- `model` - sonnet, opus, haiku, inherit
- `permissionMode` - default, acceptEdits, dontAsk, bypassPermissions, plan
- `skills` - Preloaded skills
- `hooks` - Lifecycle hooks

### Usage

```bash
# Validate agents
claude-validator validate-agents

# Validate specific path
claude-validator validate-agents --path .claude/agents
```

---

## Commands Validator

### What It Validates

- **Markdown structure** - Proper formatting
- **Frontmatter** - Valid YAML
- **File references** - Referenced files exist

### Usage

```bash
# Validate commands
claude-validator validate-commands

# Validate specific path
claude-validator validate-commands --path .claude/commands
```

---

## Common Options

All validators support:

- `--verbose` - Detailed output
- `--warnings-as-errors` - Treat warnings as errors
- `--path <path>` - Custom path to validate
- `--fix` - Auto-fix issues (where supported)

## Exit Codes

All validators use consistent exit codes:

- `0` - Success (all checks passed)
- `1` - Warnings (or with `--warnings-as-errors`)
- `2` - Errors (validation failed)
- `3` - Fatal error (crash, invalid arguments)

## Output Format

### Default Output

```text
✓ CLAUDE.md size check passed
✗ Error: CLAUDE.md exceeds 40KB limit (45123 bytes)
  at: CLAUDE.md
⚠ Warning: CLAUDE.md approaching size limit (36000 bytes)
  at: CLAUDE.md

2 errors, 1 warning
```

### Verbose Output

```text
Validating CLAUDE.md files...
  Found: CLAUDE.md
  Found: .claude/CLAUDE.md
  Found: .claude/rules/typescript.md

Checking CLAUDE.md...
  ✓ Size: 25431 bytes (OK)
  ✓ Markdown formatting
  ✓ No import statements
  ✓ No frontmatter (not required for root CLAUDE.md)

Checking .claude/rules/typescript.md...
  ✓ Size: 3421 bytes (OK)
  ✓ Markdown formatting
  ✓ Valid frontmatter
  ✓ Paths glob patterns valid

All checks passed!
```

### JSON Output (Future)

```json
{
  "valid": false,
  "errors": [
    {
      "validator": "claude-md",
      "message": "File exceeds 40KB limit",
      "file": "CLAUDE.md",
      "line": null,
      "severity": "error"
    }
  ],
  "warnings": [
    {
      "validator": "claude-md",
      "message": "File approaching size limit",
      "file": "CLAUDE.md",
      "line": null,
      "severity": "warning"
    }
  ]
}
```
