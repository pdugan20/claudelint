# Invalid Manifest

Plugin manifest does not match schema.

## Rule Details

This rule enforces that plugin manifests (`plugin.json`) follow the required schema with all mandatory fields and correct structure. Claude Code plugins must have a valid manifest that describes the plugin's metadata, components, and dependencies.

Manifest validation errors include:

- Missing required fields (name, version, description)
- Empty or whitespace-only required fields
- Invalid field types or values
- Malformed JSON (comments, trailing commas, single quotes)
- plugin.json in wrong location (.claude-plugin/ instead of root)

**Category**: Plugin
**Severity**: error
**Fixable**: No
**Since**: v1.0.0

### Violation Examples

Missing required fields:

```json
{
  "name": "my-plugin"
  //  Missing version and description
}
```

Empty required fields:

```json
{
  "name": "",   Empty name
  "version": "1.0.0",
  "description": "   "   Whitespace only
}
```

Wrong file location:

```text
.claude-plugin/plugin.json   Should be at repository root
```

Invalid JSON:

```json
{
  "name": "my-plugin",  //  Comments not allowed in JSON
  "version": "1.0.0",
  "description": "My plugin",   Trailing comma
}
```

Invalid field types:

```json
{
  "name": "my-plugin",
  "version": 1.0,   Version should be string
  "description": "My plugin",
  "skills": "test-skill"   Skills should be array
}
```

### Correct Examples

Minimal valid manifest:

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "A plugin that provides useful tools"
}
```

Complete manifest with all fields:

```json
{
  "name": "development-tools",
  "version": "2.1.0",
  "description": "Essential development tools and utilities",
  "author": "Jane Developer",
  "repository": "https://github.com/example/dev-tools",
  "license": "MIT",
  "skills": ["format-code", "run-tests"],
  "agents": ["code-reviewer"],
  "hooks": ["pre-commit"],
  "commands": ["build"],
  "mcpServers": ["local-analyzer"],
  "dependencies": {
    "prettier": "^3.0.0",
    "eslint": "^8.0.0"
  }
}
```

## Required Fields

### name

**Type**: string
**Required**: Yes

The unique identifier for your plugin. Should be descriptive and use kebab-case.

```json
{
  "name": "code-formatter"  
}
```

**Invalid:**

```json
{
  "name": ""   Empty
}
```

```json
{
  "name": "Code Formatter"   Use kebab-case: "code-formatter"
}
```

### version

**Type**: string
**Required**: Yes

Semantic version number. Must follow semver format (see [plugin-invalid-version](./plugin-invalid-version.md)).

```json
{
  "version": "1.0.0"  
}
```

**Invalid:**

```json
{
  "version": "1.0"   Must be semver (1.0.0)
}
```

```json
{
  "version": ""   Empty
}
```

### description

**Type**: string
**Required**: Yes

A clear, concise description of what your plugin does.

```json
{
  "description": "Formats code using Prettier and ESLint"  
}
```

**Invalid:**

```json
{
  "description": ""   Empty
}
```

```json
{
  "description": "   "   Whitespace only
}
```

## Optional Fields

### author

**Type**: string

Plugin author name or organization.

```json
{
  "author": "Jane Developer"
}
```

### repository

**Type**: string

Git repository URL.

```json
{
  "repository": "https://github.com/example/my-plugin"
}
```

### license

**Type**: string

License identifier (SPDX format recommended).

```json
{
  "license": "MIT"
}
```

### skills

**Type**: array of strings

List of skill names provided by this plugin. Each skill must exist in `.claude/skills/<skill-name>/`.

```json
{
  "skills": ["format-code", "run-tests", "lint-files"]
}
```

### agents

**Type**: array of strings

List of agent names provided by this plugin. Each agent must exist at `.claude/agents/<agent-name>.md`.

```json
{
  "agents": ["code-reviewer", "test-generator"]
}
```

### hooks

**Type**: array of strings

List of hook configurations provided by this plugin. Each hook must exist at `.claude/hooks/<hook-name>.json`.

```json
{
  "hooks": ["pre-commit", "post-tool-use"]
}
```

### commands

**Type**: array of strings

List of command names provided by this plugin. Each command must exist at `.claude/commands/<command-name>.md`.

```json
{
  "commands": ["build", "deploy", "test"]
}
```

### mcpServers

**Type**: array of strings

List of MCP server names provided by this plugin. Servers should be defined in `.mcp.json`.

```json
{
  "mcpServers": ["code-analyzer", "file-operations"]
}
```

### dependencies

**Type**: object

NPM-style dependencies for the plugin.

```json
{
  "dependencies": {
    "prettier": "^3.0.0",
    "eslint": "^8.0.0",
    "@types/node": "^20.0.0"
  }
}
```

## Plugin Directory Structure

### Correct Structure

```text
my-plugin/
├── plugin.json            At repository root
├── marketplace.json      (optional)
├── README.md
├── .claude/
│   ├── skills/
│   │   └── my-skill/
│   │       └── SKILL.md
│   ├── agents/
│   │   └── my-agent.md
│   ├── hooks/
│   │   └── my-hook.json
│   └── commands/
│       └── my-command.md
└── .mcp.json            (if using MCP servers)
```

### Incorrect Structure

```text
my-plugin/
├── .claude-plugin/
│   └── plugin.json       Wrong location
│   └── skills/           Should be in .claude/
└── .claude/
    └── (empty)
