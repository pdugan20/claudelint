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

## Rules vs Validators: Understanding the Architecture

claudelint uses a **rule-based architecture** inspired by ESLint. Understanding the distinction between rules and validators is critical for contributors.

### Rules (What Contributors Write)

**Rules** are individual, focused validation checks located in `src/rules/{category}/{rule-id}.ts`.

**Characteristics:**

- **<RuleCount category="total" /> rules total** organized into <RuleCount category="categories" /> categories (ClaudeMd, Skills, Settings, Hooks, MCP, Plugin, Agents, Output Styles, LSP, Commands)
- **User-configurable** - Can be enabled/disabled, severity changed per-project
- **Self-contained** - Each rule validates one specific aspect
- **Metadata-driven** - Include id, name, description, severity, fixable flag
- **ESLint-style** - Similar pattern to ESLint rules

**Example Rule:**

```typescript
// src/rules/skills/skill-missing-version.ts
export const rule: Rule = {
  meta: {
    id: 'skill-missing-version',
    name: 'Skill Missing Version',
    description: 'Skill frontmatter must include a version field',
    category: 'Skills',
    severity: 'warn',
    fixable: true,
  },
  validate: async (context) => {
    // Validation logic for this specific check
  },
};
```

### Validators (Internal Orchestrators)

**Validators** are internal orchestration classes in `src/validators/` that collect and run rules.

**Characteristics:**

- **10 validators** (one per category: ClaudeMdValidator, SkillsValidator, etc.)
- **Not user-facing** - Users interact with rules, not validators
- **Implementation detail** - Orchestrate file discovery, parsing, rule execution
- **Extend FileValidator** - Share common validation infrastructure

**Validator Responsibilities:**

1. **File Discovery** - Find files to validate (glob patterns)
2. **File Parsing** - Read and parse file contents (YAML, JSON, Markdown)
3. **Rule Orchestration** - Collect category rules, call validate(), aggregate results
4. **Result Reporting** - Format and report violations to CLI

**Example Validator:**

```typescript
// src/validators/skills.ts
export class SkillsValidator extends FileValidator {
  async validate(): Promise<ValidationResult> {
    const files = await this.findSkillFiles();
    const rules = this.getRulesForCategory('Skills');

    for (const file of files) {
      const content = await fs.readFile(file);
      for (const rule of rules) {
        await rule.validate({ filePath: file, fileContent: content });
      }
    }

    return this.collectResults();
  }
}
```

### What Should Contributors Do?

#### DO: Write Rules

