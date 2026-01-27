# Architecture

This document describes the architecture of the claudelint toolkit.

## Overview

claudelint is designed as a dual-purpose tool:

1. **NPM Package** - Standalone CLI and library for validation
2. **Claude Code Plugin** - Interactive skills and hooks for Claude Code

Both interfaces share the same validation logic through a common core.

## Validation Philosophy

claudelint follows the **separation of concerns** pattern established by successful linter ecosystems (ESLint + Prettier, markdownlint + Vale). This philosophy emphasizes:

### Complementary Tools, Not Comprehensive

claudelint is **not** a comprehensive linting solution. Instead, it:

- **Does one thing well** - Validates Claude-specific configurations
- **Works alongside existing tools** - Complements markdownlint, prettier, etc.
- **Avoids duplication** - Delegates generic validation to specialized tools

### Scope: Claude-Specific Validation Only

**In Scope:**

- Claude context constraints (file size limits, import depth)
- Claude-specific syntax (`@import` statements)
- Claude configuration schemas (skills frontmatter, settings, hooks)
- Claude ecosystem validation (MCP servers, plugins)
- Cross-reference integrity (files referenced actually exist)

**Out of Scope (delegate to existing tools):**

- Generic markdown formatting (MD041, MD031, etc.) → Use **markdownlint**
- Code formatting and whitespace → Use **prettier**
- Spelling and grammar → Use **Vale** or similar
- JSON/YAML syntax errors → Handled by parsers, not validated separately

### Design Principles

1. **Domain Expertise** - Focus on deep Claude knowledge, not generic rules
2. **No Conflicts** - Never overlap with existing tool responsibilities
3. **User Control** - Users configure complementary tools independently
4. **Performance** - Stay lightweight by avoiding redundant validation
5. **Ecosystem Integration** - Provide clear guidance on multi-tool setups

### Rationale

Following the ESLint + Prettier model:

- **ESLint** handles code quality and safety rules
- **Prettier** handles formatting
- Both tools work together without conflicts

Similarly with claudelint:

- **markdownlint** handles generic markdown structure
- **prettier** handles formatting
- **claudelint** handles Claude-specific validation

This approach ensures users get the best tool for each job, without conflicts or confusion.

## Project Structure

```text
claudelint/
├── .claude-plugin/          # Claude Code plugin metadata
│   ├── plugin.json          # Plugin manifest
│   └── marketplace.json     # Marketplace definition
├── bin/                     # CLI executables
│   └── claudelint           # Main CLI entry point
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
2. **Config file** - `.claudelintrc` (future)
3. **Package.json** - `claudelint` field (future)

## Validator Implementations

### CLAUDE.md Validator

**Validates (Claude-specific only):**

- File size limits (based on Claude context window constraints)
  - Warning at 35KB (approaching limit)
  - Error at 40KB (exceeds recommended limit)
- `@import` syntax and referenced file existence
- Recursive import depth (max 5 levels to prevent circular imports)
- YAML frontmatter schema in `.claude/rules/*.md` files
- `paths` glob pattern validity

**Note:** Generic markdown formatting (H1 headings, blank lines, code fence languages) is handled by markdownlint, not claudelint.

**Algorithm:**

1. Find all CLAUDE.md files (project root, `~/.claude/`, `.claude/rules/`)
2. Check file sizes against Claude limits
3. Parse and validate YAML frontmatter (rules files only)
4. Extract and validate `@import` statements
5. Check imported files exist and are readable
6. Detect circular import chains
7. Validate `paths` glob patterns for rules

### Skills Validator

**Validates (Claude-specific only):**

- `SKILL.md` file existence in skill directories
- YAML frontmatter schema compliance
- Required fields: `name`, `description`
- Optional field types: `usage`, `allowed-tools`, `allowed-prompts`
- Referenced files in skill directory exist
- String substitution syntax (`{{VAR}}`) validity

**Note:** Generic markdown formatting is handled by markdownlint, not claudelint.

**Algorithm:**

1. Find all `.claude/skills/*/SKILL.md` files
2. Parse YAML frontmatter
3. Validate against skill schema (name, description, usage, etc.)
4. Check referenced files in skill directory exist
5. Validate string substitution patterns
6. Check `allowed-tools` and `allowed-prompts` syntax

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
  .name('claudelint')
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
npx claudelint check-all --verbose
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
      "command": "npx claudelint check-claude-md"
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

1. **Custom validators** - Extend BaseValidator for project-specific Claude rules
2. **Custom rules** - Configure via `.claudelintrc`
3. **Plugins** - Add validators via plugins (future)
4. **Tool integration** - Use alongside markdownlint, prettier, Vale, etc.

## Rule Registry

**Location:** `src/utils/rule-registry.ts`

The Rule Registry is a centralized metadata system for all validation rules.

### Purpose

- **Single source of truth** for all available rules
- **Config validation** against known rules
- **Documentation generation** for per-rule docs
- **IDE integration** (future) for autocomplete
- **Extensibility** for custom rules

### Architecture

```typescript
interface RuleMetadata {
  id: string; // Unique identifier
  name: string; // Human-readable name
  description: string; // Brief description
  category: string; // CLAUDE.md, Skills, etc.
  severity: 'error' | 'warning';
  fixable: boolean; // Auto-fix support
  deprecated: boolean; // Deprecation status
  replacedBy?: string[]; // Replacement rules
  since: string; // Version added
  docUrl?: string; // Documentation URL
}
```

### Registration

Rules are registered at module load time:

```typescript
// src/validators/claude-md.ts
RuleRegistry.register({
  id: 'size-error',
  name: 'File Size Error',
  description: 'CLAUDE.md exceeds maximum file size limit (40KB)',
  category: 'CLAUDE.md',
  severity: 'error',
  fixable: false,
  deprecated: false,
  since: '1.0.0',
});
```

### Usage

**Config validation:**

```typescript
const configErrors = validateConfig(config);
// Returns errors for unknown or deprecated rules
```

**List all rules:**

```bash
claudelint list-rules
claudelint list-rules --category Skills
claudelint list-rules --format json
```

**Query rules:**

```typescript
RuleRegistry.get('size-error'); // Get specific rule
RuleRegistry.getAll(); // Get all rules
RuleRegistry.getByCategory('Skills'); // Get by category
RuleRegistry.exists('size-error'); // Check existence
```

### Registered Rules

- **CLAUDE.md** (4 rules): size-error, size-warning, import-missing, import-circular
- **Skills** (11 rules): missing-shebang, missing-comments, dangerous-command, eval-usage, path-traversal, missing-changelog, missing-examples, missing-version, too-many-files, deep-nesting, naming-inconsistent
- **Settings** (3 rules): invalid-schema, invalid-permission, invalid-env-var
- **Hooks** (3 rules): invalid-event, missing-script, invalid-config
- **MCP** (3 rules): invalid-server, invalid-transport, invalid-env-var
- **Plugin** (3 rules): invalid-manifest, invalid-version, missing-file

**Total:** 27 rules

## Progress Indicators

**Location:** `src/utils/progress.ts`

Progress indicators provide visual feedback during validation.

### Design

**Automatic CI Detection:**

```typescript
const isCI = !!(process.env.CI || process.env.GITHUB_ACTIONS || !process.stdin.isTTY);
```

**Adaptive Output:**

- **Terminal:** Animated spinners (ora library)
- **CI:** Plain text progress messages
- **JSON mode:** No progress output

### Integration

```typescript
// Reporter integration
reporter.startSection('CLAUDE.md files');
// ... validation runs ...
reporter.endSection(); // Shows timing

