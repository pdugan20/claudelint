# Architecture

This document describes the internal architecture of claudelint for contributors. For the project's validation philosophy, scope boundaries, and design principles, see [Design Philosophy](/development/design-philosophy).

## Rules vs Validators

claudelint uses a **rule-based architecture** inspired by ESLint. Understanding the distinction between rules and validators is critical for contributors.

### Rules (What Contributors Write)

**Rules** are individual, focused validation checks located in [`src/rules/{category}/{rule-id}.ts`](https://github.com/pdugan20/claudelint/tree/main/src/rules/).

**Characteristics:**

- **<RuleCount category="total" /> rules total** organized into <RuleCount category="categories" /> categories (ClaudeMd, Skills, Settings, Hooks, MCP, Plugin, Agents, Output Styles, LSP, Commands)
- **User-configurable** - Can be enabled/disabled, severity changed per-project
- **Self-contained** - Each rule validates one specific aspect
- **Metadata-driven** - Include id, name, description, severity, fixable flag
- **ESLint-style** - Similar pattern to ESLint rules

### Validators (Internal Orchestrators)

**Validators** are internal orchestration classes in [`src/validators/`](https://github.com/pdugan20/claudelint/tree/main/src/validators/) that collect and run rules.

**Characteristics:**

- **10 validators** (one per category)
- **Not user-facing** - Users interact with rules, not validators
- **Implementation detail** - Orchestrate file discovery, parsing, rule execution
- **Extend FileValidator or SchemaValidator** - Share common validation infrastructure

**Validator Responsibilities:**

1. **File Discovery** - Find files to validate (glob patterns)
2. **File Parsing** - Read and parse file contents (YAML, JSON, Markdown)
3. **Rule Orchestration** - Collect category rules, call validate(), aggregate results
4. **Result Reporting** - Format and report violations to CLI

### What Should Contributors Do?

#### DO: Write Rules

- Create new rules in [`src/rules/{category}/{rule-id}.ts`](https://github.com/pdugan20/claudelint/tree/main/src/rules/)
- Follow the Rule interface and metadata schema
- Write focused, single-purpose validation checks
- See [Contributing Guide](/development/contributing#adding-validation-rules) for the complete guide

#### DON'T: Extend Validators

- Don't create new validators (unless adding a new category)
- Don't modify validator orchestration logic
- Don't write validation logic directly in validators

## Project Structure

```text
claudelint/
├── src/
│   ├── api/               # Library API layer
│   ├── cli/               # CLI commands and utilities
│   │   ├── commands/      # Individual CLI commands
│   │   └── utils/         # CLI-specific utilities (logger, config-loader)
│   ├── rules/             # Validation rules (auto-discovered)
│   │   ├── claude-md/     # CLAUDE.md rules
│   │   ├── skills/        # Skills rules
│   │   ├── settings/      # Settings rules
│   │   ├── hooks/         # Hooks rules
│   │   ├── mcp/           # MCP rules
│   │   ├── plugin/        # Plugin rules
│   │   ├── agents/        # Agents rules
│   │   ├── lsp/           # LSP rules
│   │   ├── output-styles/ # Output Styles rules
│   │   └── commands/      # Commands rules
│   ├── schemas/           # Zod schemas and constants
│   ├── types/             # TypeScript types and interfaces
│   ├── validators/        # Validator orchestrators
│   │   ├── file-validator.ts    # Base class for text/markdown validators
│   │   ├── schema-validator.ts  # Base class for JSON schema validators
│   │   ├── claude-md.ts         # CLAUDE.md validator
│   │   ├── skills.ts            # Skills validator
│   │   └── ...                  # Other validators
│   └── utils/             # Shared utilities
│       ├── cache.ts       # Validation result caching
│       ├── config/        # Configuration loading and resolution
│       ├── diagnostics/   # Structured diagnostic collection
│       ├── filesystem/    # File system operations
│       ├── formats/       # Markdown/JSON/YAML parsing
│       ├── reporting/     # Output formatting and progress
│       ├── rules/         # Rule registry and custom rule loader
│       ├── validators/    # Validator registry and factory
│       └── workspace/     # Monorepo workspace detection
├── tests/                 # Test files
├── skills/                # Claude Code plugin skills
├── .claude/hooks/         # Claude Code plugin hooks
├── .claude-plugin/        # Plugin manifest and metadata
├── website/               # VitePress documentation site
├── scripts/               # Build and automation scripts
└── schemas/               # Generated JSON schemas
```

## Validator Implementations

### CLAUDE.md Validator

**Validates (Claude-specific only):**

- File size limits (warning at 35KB, error at 40KB)
- `@import` syntax and referenced file existence
- Recursive import depth (max 5 levels to prevent circular imports)
- YAML frontmatter schema in `.claude/rules/*.md` files
- `paths` glob pattern validity

### Skills Validator

**Validates (Claude-specific only):**

- `SKILL.md` file existence in skill directories
- YAML frontmatter schema compliance
- Required fields: `name`, `description`
- Optional field types: `usage`, `allowed-tools`, `allowed-prompts`
- Referenced files in skill directory exist
- String substitution syntax (`{{VAR}}`) validity

### Settings Validator

**Validates:** JSON schema, permission rule syntax, tool/model name validity, file paths, environment variables.

### Hooks Validator

**Validates:** hooks.json schema, event names, hook types, script existence, matcher patterns.

### MCP Server Validator

**Validates:** .mcp.json schema, server name uniqueness, transport types, command/URL syntax, environment variables.

### Plugin Validator

**Validates:** plugin.json schema, semantic versioning, directory structure, file references, cross-references.

### Additional Validators

- **Agents** - Agent structure, frontmatter, model/tool/skill references
- **LSP** - LSP configuration files, server names, commands
- **Output Styles** - Style frontmatter and structure
- **Commands** - Deprecated directory detection, migration suggestions

## Error Handling

Validators distinguish between:

- **Errors** - Must be fixed (exit code 2)
- **Warnings** - Should be fixed (exit code 1 with `--warnings-as-errors`)
- **Info** - Informational only (exit code 0)

## Configuration

Validators can be configured via:

1. **CLI flags** - `--verbose`, `--warnings-as-errors`, `--path`, `--fix`
2. **Config file** - `.claudelintrc.json`

See the [Rule System](/development/rule-system) for details on the rule registry, implementation patterns, and how validators execute rules. See [Internals](/development/internals) for caching, parallel validation, and CLI implementation details.
