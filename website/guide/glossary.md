---
description: Definitions for key claudelint terms including rules, validators, severity levels, violations, formatters, and Claude Code file types like SKILL.md and CLAUDE.md.
---

# Glossary

This glossary defines key terminology used throughout claudelint documentation.

## Core Concepts

### Rule

A single validation check that examines one specific aspect of a file.

**Examples:**

- `skill-missing-version` - Checks if SKILL.md has a version field
- `claude-md-size` - Checks if CLAUDE.md exceeds 40KB
- `hooks-invalid-event` - Checks if hook event names are valid

**Properties:**

- Has unique ID (kebab-case)
- Belongs to a category
- Can be enabled/disabled in config
- May support auto-fix

Not to be confused with Claude Code's [`.claude/rules/`](https://code.claude.com/docs/en/memory#modular-rules-with-claude%2Frules%2F) directory, which stores modular behavioral instructions that Claude loads at session start (e.g., code style guidelines, testing conventions). claudelint *validates* those files but uses the term "rule" to mean a validation check, not a behavioral instruction.

**See:** [Custom Rules Guide](/development/custom-rules)

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

**See:** [Architecture - Validator Implementations](/development/architecture#validator-implementations)

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
/project/SKILL.md (1 error)
  12  error  Skill frontmatter lacks "version" field  skill-missing-version
```

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

Run `claudelint list-rules --fixable` to see all rules that support auto-fix.

**See:** [Auto-fix Guide](./auto-fix.md)

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
    "claude-md-size": "warn"
  },
  "ignorePatterns": ["node_modules/", "dist/"]
}
```

**See:** [Configuration Guide](./configuration.md)

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

### Rule Options

Configuration values that customize how a specific rule behaves.

**Simple form** (severity only):

```json
{
  "rules": {
    "skill-missing-version": "error"
  }
}
```

**Full form** (severity + options):

```json
{
  "rules": {
    "claude-md-size": {
      "severity": "warn",
      "options": {
        "maxSize": 50000
      }
    }
  }
}
```

**See:** [Configuration Guide](./configuration.md#rules)

## Execution

### Validation Result

The output from running validation.

**Internal interface** (used by validators):

- `valid` - Whether validation passed (no errors or warnings)
- `errors` - List of validation errors found
- `warnings` - List of validation warnings found
- `deprecatedRulesUsed` - Deprecated rules encountered during validation

**Public API interface** (`LintResult`, used by programmatic API):

- `filePath` - Absolute path to the file that was linted
- `messages` - Array of validation messages
- `suppressedMessages` - Messages suppressed via inline comments
- `errorCount` / `warningCount` - Counts by severity

**See:** [API - Types](/api/types)

### Formatter

A component that transforms validation results into human-readable output.

**Built-in Formatters:**

- **stylish** (default) - Colorful, grouped by file
- **compact** - One violation per line
- **json** - Machine-readable JSON
- **sarif** - Static Analysis Results Interchange Format (for CI integrations)

**Usage:**

```bash
claudelint check-all --format json
claudelint check-all --format compact
```

**Custom Formatters:**

You can write custom formatters using the programmatic API.

**See:** [API - Formatters](/api/formatters)

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

## File Types

### CLAUDE.md

The main configuration file for Claude Code projects. Contains:

- Project context and instructions
- `@import` statements for modular content
- Documentation and guidelines

**Validation:** ClaudeMdValidator checks:

- File size (40KB limit)
- Import syntax and references
- Circular imports
- Glob patterns

### Rules Files (`.claude/rules/`)

Modular markdown files in `.claude/rules/` that contain behavioral instructions for Claude Code. Each file covers a single topic (e.g., code style, testing conventions, security requirements) and has the same priority as `.claude/CLAUDE.md`. Rules without a `paths` field are loaded unconditionally at session start. Rules with a `paths` field are loaded conditionally — only when Claude is working with files matching the specified patterns.

Not to be confused with claudelint [rules](#rule), which are validation checks. Claude Code rules files are what claudelint *validates* — claudelint rules are the checks that do the validating.

**Features:**

- Optional `paths` frontmatter to scope instructions to specific file patterns (conditional loading)
- Subdirectory organization (e.g., `rules/frontend/react.md`)
- Symlink support for sharing rules across projects

**Validation:** ClaudeMdValidator checks:

- Frontmatter schema (`paths` field with valid glob patterns)
- Glob pattern correctness (no backslashes, no overly broad patterns)
- Circular symlinks

**See:** [Claude Code Rules Documentation](https://code.claude.com/docs/en/memory#modular-rules-with-claude%2Frules%2F)

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

### Agent Files

Flat `.md` files that define Claude Code sub-agents. Located at `.claude/agents/<name>.md` (project) or `agents/<name>.md` (plugin).

The agent name comes from YAML frontmatter, and the file body serves as the system prompt. Unlike skills, which use a directory structure with a `SKILL.md` entrypoint, agents are single files where the filename determines the agent identity.

Not to be confused with OpenAI's [AGENTS.md](https://developers.openai.com/codex/guides/agents-md/), which provides project-wide instructions for Codex agents (similar to Claude Code's `CLAUDE.md`).

**Validation:** AgentsValidator checks:

- Frontmatter schema (name, description, model, tools, skills, color)
- Name/filename consistency
- Skill and tool references
- Body content length

**See:** [Agents Validator](/validators/agents), [Claude Code Sub-agents](https://code.claude.com/docs/en/sub-agents)

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

## Development

### Custom Rule

A user-defined validation rule stored in `.claudelint/rules/`.

**Properties:**

- Written in JavaScript or TypeScript
- Loaded automatically on startup
- Can use helper functions from `claudelint/utils`
- Must have unique rule ID

**Example:**

```typescript
// .claudelint/rules/no-profanity.ts
import type { Rule } from 'claude-code-lint';

export const rule: Rule = {
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

### Built-in Rule

A validation rule that ships with claudelint. Located in [`src/rules/{category}/`](https://github.com/pdugan20/claudelint/tree/main/src/rules).

**Properties:**

- Written in TypeScript
- Documented via `meta.docs` metadata (auto-generated)
- Tested in `tests/rules/{category}/{rule-id}.test.ts`
- Auto-registered on build

**Contributing:** See [Contributing Guide](/development/contributing#adding-validation-rules)

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

### Functional API

Stateless functions for simple linting tasks.

**Usage:**

```typescript
import { lint, formatResults } from 'claude-code-lint';

const results = await lint(['**/*.md'], { fix: true });
const output = await formatResults(results, 'stylish');
```

**See:** [API - Functional API](/api/functional-api)

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

## CLI

### Command

An action performed by the claudelint CLI.

**Common Commands:**

- `check-all` - Run all validators
- `validate-claude-md` - Validate CLAUDE.md only
- `validate-skills` - Validate skills only
- `list-rules` - Show all available rules
- `init` - Create config file
- `cache-clear` - Clear validation cache

**See:** [CLI Reference](./cli-reference.md)

### Flag / Option

A parameter passed to a CLI command to modify its behavior.

**Common Flags:**

- `--fix` - Auto-fix violations
- `--fix-dry-run` - Preview fixes
- `--format FORMAT` - Output format (stylish, json, compact, sarif)
- `--verbose` - Show detailed output
- `--strict` - Treat warnings as errors
- `--max-warnings N` - Fail if more than N warnings
- `--no-cache` - Disable caching

### Exit Code

The numeric status returned by the CLI indicating success or failure.

**Exit Codes:**

- **0** - Success (no violations)
- **1** - Linting issues found (errors or warnings)
- **2** - Fatal error (crash, invalid config)

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

### Markdownlint

A markdown linter used alongside claudelint.

**Division of Responsibility:**

- **Markdownlint** - Generic markdown structure and formatting
- **claudelint** - Claude-specific validation (imports, size limits, etc.)

**See:** [CLI Reference - Formatting](./cli-reference.md#formatting)

### Prettier

A code formatter used alongside claudelint.

**Division of Responsibility:**

- **Prettier** - Code formatting and whitespace
- **claudelint** - Configuration validation

**See:** [CLI Reference - Formatting](./cli-reference.md#formatting)

### Claude Code `/doctor`

Claude Code's built-in diagnostic command (`/doctor` in-session or `claude doctor` from the terminal).

**Division of Responsibility:**

- **`/doctor`** - Runtime health checks (installation, binary path, auto-updates, MCP connectivity, search functionality, config file parsing, keybinding issues)
- **claudelint** - Static analysis (cross-file references, naming conventions, security issues, best practices, content quality, deprecation warnings)

**Where they overlap:**

Both tools check MCP configuration, settings files, plugin structure, and CLAUDE.md size. `/doctor` validates "can Claude Code load this?" while claudelint validates "is this well-structured, correct, and following best practices?"

**What only claudelint catches:**

- Skills validation (<RuleCount category="skills" /> rules) — `/doctor` does not validate skills
- Cross-file reference integrity (broken imports, missing files)
- Security issues (hardcoded secrets, dangerous commands, path traversal)
- Naming conventions and content quality
- Deprecated patterns and migration guidance

## Acronyms

| Acronym  | Full Term                         | Description                                             |
| -------- | --------------------------------- | ------------------------------------------------------- |
| **MCP**  | Model Context Protocol            | Protocol for connecting Claude to external data sources |
| **LSP**  | Language Server Protocol          | Protocol for editor/IDE language features               |
| **CLI**  | Command Line Interface            | Terminal-based interface for claudelint           |
| **API**  | Application Programming Interface | Programmatic interface for Node.js                      |
| **YAML** | YAML Ain't Markup Language        | Data serialization format used in frontmatter           |
| **JSON** | JavaScript Object Notation        | Data format for config files                            |

## See Also

- [Getting Started](./getting-started.md) - Installation and first steps
- [Configuration](./configuration.md) - Configuring claudelint
- [CLI Reference](./cli-reference.md) - Complete command documentation
- [Custom Rules](/development/custom-rules) - Writing custom rules
- [Architecture](/development/architecture) - System design
- [Troubleshooting](./troubleshooting.md) - Common issues and solutions