// Output:
// Terminal: ⠋ Validating CLAUDE.md files...
//           ✓ Validated CLAUDE.md files (45ms)
// CI:       Validating CLAUDE.md files...
//           ✓ Validated CLAUDE.md files (45ms)
```

### Features

1. **Timing information** - Shows milliseconds per validator
2. **CI detection** - Automatic fallback to plain text
3. **Format awareness** - Disabled in JSON output mode
4. **Graceful degradation** - Works without TTY

### Performance Impact

- **Overhead:** < 5% (minimal)
- **Benefit:** Better UX for long-running validation

## Parallel Validation

**Location:** `src/cli.ts`, `src/utils/reporting.ts`

All validators run concurrently using `Promise.all()` for maximum performance.

### Architecture

**Sequential (before):**

```typescript
const result1 = await validator1.validate();
const result2 = await validator2.validate();
// Total time = time1 + time2 + time3...
```

**Parallel (current):**

```typescript
const results = await Promise.all([
  reporter.runValidator('CLAUDE.md', () => validator1.validate()),
  reporter.runValidator('Skills', () => validator2.validate()),
  // ... all validators ...
]);
// Total time = max(time1, time2, time3...)
```

### Implementation

1. **runValidator()** - Wraps validation with timing, returns result + duration
2. **Promise.all()** - Runs all validators concurrently
3. **reportParallelResults()** - Reports all results after completion

### Performance

**Before (sequential):**

- CLAUDE.md: 13ms
- Skills: 18ms
- Settings: 10ms
- Hooks: 7ms
- MCP: 5ms
- Plugin: 10ms
- **Total: ~63ms (sum of all)**

**After (parallel):**

- All validators: ~18ms (max of all)
- **Speedup: ~3.5x**

Actual wall-clock time: ~128ms (including Node.js startup overhead, Promise.all coordination)

### Benefits

1. **Faster validation** - Especially for large projects
2. **Better CPU utilization** - Uses multiple cores
3. **Scalable** - Performance doesn't degrade as validators are added
4. **No blocking** - I/O operations overlap

### Trade-offs

- **Memory:** All validators load simultaneously (~5-10MB)
- **Error handling:** One validator error doesn't block others
- **Output order:** Results shown in completion order, not validator order

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
