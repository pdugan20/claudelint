# Architecture

This document describes the architecture of the Claude Validator toolkit.

## Overview

Claude Validator is designed as a dual-purpose tool:

1. **NPM Package** - Standalone CLI and library for validation
2. **Claude Code Plugin** - Interactive skills and hooks for Claude Code

Both interfaces share the same validation logic through a common core.

## Project Structure

```text
claude-validator/
├── .claude-plugin/          # Claude Code plugin metadata
│   ├── plugin.json          # Plugin manifest
│   └── marketplace.json     # Marketplace definition
├── bin/                     # CLI executables
│   └── claude-validator     # Main CLI entry point
├── dist/                    # Compiled TypeScript output
├── docs/                    # Documentation
│   ├── ROADMAP.md           # Project phases and tasks
│   ├── architecture.md      # This file
│   ├── validators.md        # Validator documentation
│   └── development.md       # Development guide
├── skills/                  # Claude Code skills
│   ├── validate-all/
│   ├── validate-claude-md/
│   ├── validate-skills/
│   └── validate-settings/
├── hooks/                   # Claude Code hooks
│   └── hooks.json
├── src/                     # Source code
│   ├── cli.ts               # CLI entry point
│   ├── index.ts             # Library exports
│   ├── validators/          # Validation logic
│   │   ├── base.ts          # Base validator class
│   │   ├── claude-md.ts     # CLAUDE.md validator
│   │   ├── skills.ts        # Skills validator
│   │   ├── settings.ts      # Settings validator
│   │   ├── hooks.ts         # Hooks validator
│   │   ├── mcp.ts           # MCP server validator
│   │   ├── plugin.ts        # Plugin validator
│   │   └── index.ts         # Validator exports
│   └── utils/               # Utilities
│       ├── file-system.ts   # File operations
│       ├── markdown.ts      # Markdown parsing
│       ├── yaml.ts          # YAML parsing
│       ├── reporting.ts     # Error/warning formatting
│       └── index.ts         # Utility exports
├── tests/                   # Test files
│   ├── validators/
│   └── utils/
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## Core Concepts

### Validators

All validators extend a common `BaseValidator` class:

```typescript
abstract class BaseValidator {
  abstract validate(): ValidationResult;
  protected reportError(message: string, location?: Location): void;
  protected reportWarning(message: string, location?: Location): void;
}

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}
```

Each validator is responsible for:

1. **Discovery** - Finding files to validate
2. **Parsing** - Reading and parsing file contents
3. **Validation** - Checking against rules
4. **Reporting** - Collecting errors and warnings

### Validation Pipeline

```text
Input Files
    ↓
Discovery (glob patterns)
    ↓
Parsing (YAML, JSON, Markdown)
    ↓
Validation (schema + custom rules)
    ↓
Reporting (errors + warnings)
    ↓