```

## How To Fix

### Option 1: Add missing required fields

```json
# Before - missing fields
{
  "name": "my-plugin"
}

# After - all required fields
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "A useful plugin for development"
}
```

### Option 2: Fix empty fields

```json
# Before - empty values
{
  "name": "",
  "version": "1.0.0",
  "description": "   "
}

# After - proper values
{
  "name": "development-tools",
  "version": "1.0.0",
  "description": "Essential development tools and utilities"
}
```

### Option 3: Move plugin.json to root

```bash
# Before
.claude-plugin/plugin.json

# Move to root
mv .claude-plugin/plugin.json ./plugin.json
```

### Option 4: Fix JSON syntax

```json
# Before - invalid JSON
{
  "name": "my-plugin",  // Remove comments
  "version": "1.0.0",
  "description": "My plugin",  // Remove trailing comma
}

# After - valid JSON
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "My plugin"
}
```

### Option 5: Fix array types

```json
# Before - wrong type
{
  "skills": "my-skill",
  "agents": "my-agent"
}

# After - arrays
{
  "skills": ["my-skill"],
  "agents": ["my-agent"]
}
```

## Complete Examples

### Simple Plugin

```json
{
  "name": "hello-world",
  "version": "1.0.0",
  "description": "A simple hello world plugin",
  "author": "John Doe",
  "license": "MIT",
  "skills": ["hello"]
}
```

### Development Tools Plugin

```json
{
  "name": "dev-tools",
  "version": "2.3.1",
  "description": "Essential development tools including formatters and linters",
  "author": "Dev Team",
  "repository": "https://github.com/example/dev-tools",
  "license": "Apache-2.0",
  "skills": [
    "format-code",
    "lint-code",
    "run-tests"
  ],
  "commands": [
    "build",
    "test"
  ],
  "dependencies": {
    "prettier": "^3.0.0",
    "eslint": "^8.0.0"
  }
}
```

### Full-Featured Plugin

```json
{
  "name": "complete-toolkit",
  "version": "3.0.0",
  "description": "Complete development toolkit with skills, agents, hooks, and MCP servers",
  "author": "Toolkit Team",
  "repository": "https://github.com/example/complete-toolkit",
  "license": "MIT",
  "skills": [
    "code-review",
    "auto-fix",
    "generate-docs"
  ],
  "agents": [
    "code-reviewer",
    "test-generator",
    "doc-writer"
  ],
  "hooks": [
    "pre-commit",
    "post-tool-use"
  ],
  "commands": [
    "build",
    "test",
    "deploy"
  ],
  "mcpServers": [
    "file-analyzer",
    "code-metrics"
  ],
  "dependencies": {
    "@types/node": "^20.0.0",
    "prettier": "^3.0.0",
    "eslint": "^8.0.0",
    "typescript": "^5.0.0"
  }
}
```

## Common Mistakes

### Mistake 1: Missing required fields

```json
# Wrong - incomplete manifest
{
  "name": "my-plugin"
}

# Correct - all required fields
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "My plugin description"
}
```

### Mistake 2: Wrong field types

```json
# Wrong - wrong types
{
  "name": "my-plugin",
  "version": 1.0,
  "description": "My plugin",
  "skills": "single-skill"
}

# Correct - correct types
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "My plugin",
  "skills": ["single-skill"]
}
```

### Mistake 3: Invalid JSON

```json
# Wrong - JSON with comments and trailing commas
{
  "name": "my-plugin", // This is the name
  "version": "1.0.0",
  "description": "My plugin", // Trailing comma
}

# Correct - valid JSON
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "My plugin"
}
```

### Mistake 4: File in wrong location

```bash
# Wrong
.claude-plugin/plugin.json

# Correct
plugin.json  # At repository root
```

## Validation Checklist

Before publishing your plugin, verify:

- [ ] plugin.json is at repository root
- [ ] name field is present and non-empty
- [ ] version field is present and follows semver
- [ ] description field is present and descriptive
- [ ] All array fields use array type, not string
- [ ] JSON is valid (no comments, no trailing commas)
- [ ] All referenced files exist (validated by plugin-missing-file rule)
- [ ] Repository and license fields are included (recommended)

## Options

This rule does not have any configuration options.

## When Not To Use It

You should **never** disable this rule. Invalid plugin manifests will cause:

- Plugin installation failures
- Plugin not recognized by Claude Code
- Missing functionality
- Marketplace submission rejection

Always fix manifest issues rather than disabling this rule.

## Configuration

This rule should not be disabled, but if absolutely necessary:

```json
{
  "rules": {
    "plugin-invalid-manifest": "off"
  }
}
```

To change to a warning (not recommended):

```json
{
  "rules": {
    "plugin-invalid-manifest": "warning"
  }
}
```

## Related Rules

- [plugin-invalid-version](./plugin-invalid-version.md) - Version format validation
- [plugin-missing-file](./plugin-missing-file.md) - Referenced file validation

## Resources

- [Claude Code Plugin Development Guide](https://github.com/anthropics/claude-code)
- [Semantic Versioning](https://semver.org/)
- [JSON Specification](https://www.json.org/)
- [SPDX License List](https://spdx.org/licenses/)

## Version

Available since: v1.0.0
