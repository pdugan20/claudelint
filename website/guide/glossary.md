# Glossary

This glossary defines key terminology used throughout claudelint documentation.

## Core Concepts

### Rule

A single validation check that examines one specific aspect of a file.

**Examples:**

- `skill-missing-version` - Checks if SKILL.md has a version field
- `claude-md-size-error` - Checks if CLAUDE.md exceeds 40KB
- `hooks-invalid-event` - Checks if hook event names are valid

**Properties:**

- Has unique ID (kebab-case)
- Belongs to a category
- Can be enabled/disabled in config
- May support auto-fix

**See:** [Custom Rules Guide](/development/custom-rules)

---

### Validator

A component that orchestrates multiple rules for a specific file type or configuration area.

**Examples:**

- **ClaudeMdValidator** - Runs all CLAUDE.md rules
- **SkillsValidator** - Runs all skill-related rules
- **SettingsValidator** - Runs all settings.json rules

**Responsibilities:**

- Discovers files to validate
- Executes relevant rules
- Aggregates results
- Handles caching

**Relationship:** Validators contain many rules. Each validator runs all rules for its category.

**See:** [Architecture - Validators](/development/architecture#validators)

---

### Severity

The importance level of a rule violation.

**Levels:**

- **error** - Critical issue that must be fixed. Causes non-zero exit code.
- **warn** - Advisory issue that should be fixed. Does not fail validation by default.
- **off** - Rule is disabled and won't run.

**Configuration:**

```json
{
  "rules": {
    "skill-missing-version": "error",
    "skill-missing-changelog": "warn",
    "skill-missing-examples": "off"
  }
}
```

**CLI Flags:**

- `--strict` - Treat warnings as errors
- `--max-warnings N` - Fail if more than N warnings

---

### Violation

An instance where a rule's validation check has failed.

**Properties:**

- **message** - Human-readable description of the issue
- **ruleId** - Which rule was violated
- **severity** - error or warning
- **filePath** - File containing the violation
- **line** (optional) - Line number of the issue
- **column** (optional) - Column number of the issue
- **fix** (optional) - Suggestion for how to resolve

**Example Output:**

```text
/project/SKILL.md
  12:1  error  Skill frontmatter lacks "version" field  skill-missing-version
```

---

### Context

The `RuleContext` object passed to a rule's `validate()` function containing file information and reporting methods.

**Properties:**

```typescript
interface RuleContext {
  filePath: string; // Path to file being validated
  fileContent: string; // Full content of the file
  options: Record<string, unknown>; // Rule-specific options from config
  report: (issue: RuleIssue) => void; // Report violations
}
```

**Usage:**

```typescript
validate: async (context) => {
  const { filePath, fileContent } = context;

  if (someCondition) {
    context.report({
      message: 'Issue found',
      line: 42,
    });
  }
};
```

---

### Fixer / Auto-Fix

A mechanism that automatically corrects rule violations.

**Properties:**

- Only available for rules with `fixable: true`
- Applies transformations to file content
- Can be previewed with `--fix-dry-run`
- Applied with `--fix` flag

**Example:**

```bash
# Preview fixes
claudelint check-all --fix-dry-run

# Apply fixes
claudelint check-all --fix
```

**Fixable Rules:**

- `skill-missing-version` - Adds `version: "1.0.0"` to frontmatter
- `skill-missing-shebang` - Adds `#!/usr/bin/env bash` to shell scripts
- `skill-missing-changelog` - Creates CHANGELOG.md template

**See:** [Auto-fix Guide](./auto-fix.md)

---

### Category

A grouping of related rules.

**Built-in Categories:**

- **ClaudeMd** - CLAUDE.md file validation
- **Skills** - Skill validation (SKILL.md, scripts)
- **Settings** - settings.json validation
- **Hooks** - hooks.json validation
- **MCP** - MCP server configuration
- **Plugin** - Plugin manifest validation
- **Agents** - Agent configuration
- **LSP** - Language Server Protocol config
- **OutputStyles** - Output style configuration
- **Commands** - Command validation

**Usage:**

```bash
# List rules by category
claudelint list-rules --category Skills
```

---

## Configuration

### Config File

A file that customizes claudelint behavior.

**Supported Files:**

- `.claudelintrc.json` (recommended)
- `package.json` (with `claudelint` key)

**Example:**

```json
{
  "rules": {
    "skill-missing-version": "error",
    "claude-md-size-warning": "warn"
  },
  "ignorePatterns": ["node_modules/", "dist/"]
}
```

**See:** [Configuration Guide](./configuration.md)

---

### Inline Disable

A comment in a file that disables specific rules for the next line or entire file.

**Syntax:**

```markdown
<!-- claudelint-disable-next-line rule-id -->

Content that would normally violate the rule

<!-- claudelint-disable rule-id -->

Multiple lines
That are exempt
From the rule

<!-- claudelint-enable rule-id -->
```

**See:** [Inline Disables](./inline-disables.md)

---

### Ignore Pattern

A glob pattern that tells claudelint to skip certain files or directories.

**Configuration:**

```json
{
  "ignorePatterns": ["node_modules/", "dist/", "**/*.test.md"]
}
```

**Or use `.claudelintignore` file:**

```text
node_modules/
dist/
*.log
```

---

### Rule Options

Configuration values that customize how a specific rule behaves.

**Example:**

```json
{
  "rules": {
    "skill-body-too-long": ["error", { "maxLength": 5000 }]
  }
}
```

**Format:**

```json
{
  "rules": {
    "rule-id": "severity", // Simple
    "rule-id": ["severity", { "option": "value" }] // With options
  }
}
```

**See:** [Configuration Guide](./configuration.md#rules)

---

## Execution

### Validation Result

The output from running validation on one or more files.

**Properties:**

```typescript
interface ValidationResult {
  filePath: string; // File that was validated
  errorCount: number; // Number of errors
  warningCount: number; // Number of warnings
  fixableErrorCount: number; // Errors that can be auto-fixed
  fixableWarningCount: number; // Warnings that can be auto-fixed
  messages: ValidationMessage[]; // All violations
}
```

---

### Formatter

A component that transforms validation results into human-readable output.

**Built-in Formatters:**

- **stylish** (default) - Colorful, grouped by file
- **compact** - One violation per line
- **json** - Machine-readable JSON

**Usage:**

```bash
claudelint check-all --format json
claudelint check-all --format compact
```

**Custom Formatters:**

You can write custom formatters using the programmatic API.

**See:** [API - Formatters](/api/formatters)

---

### Cache

A performance optimization that stores validation results and skips re-validating unchanged files.

**Properties:**

- Enabled by default
- Stored in `.claudelint-cache/`
- Invalidated when files change (mtime-based)
- Cleared when upgrading claudelint
- Can be disabled with `--no-cache`

**Commands:**

```bash
# Use cache (default)
claudelint check-all

# Disable cache
claudelint check-all --no-cache

# Clear cache
claudelint cache-clear
```

**See:** [CLI Reference - Cache Management](./cli-reference.md#cache-management)

---

## File Types

### CLAUDE.md

The main configuration file for Claude Code projects. Contains:

- Project context and instructions
- `@import` statements for modular content
- Documentation and guidelines

**Validation:** ClaudeMdValidator checks:

- File size (40KB error / 35KB warning)
- Import syntax and references
- Circular imports
- Glob patterns

---

### SKILL.md

The main file for a Claude Code skill. Contains:

- YAML frontmatter with metadata
- Markdown body with usage instructions
- Examples and documentation

**Required Frontmatter Fields:**

```yaml
---
name: skill-name
description: Brief description
version: 1.0.0
---
```

**Validation:** SkillsValidator checks:

- Frontmatter schema
- Version format
- Referenced files
- Shell script security
- Documentation quality

---

### settings.json

Claude Code project settings. Located at `.claude/settings.json`.

**Example:**

```json
{
  "model": "claude-sonnet-4-5",
  "allowedTools": ["Read", "Edit", "Bash"],
  "customInstructions": "Be concise"
}
```

**Validation:** SettingsValidator checks:

- JSON schema
- File path references
- Permission rules
- Environment variables

---

### hooks.json

Defines automation hooks for Claude Code. Located at `.claude/hooks.json` (or `.claude/hooks/hooks.json`).

**Example:**

```json
{
  "SessionStart": [
    {
      "hooks": [
        {
          "type": "command",
          "command": "claudelint check-all"
        }
      ]
    }
  ]
}
```

**Validation:** HooksValidator checks:

- Valid event names
- Script file existence
- Configuration schema

---

## Development

### Custom Rule

A user-defined validation rule stored in `.claudelint/rules/`.

**Properties:**

- Written in JavaScript or TypeScript
- Loaded automatically on startup
- Can use helper functions from `claudelint/utils`
- Must have unique rule ID

**Example:**

```javascript
// .claudelint/rules/no-profanity.js
module.exports.rule = {
  meta: {
    id: 'no-profanity',
    name: 'No Profanity',
    category: 'Skills',
    severity: 'error',
  },
  validate: async (context) => {
    // Validation logic
  },
};
```

**See:** [Custom Rules Guide](/development/custom-rules)

---

### Built-in Rule

A validation rule that ships with claudelint. Located in `src/rules/{category}/`.

**Properties:**

- Written in TypeScript
- Documented via `meta.docs` metadata (auto-generated)
- Tested in `tests/rules/{category}/{rule-id}.test.ts`
- Auto-registered on build

**Contributing:** See [Contributing Guide](/development/contributing#adding-validation-rules)

---

### Rule Metadata

Information describing a rule's behavior and properties.

**Required Fields:**

```typescript
interface RuleMetadata {
  id: string; // Unique kebab-case identifier
  name: string; // Human-readable name
  description: string; // What the rule checks
  category: string; // Rule grouping
  severity: 'error' | 'warn'; // Default severity
  fixable: boolean; // Can auto-fix violations
  deprecated: boolean; // Is rule deprecated
  since: string; // Version introduced
}
```

---

### Frontmatter

YAML metadata at the beginning of a markdown file, enclosed by `---` delimiters.

**Example:**

```yaml
---
name: my-skill
description: Does something useful
version: 1.0.0
tags: [automation, cli]
---
# Markdown content starts here
```

**Parsing:**

```typescript
// Internal utility used by rule implementations
import { extractFrontmatter } from '../../utils/formats/markdown';

const result = extractFrontmatter(fileContent);
const { frontmatter, body } = result;
```

---

## Programmatic API

### ClaudeLint Class

The main class for programmatic usage.

**Usage:**

```typescript
import { ClaudeLint } from 'claude-code-lint';

const linter = new ClaudeLint({ fix: true });
const results = await linter.lintFiles(['**/*.md']);
```

**See:** [API - ClaudeLint Class](/api/claudelint-class)

---

### Functional API

Stateless functions for simple linting tasks.

**Usage:**

```typescript
import { lint, formatResults } from 'claude-code-lint';

const results = await lint(['**/*.md'], { fix: true });
const output = await formatResults(results, 'stylish');
```

**See:** [API - Functional API](/api/functional-api)

---

### RuleRegistry

Central registry of all available rules (built-in and custom).

**Usage:**

```typescript
import { RuleRegistry } from 'claude-code-lint';

// Get all rules
const allRules = RuleRegistry.getAllRules();

// Get rules by category
const skillRules = RuleRegistry.getRulesByCategory('Skills');

// Get single rule
const rule = RuleRegistry.getRule('skill-missing-version');
```

---

## CLI

### Command

An action performed by the claudelint CLI.

**Common Commands:**

- `check-all` - Run all validators
- `check-claude-md` - Validate CLAUDE.md only
- `validate-skills` - Validate skills only
- `list-rules` - Show all available rules
- `init` - Create config file
- `cache-clear` - Clear validation cache

**See:** [CLI Reference](./cli-reference.md)

---

### Flag / Option

A parameter passed to a CLI command to modify its behavior.

**Common Flags:**

- `--fix` - Auto-fix violations
- `--fix-dry-run` - Preview fixes
- `--format FORMAT` - Output format (stylish, json, compact)
- `--verbose` - Show detailed output
- `--strict` - Treat warnings as errors
- `--max-warnings N` - Fail if more than N warnings
- `--no-cache` - Disable caching

---

### Exit Code

The numeric status returned by the CLI indicating success or failure.

**Exit Codes:**

- **0** - Success (no violations)
- **1** - Linting issues found (errors or warnings)
- **2** - Fatal error (crash, invalid config)

---

## Related Projects

### ESLint

A JavaScript linter that inspired claudelint's architecture.

**Similarities:**

- Rule-based validation
- Configurable severity levels
- Auto-fix support
- Custom rules for extensibility

**Differences:**

- ESLint: JavaScript/TypeScript code
- claudelint: Claude Code configuration

---

### Markdownlint

A markdown linter used alongside claudelint.

**Division of Responsibility:**

- **Markdownlint** - Generic markdown structure and formatting
- **claudelint** - Claude-specific validation (imports, size limits, etc.)

**See:** [CLI Reference - Formatting](./cli-reference.md#formatting)

---

### Prettier

A code formatter used alongside claudelint.

**Division of Responsibility:**

- **Prettier** - Code formatting and whitespace
- **claudelint** - Configuration validation

**See:** [CLI Reference - Formatting](./cli-reference.md#formatting)

---

## Acronyms

| Acronym  | Full Term                         | Description                                             |
| -------- | --------------------------------- | ------------------------------------------------------- |
| **MCP**  | Model Context Protocol            | Protocol for connecting Claude to external data sources |
| **LSP**  | Language Server Protocol          | Protocol for editor/IDE language features               |
| **CLI**  | Command Line Interface            | Terminal-based interface for claudelint           |
| **API**  | Application Programming Interface | Programmatic interface for Node.js                      |
| **YAML** | YAML Ain't Markup Language        | Data serialization format used in frontmatter           |
| **JSON** | JavaScript Object Notation        | Data format for config files                            |

---

## See Also

- [Getting Started](./getting-started.md) - Installation and first steps
- [Configuration](./configuration.md) - Configuring claudelint
- [CLI Reference](./cli-reference.md) - Complete command documentation
- [Custom Rules](/development/custom-rules) - Writing custom rules
- [Architecture](/development/architecture) - System design
- [Troubleshooting](./troubleshooting.md) - Common issues and solutions