Exit Code (0=success, 1=warnings, 2=errors)
```

### Error Handling

Validators distinguish between:

- **Errors** - Must be fixed (exit code 2)
- **Warnings** - Should be fixed (exit code 1 with `--warnings-as-errors`)
- **Info** - Informational only (exit code 0)

### Configuration

Validators can be configured via:

1. **CLI flags** - `--verbose`, `--warnings-as-errors`, `--path`
2. **Config file** - `.claudevalidatorrc` (future)
3. **Package.json** - `claudeValidator` field (future)

## Validator Implementations

### CLAUDE.md Validator

**Validates:**

- File size (warning at 35KB, error at 40KB)
- Markdown formatting (via markdownlint rules)
- Import syntax (`@path/to/file`)
- Recursive import depth (max 5)
- YAML frontmatter in rules files
- `paths` glob patterns

**Algorithm:**

1. Find all CLAUDE.md files (project, user, rules)
2. Check file sizes
3. Parse markdown and frontmatter
4. Validate import statements
5. Check for circular imports
6. Validate glob patterns

### Skills Validator

**Validates:**

- SKILL.md exists
- YAML frontmatter schema
- Required fields (name, description)
- Optional field types
- Referenced files exist
- Markdown formatting
- String substitution syntax

**Algorithm:**

1. Find all `.claude/skills/*/SKILL.md` files
2. Parse YAML frontmatter
3. Validate against schema
4. Check file references
5. Validate markdown content

### Settings Validator

**Validates:**

- JSON syntax
- Schema compliance (using Zod)
- Permission rule syntax
- Tool name validity
- Model name validity
- File path existence
- Environment variable names

**Algorithm:**

1. Find settings.json files (user, project, local)
2. Parse JSON
3. Validate against Zod schema
4. Check cross-references
5. Validate paths

### Hooks Validator

**Validates:**

- hooks.json schema
- Event name validity
- Hook type correctness
- Script file existence
- Script executability
- Matcher pattern syntax

**Algorithm:**

1. Find hooks.json files
2. Parse JSON
3. Validate event names
4. Check script files
5. Validate matcher patterns

### MCP Server Validator

**Validates:**

- .mcp.json schema
- Server name uniqueness
- Transport type validity
- Command/URL syntax
- Environment variable syntax
- Variable expansion patterns

**Algorithm:**

1. Find .mcp.json files
2. Parse JSON
3. Validate schema
4. Check server names
5. Validate commands/URLs

### Plugin Validator

**Validates:**

- plugin.json schema
- Semantic versioning
- Directory structure
- File references
- Cross-references (skills, agents)
- marketplace.json schema

**Algorithm:**

1. Find .claude-plugin/plugin.json
2. Parse JSON
3. Validate schema
4. Check directory structure
5. Validate file references

## CLI Implementation

The CLI uses `commander` for argument parsing:

```typescript
program
  .name('claude-validator')
  .description('Validation toolkit for Claude Code projects')
  .version('0.1.0');

program
  .command('check-all')
  .description('Run all validators')
  .option('-v, --verbose', 'Verbose output')
  .option('--warnings-as-errors', 'Treat warnings as errors')
  .action(checkAll);

program
  .command('check-claude-md')
  .description('Validate CLAUDE.md files')
  .option('--path <path>', 'Custom path to CLAUDE.md')
  .action(checkClaudeMd);
```

## Plugin Implementation

Skills wrap CLI commands:

```markdown
# skills/validate-all/SKILL.md

---
name: validate-all
description: Run all Claude Code validators
allowed-tools: [Bash]
---

Runs comprehensive validation of all Claude Code components.

\`\`\`bash
npx claude-validator check-all --verbose
\`\`\`
```

Hooks trigger validation automatically:

```json
{
  "hooks": [
    {
      "event": "PreToolUse",
      "matcher": {
        "tool": "Write",
        "pattern": "**/CLAUDE.md"
      },
      "type": "command",
      "command": "npx claude-validator check-claude-md"
    }
  ]
}
```

## Testing Strategy

### Unit Tests

- Test each validator independently
- Mock file system operations
- Test error/warning reporting
- Test edge cases

### Integration Tests

- Test validator combinations
- Test CLI argument parsing
- Test exit codes
- Test output formatting

### End-to-End Tests

- Test on real projects (NextUp, nextup-backend)
- Test plugin installation
- Test skill invocation
- Test hook triggering

## Performance Considerations

### Optimization Strategies

1. **Lazy loading** - Only load validators that are needed
2. **Parallel validation** - Run validators concurrently
3. **Caching** - Cache parsed files for repeated validations
4. **Incremental validation** - Only validate changed files

### Benchmarks

Target performance (Phase 7):

- CLAUDE.md validation: < 100ms
- Skills validation: < 500ms for 20 skills
- Full validation: < 2s for typical project

## Extension Points

The architecture supports:

1. **Custom validators** - Extend BaseValidator
2. **Custom rules** - Configure via .claudevalidatorrc
3. **Plugins** - Add validators via plugins
4. **Hooks** - Integrate with external tools

## Future Architecture

### Planned Enhancements

1. **Language Server Protocol** - Real-time validation in editors
2. **Watch mode** - Continuous validation
3. **Daemon mode** - Background validation service
4. **Web UI** - Visualization of validation results

### Plugin Ecosystem

Future plugin support:

- Third-party validators
- Custom rule sets
- Team-specific validations
- Industry-specific standards