- Create new rules in `src/rules/{category}/{rule-id}.ts`
- Follow the Rule interface and metadata schema
- Write focused, single-purpose validation checks
- See [Contributing Guide](/development/contributing#adding-validation-rules) for the complete guide

#### DON'T: Extend Validators

- Don't create new validators (unless adding a new category)
- Don't modify validator orchestration logic
- Don't write validation logic directly in validators

### Evolution: Validator-Centric to Rule-Based

**Before (Validator-Centric):**

- Contributors extended `FileValidator` classes
- Validators contained validation logic
- Heavy composition patterns required
- Plugin system exported validators

**After (Rule-Based):**

- Contributors write individual rules
- Validators are internal orchestrators
- Simple, focused rule pattern
- Plugin system exports rules (ESLint-style)

See the [validator refactor archive](https://github.com/pdugan20/claudelint/tree/main/docs/projects/archive/validator-refactor) for complete migration history.

## Rule Implementation Patterns

claudelint supports two primary patterns for implementing rules, depending on the validation requirements.

### Pattern 1: Schema-Delegating Rules (Thin Wrapper)

**Use when:** Validating individual frontmatter fields that have Zod schema definitions.

**Approach:** Rules delegate to Zod schema validators instead of duplicating validation logic.

**Architecture:**

1. Zod schemas contain the validation logic (min/max length, regex patterns, refinements)
2. Rules extract specific fields and validate using `schema.shape.fieldName.safeParse()`
3. Rules provide better error context (line numbers, file paths)
4. Single source of truth: validation logic stays in schemas

**Example:**

```typescript
// src/schemas/skill-frontmatter.schema.ts
export const SkillFrontmatterSchema = z.object({
  name: lowercaseHyphens()
    .max(64, 'Skill name must be 64 characters or less')
    .refine(noXMLTags().check, { message: noXMLTags().message })
    .refine(noReservedWords().check, { message: noReservedWords().message }),
  // ... other fields
});

// src/rules/skills/skill-name.ts
import { SkillFrontmatterSchema } from '../../schemas/skill-frontmatter.schema';

export const rule: Rule = {
  meta: {
    id: 'skill-name',
    name: 'Skill Name Format',
    description: 'Skill name must be lowercase-with-hyphens, under 64 characters',
    category: 'Skills',
    severity: 'error',
  },
  validate: (content: string, filePath: string, context: RuleContext) => {
    const { data: frontmatter } = parseFrontmatter(content);

    if (!frontmatter?.name) {
      return; // Field not present
    }

    // Delegate to schema validator
    const nameSchema = SkillFrontmatterSchema.shape.name;
    const result = nameSchema.safeParse(frontmatter.name);

    if (!result.success) {
      const line = getFrontmatterLineNumber(content, 'name');
      context.report({
        message: result.error.issues[0].message,
        line,
        column: 1,
      });
    }
  },
};
```

**Benefits:**

- No duplication of validation logic
- Individual rule control (can disable/configure per rule)
- Better error messages with proper context
- Schema remains single source of truth
- Easier to maintain (update schema once, rules automatically reflect changes)

**Categories using this pattern:**

- Skills (schema-delegating rules)
- Agents (schema-delegating rules)
- Output-styles (schema-delegating rules)

### Pattern 2: Standalone Validation Rules

**Use when:** Validating cross-cutting concerns, file-level properties, or cross-references.

**Approach:** Rules implement full validation logic without delegating to schemas.

**Use cases:**

- File size limits (`claude-md-size-error`, `claude-md-size-warning`)
- Import cycle detection (`claude-md-import-circular`)
- Cross-reference validation (`agent-skills-not-found`)
- Duplicate detection (`mcp-invalid-server`)
- Cross-field validation (`mcp-server-key-mismatch`)

**Example:**

```typescript
// src/rules/claude-md/claude-md-import-circular.ts
export const rule: Rule = {
  meta: {
    id: 'claude-md-import-circular',
    name: 'Circular Import Detection',
    description: 'Detect circular import chains in Claude.md files',
    category: 'ClaudeMd',
    severity: 'error',
  },
  validate: async (content: string, filePath: string, context: RuleContext) => {
    const imports = extractImports(content);
    const visited = new Set<string>();

    // Traverse import graph
    const hasCircle = detectCircle(filePath, imports, visited);

    if (hasCircle) {
      context.report({
        message: 'Circular import detected',
        line: 1,
      });
    }
  },
};
```

**Categories using this pattern:**

- **ClaudeMd** (file-level and import validation, semantic checks)
  - Rationale: Most rules validate file properties (size, imports, circular refs) not frontmatter fields
  - Only one field-level rule (paths) already has detailed per-index validation
- **MCP** (transport-specific and cross-cutting validation)
  - Rationale: Nested JSON structure with dynamic keys, not flat frontmatter
  - Rules require transport-type-specific validation and iteration over server entries
- **Settings** (various cross-reference rules)
- **Hooks** (schema validation and file existence)

### Choosing the Right Pattern

**Use Schema-Delegating (Thin Wrapper) when:**

- Validating a single frontmatter field
- Field has corresponding Zod schema definition
- Validation is format/type checking (length, regex, enum)
- You want to maintain single source of truth

**Use Standalone Validation when:**

- Validating file-level properties (size, encoding)
- Checking cross-references (does imported file exist?)
- Detecting patterns across multiple fields
- Implementing complex logic that doesn't fit in schemas

**Mixed approach is acceptable:** Categories can use both patterns depending on the specific rule's needs.

## Validator vs Rule Responsibilities

### The ESLint Model (What We Follow)

**Validators (Orchestrators):**

- Find files matching patterns
- Read file content
- Parse files (JSON, YAML, Markdown)
- Execute rules via `executeRulesForCategory()`
- Aggregate and report results
- Handle **operational messages only:**
  - "No files found matching pattern"
  - "File not found: /path/to/file"
  - "JSON parse error" (from parser, not validation)

**Rules (Validators):**

- ALL validation logic
- Individual field checks
- Cross-field validation
- File existence checks
- Body content validation
- Name-directory matching
- Referenced file validation
- **Everything users might want to configure/disable**

### What Is NOT a Rule (Operational Messages)

These are the ONLY non-configurable messages (8 total across all validators):

- "No skill directories found"
- "No agent directories found"
- "No output style directories found"
- "SKILL.md not found in skill directory"
- "AGENT.md not found in agent directory"
- "OUTPUT_STYLE.md not found in output style directory"
- "File not found: {path}" (when user specifies --path)
- "No files found" (JSON config validators)

These are **discovery/parsing failures**, not validation failures.

### What MUST Be a Rule (User-Configurable)

If a user might disagree with the check or want to disable it, it MUST be a rule:

**Examples that MUST be rules:**

- [RULE] "LSP server name too short" - user might have valid short names
- [RULE] "Agent body content too short" - user might want different threshold
- [RULE] "Skill name doesn't match directory" - user might have reasons
- [RULE] "Referenced file not found" - user might want to disable temporarily
- [RULE] "Unknown tool name" - user might use custom tools

**Examples that should NOT be rules (operational):**

- [NOT RULE] "No skill directories found" - not a validation failure
- [NOT RULE] "SKILL.md not found" - file discovery, not validation
- [NOT RULE] "JSON parse error" - syntax error, not validation

### Why This Matters

**Bad (non-configurable checks):**

```bash
$ claudelint .claude/lsp.json
Warning: LSP server name "ts" is too short.
```

User has no way to disable this warning.

**Good (all checks are rules):**

```json
// .claudelintrc.json
{
  "rules": {
    "lsp-server-name-too-short": "off"  // User disables unwanted warning
  }
}
```

```bash
$ claudelint .claude/lsp.json
✓ All checks passed
```

This matches ESLint, Prettier, and all modern linting tools.

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
│   ├── architecture.md      # This file
│   ├── validation-reference.md  # Validation categories reference
│   ├── contributing-rules.md    # Rule development guide
│   └── ...                  # Other documentation
├── .claude/skills/          # Claude Code skills
│   ├── validate-all/
│   ├── validate-cc-md/
│   ├── validate-skills/
│   ├── validate-settings/
│   ├── validate-hooks/
│   ├── validate-mcp/
│   ├── validate-plugin/
│   └── format-cc/
├── hooks/                   # Claude Code hooks
│   └── hooks.json
├── src/                     # Source code
│   ├── cli.ts               # CLI entry point
│   ├── index.ts             # Library exports
│   ├── rules/               # Validation rules (auto-discovered)
│   │   ├── claude-md/       # CLAUDE.md rules
│   │   ├── skills/          # Skills rules
│   │   ├── settings/        # Settings rules
│   │   ├── hooks/           # Hooks rules
│   │   ├── mcp/             # MCP rules
│   │   ├── plugin/          # Plugin rules
│   │   ├── ...              # Other categories
│   │   └── index.ts         # Rule exports
│   ├── validators/          # Internal orchestrators
│   │   ├── base.ts          # Base validator class
│   │   ├── claude-md.ts     # CLAUDE.md validator
│   │   ├── skills.ts        # Skills validator
│   │   └── ...              # Other validators
│   └── utils/               # Utilities
│       ├── file-system.ts   # File operations
│       ├── markdown.ts      # Markdown parsing
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

All validators extend a common `FileValidator` class:

```typescript
abstract class FileValidator {
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
2. **Config file** - `.claudelintrc.json`

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

## Claude Code Plugin Integration

claudelint is distributed as a Claude Code plugin. Skills wrap CLI commands:

```markdown
# skills/validate-all/SKILL.md

---

name: validate-all
description: Run all Claude Code validators
allowed-tools: [Bash]

---

Runs comprehensive validation of all Claude Code components.

\`\`\`bash
npx claude-code-lint check-all --verbose
\`\`\`
```

Hooks trigger validation automatically:

```json
{
  "PreToolUse": [
    {
      "matcher": "Write",
      "hooks": [
        {
          "type": "command",
          "command": "npx claude-code-lint check-claude-md"
        }
      ]
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

Target performance:

- CLAUDE.md validation: < 100ms
- Skills validation: < 500ms for 20 skills
- Full validation: < 2s for typical project

## Extension Points

The architecture supports:

1. **Custom validators** - Extend FileValidator for project-specific Claude rules
2. **Custom rules** - Configure via `.claudelintrc`
3. **Tool integration** - Use alongside markdownlint, prettier, Vale, etc.

## Rule Registry

**Location:** `src/utils/rule-registry.ts`

The Rule Registry is a centralized metadata system for all validation rules, serving as the single source of truth for rule definitions across the entire toolkit.

### Purpose

The Rule Registry provides:

1. **Centralized Rule Management**
   - Single source of truth for all available rules
   - Prevents rule ID conflicts across validators
   - Enables dynamic rule discovery and querying

2. **Configuration Validation**
   - Validates user configs reference only known rules
   - Detects deprecated rules and suggests replacements
   - Provides helpful error messages for typos

3. **Documentation Generation**
   - Generates per-rule documentation automatically
   - Powers CLI commands like `claudelint list-rules`
   - Provides metadata for IDE integrations

4. **Versioning and Deprecation**
   - Tracks when rules were added (`since` field)
   - Manages deprecation lifecycle
   - Suggests migration paths via `replacedBy` field

### Architecture

```typescript
interface RuleMetadata {
  id: string; // Unique identifier (e.g., 'size-error')
  name: string; // Human-readable name
  description: string; // Brief description
  category: string; // CLAUDE.md, Skills, Settings, etc.
  severity: 'error' | 'warning';
  fixable: boolean; // Auto-fix support
  deprecated: boolean; // Deprecation status
  replacedBy?: string[]; // Replacement rules
  since: string; // Version added (e.g., '1.0.0')
}

class RuleRegistry {
  private static rules = new Map<string, RuleMetadata>();

  static register(metadata: RuleMetadata): void;
  static get(id: string): RuleMetadata | undefined;
  static getAll(): RuleMetadata[];
  static getByCategory(category: string): RuleMetadata[];
  static exists(id: string): boolean;
  static validate(ruleIds: string[]): ValidationResult;
}
```

### Registration

Rules register at module load time:

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

### Usage Patterns

**1. Config validation:**

```typescript
// Validate user config references only known rules
const configErrors = RuleRegistry.validate(config.rules);
if (!configErrors.valid) {
  console.error('Unknown rules:', configErrors.errors);
}
```

**2. List all rules (CLI):**

```bash
# List all available rules
claudelint list-rules

# Filter by category
claudelint list-rules --category Skills

# JSON output for tooling
claudelint list-rules --format json

# Show only deprecated rules
claudelint list-rules --deprecated
```

**3. Query rules programmatically:**

```typescript
// Get specific rule
const rule = RuleRegistry.get('size-error');
console.log(rule?.description);

// Get all rules
const allRules = RuleRegistry.getAll();

// Get by category
const skillRules = RuleRegistry.getByCategory('Skills');

// Check existence
if (RuleRegistry.exists('size-error')) {
  // Rule is available
}

// Get deprecated rules
const deprecated = RuleRegistry.getAll().filter(r => r.deprecated);
```

**4. Documentation generation:**

```typescript
// Generate rule documentation
const rules = RuleRegistry.getByCategory('Skills');
for (const rule of rules) {
  generateRuleDoc(rule);
}
```

### Registered Rules

Registered rule categories:

- **Skills** (<RuleCount category="skills" /> rules): All skill validation including frontmatter, structure, security, and content checks
- **CLAUDE.md** (<RuleCount category="claude-md" /> rules): Size limits, import validation, frontmatter, circular dependencies, and content structure
- **MCP** (<RuleCount category="mcp" /> rules): Server configuration, transport validation, environment variables, and command validation
- **Agents** (<RuleCount category="agents" /> rules): Agent configuration, frontmatter validation, model/tool/skill references, and hooks
- **Plugin** (<RuleCount category="plugin" /> rules): Manifest validation, version checking, file existence, dependency management
- **LSP** (<RuleCount category="lsp" /> rules): LSP server configuration validation, JSON schema, server names, and commands
- **Output Styles** (<RuleCount category="output-styles" /> rules): Output style frontmatter and structure validation
- **Settings** (<RuleCount category="settings" /> rules): Permission rules, environment variables, and schema validation
- **Hooks** (<RuleCount category="hooks" /> rules): Event names, script existence, configuration schema
- **Commands** (<RuleCount category="commands" /> rules): Deprecated directory detection, migration prompts

**Total:** <RuleCount category="total" /> rules (ESLint-style auto-discovered from filesystem)

### Integration with Validators

Validators use the Rule Registry when reporting errors:

```typescript
class ClaudeMdValidator extends FileValidator {
  validate() {
    if (fileSize > 40000) {
      // Look up rule metadata
      const rule = RuleRegistry.get('size-error');
      this.reportError(rule.description, { line: 1 });
    }
  }
}
```

This ensures:

- Error messages match documentation
- Rules can be enabled/disabled via config
- Deprecated rules show migration warnings
- IDE integrations have accurate metadata

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
- **Validation time: ~3.5x faster than sequential**

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

## Caching Architecture

**Location:** `src/utils/cache.ts`

Smart caching system that caches validation results based on file modification times.

### Design

**Cache Key Generation:**

```typescript
// Cache key = version + filePath + mtime
const cacheKey = `${VERSION}_${filePath}_${mtime}`;
```

**Cache Directory:**

```text
.claudelint-cache/
├── version.txt          # Cache version
└── <hash>.json          # Cached validation results
```

### Implementation

**ValidationCache class:**

```typescript
class ValidationCache {
  async get(filePath: string): Promise<ValidationResult | null> {
    const mtime = fs.statSync(filePath).mtimeMs;
    const cacheKey = this.generateKey(filePath, mtime);
    return this.readCache(cacheKey);
  }

  async set(filePath: string, result: ValidationResult): Promise<void> {
    const mtime = fs.statSync(filePath).mtimeMs;
    const cacheKey = this.generateKey(filePath, mtime);
    await this.writeCache(cacheKey, result);
  }
}
```

### Invalidation Strategy

Cache is invalidated when:

1. **File changes** - mtime differs from cache key
2. **Version changes** - claudelint version updated
3. **Manual clear** - `claudelint cache-clear` command

### Integration

```typescript
// In Reporter.runValidator()
if (cache) {
  const cached = await cache.get(filePath);
  if (cached) return cached; // Cache hit
}

const result = await validator.validate();

if (cache) {
  await cache.set(filePath, result); // Cache miss, store result
}
```

### Performance

**Benchmarks:**

```bash
# First run (cold cache)
time claudelint check-all
# ~204ms

# Second run (warm cache)
time claudelint check-all
# ~84ms

# Warm cache: ~2.4x faster
```

**Cache hit rate:** Typically 90%+ on subsequent runs with no file changes.

### Configuration

```bash
# Enable caching (default)
claudelint check-all

# Disable caching
claudelint check-all --no-cache

# Custom cache location
claudelint check-all --cache-location /tmp/cache

# Clear cache
claudelint cache-clear
```

### Trade-offs

**Benefits:**

- Significant speedup on repeated runs
- Automatic invalidation (no stale results)
- Negligible disk space (<1MB for typical project)

**Costs:**

- Extra I/O for cache read/write
- Cache directory management
- Not beneficial for CI (single runs)

**Best for:**

- Local development (frequent runs)
- Pre-commit hooks (multiple validators)

## Validator Factory & Registry

**Location:** `src/utils/validator-factory.ts`

Central registry system for validator discovery and instantiation.

### Architecture

**ValidatorRegistry class:**

```typescript
class ValidatorRegistry {
  private static validators = new Map<string, ValidatorMetadata>();

  static register(metadata: ValidatorMetadata) {
    this.validators.set(metadata.id, metadata);
  }

  static create(id: string, options: any): FileValidator {
    const metadata = this.validators.get(id);
    return new metadata.constructor(options);
  }

  static getAllMetadata(): ValidatorMetadata[] {
    return Array.from(this.validators.values());
  }
}
```

### Self-Registration Pattern

Validators register themselves at module load:

```typescript
// src/validators/claude-md.ts
export class ClaudeMdValidator extends FileValidator {
  // ... implementation ...
}

// Self-registration
ValidatorRegistry.register({
  id: 'claude-md',
  name: 'CLAUDE.md Validator',
  constructor: ClaudeMdValidator,
  enabled: true,
  category: 'CLAUDE.md',
});
```

### Module Import

```typescript
// src/validators/index.ts
import './claude-md';
import './skills';
import './settings';
import './hooks';
import './mcp';
import './plugin';

// All validators registered at this point
```

### CLI Integration

```typescript
// src/cli.ts
import './validators'; // Trigger self-registration

// Get all enabled validators
const enabledValidators = ValidatorRegistry.getAllMetadata().filter((m) => m.enabled);

// Create instances and run in parallel
const results = await Promise.all(
  enabledValidators.map((metadata) =>
    reporter.runValidator(metadata.name, () => ValidatorRegistry.create(metadata.id, options).validate())
  )
);
```

### Benefits

1. **Decoupled registration** - Validators don't know about CLI
2. **Easy to add validators** - Just import the module
3. **Dynamic discovery** - CLI finds validators automatically
4. **Testability** - Easy to mock/stub validators

## Validation Patterns

claudelint validators follow common patterns for consistency and maintainability.

### Zod Schema Validation

Most validators use [Zod](https://zod.dev) schemas for structural validation. Schemas are defined in `src/schemas/` and shared between validators and JSON Schema generation:

```typescript
// src/schemas/skill-frontmatter.ts
export const skillFrontmatterSchema = z.object({
  name: z.string().min(3).max(64).regex(/^[a-z0-9-]+$/),
  description: z.string().min(20),
  version: z.string().regex(/^\d+\.\d+\.\d+$/).optional(),
  tags: z.array(z.string()).optional(),
  model: z.enum(['sonnet', 'opus', 'haiku', 'inherit']).optional(),
});
```

### Rule-Per-Check Pattern

Each validation check maps to a single rule. Validators iterate through their checks and report issues using the Rule Registry:

```typescript
class SkillsValidator extends FileValidator {
  async validate() {
    const files = await this.findSkillFiles();

    for (const file of files) {
      const frontmatter = await this.parseFrontmatter(file);

      // Each check maps to a registered rule
      if (!frontmatter.name) {
        this.reportError('skill-name', 'Missing required name field');
      }
      if (frontmatter.name && frontmatter.name.length < 3) {
        this.reportError('skill-name', 'Name must be at least 3 characters');
      }
    }

    return this.getResult();
  }
}
```

### File System Checks

Many rules validate that referenced files exist on disk:

```typescript
// Check that script files referenced in skills exist
if (scriptPath && !existsSync(resolve(skillDir, scriptPath))) {
  this.reportError('skill-missing-script', `Script not found: ${scriptPath}`);
}
```

## System Integration

This section demonstrates how the core architectural components (Rule Registry, Validator Registry, and validators) integrate to provide a cohesive validation experience.

### Component Interaction Overview

```text
┌─────────────────────────────────────────────────────────────────┐
│                         CLI / API Entry                         │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    ▼                         ▼
      ┌─────────────────────┐   ┌─────────────────────┐
      │  Validator Registry │   │    Rule Registry    │
      │  • All validators   │   │  • All rules        │
      │  • Creates instances│   │  • Metadata lookup  │
      └──────────┬──────────┘   └──────────┬──────────┘
                 │                         │
                 │                         │
                 ▼                         ▼
      ┌─────────────────────────────────────────┐
      │      Validation Execution               │
      │  • Parallel validator execution         │
      │  • Result aggregation                   │
      │  • Error/warning reporting              │
      └──────────┬──────────────────────────────┘
                 │
                 ▼
      ┌─────────────────────────────────────────┐
      │     Individual Validators               │
      │  • Zod schema validation                │
      │  • Register errors via Rule Registry    │
      │  • Return ValidationResult              │
      └─────────────────────────────────────────┘
```

### Full Integration Example

#### Step 1: Core Setup (Module Loading)

```typescript
// src/validators/index.ts
// Import all validators - triggers self-registration
import './claude-md';
import './skills';
import './settings';

// Each validator registers itself
// src/validators/skills.ts
export class SkillsValidator extends FileValidator {
  // Implementation
}

// Self-registration
ValidatorRegistry.register({
  id: 'skills',
  name: 'Skills Validator',
  constructor: SkillsValidator,
  category: 'Skills',
});

// Rules also register
RuleRegistry.register({
  id: 'missing-shebang',
  name: 'Missing Shebang',
  category: 'Skills',
  severity: 'error',
});
```

#### Step 2: Validator Execution

```typescript
// src/cli.ts
async function checkAll() {
  // Get all registered validators
  const validatorMetadata = ValidatorRegistry.getAllMetadata()
    .filter(m => m.enabled);

  // Create instances and run in parallel
  const results = await Promise.all(
    validatorMetadata.map(metadata =>
      reporter.runValidator(
        metadata.name,
        () => {
          const validator = ValidatorRegistry.create(
            metadata.id,
            { verbose: true }
          );
          return validator.validate();
        }
      )
    )
  );

  // Aggregate results
  const aggregated = aggregateResults(results);

  // Report
  reporter.reportResults(aggregated);

  // Exit with appropriate code
  process.exit(aggregated.errors.length > 0 ? 2 : 0);
}
```

#### Step 3: Validator Implementation

```typescript
// src/validators/skills.ts
export class SkillsValidator extends FileValidator {
  async validate() {
    const files = await this.findSkillFiles();

    for (const file of files) {
      const frontmatter = await this.parseFrontmatter(file);

      // Each check maps to a registered rule
      if (!frontmatter.name) {
        this.reportError('skill-name', 'Missing required name field');
      }

      // Zod schema handles structural validation
      const result = skillFrontmatterSchema.safeParse(frontmatter);
      if (!result.success) {
        for (const issue of result.error.issues) {
          this.reportError('skill-tags', issue.message);
        }
      }
    }

    return this.getResult();
  }
}
```

#### Step 4: Result Reporting

```typescript
// Reporter uses Rule Registry for rich error messages
class Reporter {
  reportError(error: ValidationError) {
    // Look up rule metadata
    const rule = RuleRegistry.get(error.ruleId);

    console.error(`
${error.filePath}:${error.line}
  ${error.message}

  Rule: ${rule?.id} (${rule?.name})
  Category: ${rule?.category}
  Severity: ${rule?.severity}
    `);
  }
}
```

### Configuration Integration

User configuration affects all components:

```json
// .claudelintrc
{
  "rules": {
    "claude-md-size-error": "error",
    "missing-shebang": "warning"
  },
  "validators": {
    "skills": { "enabled": true }
  }
}
```

**Configuration flow:**

1. CLI reads `.claudelintrc`
2. Rule Registry validates rule IDs exist
3. Validator Registry filters disabled validators
4. Results filtered based on rule severity

### CLI Commands Integration

**list-rules command:**

```bash
claudelint list-rules
```

Uses both registries:

```typescript
async function listRules() {
  // Get all rules from Registry
  const rules = RuleRegistry.getAll();

  // Display by category
  const byCategory = groupBy(rules, r => r.category);
  for (const [category, categoryRules] of byCategory) {
    console.log(`\n${category}:`);
    categoryRules.forEach(rule => {
      console.log(`  ${rule.id} - ${rule.name}`);
    });
  }
}
```

**check-all command:**

```bash
claudelint check-all --verbose
```

Orchestrates all components:

```typescript
async function checkAll(options) {
  // 1. Load plugins
  const plugins = await loadPlugins();

  // 2. Get enabled validators (core + plugins)
  const validators = ValidatorRegistry.getAllMetadata()
    .filter(v => isEnabled(v, options));

  // 3. Run validators in parallel
  const results = await Promise.all(
    validators.map(v => runValidator(v, options))
  );

  // 4. Report using Rule Registry metadata
  reporter.report(results);

  // 5. Exit with appropriate code
  process.exit(getExitCode(results));
}
```

### Benefits of Integration

**1. Consistency:**

- All validators use the same API
- Errors reported consistently via Rule Registry
- Common validation patterns across codebase

**2. Maintainability:**

- Changes to Rule Registry automatically affect all validators
- Zod schemas provide single source of truth for validation
- Stable API for custom rules

**3. Discoverability:**

- `list-rules` shows all available rules
- Rules are well-documented with metadata
- IDE integration sees all available rules

**4. Type Safety:**

- Full TypeScript inference through Zod schemas
- Type-safe rule definitions
- Registry lookups are type-safe

## Future Architecture

### Planned Enhancements

1. **Language Server Protocol** - Real-time validation in editors
2. **Watch mode** - Continuous validation
3. **Daemon mode** - Background validation service
4. **Web UI** - Visualization of validation results

### Custom Rules

claudelint supports custom rules to extend the built-in validation with team-specific or project-specific checks. Custom rules use the same Rule interface as built-in rules and integrate seamlessly with the validation system.

**Implementation:**

Custom rules are loaded from `.claudelint/rules/` directory:

```javascript
// .claudelint/rules/no-hardcoded-tokens.js
module.exports.rule = {
  meta: {
    id: 'no-hardcoded-tokens',
    name: 'No Hardcoded Tokens',
    description: 'Prevent hardcoded API tokens',
    category: 'Security',
    severity: 'error',
  },
  validate: async (context) => {
    // Custom validation logic
    if (context.fileContent.includes('sk-')) {
      context.report({ message: 'Hardcoded API key detected' });
    }
  },
};
```

**Architecture:**

1. **CustomRuleLoader** - Discovers and loads rule files from `.claudelint/rules/`
2. **File Discovery** - Recursively finds `.js` and `.ts` files (excluding `.d.ts`, `.test.ts`, `.spec.ts`)
3. **Validation** - Ensures rules implement the Rule interface
4. **Registration** - Registers custom rules with RuleRegistry alongside built-in rules
5. **Conflict Detection** - Prevents ID conflicts with built-in or other custom rules

**Integration:**

- Custom rules are loaded automatically by `check-all` command
- Rules can be configured in `.claudelintrc.json` like built-in rules
- Violations are reported in the same format as built-in rules
- Custom rules support same features (severity, categories, etc.)

**See Also:**

- [Custom Rules Guide](./custom-rules.md) - Complete documentation
- [Example Custom Rules](https://github.com/pdugan20/claudelint/tree/main/docs/examples/custom-rules) - Practical examples

**Future Enhancements:**

- Shareable custom rule packages (npm)
- Rule templates and scaffolding CLI
- Team-specific validation libraries
- Industry-specific standards
