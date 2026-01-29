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
- **66 rules total** organized into 10 categories (ClaudeMd, Skills, Settings, Hooks, MCP, Plugin, etc.)
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
- **Extend BaseValidator** - Share common validation infrastructure

**Validator Responsibilities:**
1. **File Discovery** - Find files to validate (glob patterns)
2. **File Parsing** - Read and parse file contents (YAML, JSON, Markdown)
3. **Rule Orchestration** - Collect category rules, call validate(), aggregate results
4. **Result Reporting** - Format and report violations to CLI

**Example Validator:**
```typescript
// src/validators/skills.ts
export class SkillsValidator extends BaseValidator {
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

**DO: Write Rules**
- Create new rules in `src/rules/{category}/{rule-id}.ts`
- Follow the Rule interface and metadata schema
- Write focused, single-purpose validation checks
- See [contributing-rules.md](./contributing-rules.md) for the complete guide

**DON'T: Extend Validators**
- Don't create new validators (unless adding a new category)
- Don't modify validator orchestration logic
- Don't write validation logic directly in validators

### Evolution: Pre-Phase 5 vs Post-Phase 5

**Before Phase 5 (Validator-Centric):**
- Contributors extended `BaseValidator` classes
- Validators contained validation logic
- Heavy composition patterns required
- Plugin system exported validators

**After Phase 5 (Rule-Based):**
- Contributors write individual rules
- Validators are internal orchestrators
- Simple, focused rule pattern
- Plugin system exports rules (ESLint-style)

See [archive/rule-architecture-refactor/](./archive/rule-architecture-refactor/) for complete migration history.

### For Plugin Developers

When building plugins:
- **Export rules**, not validators
- Follow the Rule interface
- Use metadata for documentation
- See [plugin-development.md](./plugin-development.md) for examples

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
- Skills (10 rules)
- Agents (10 rules)
- Output-styles (3 rules)

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
- ClaudeMd (14 rules - mostly file-level and import validation)
- MCP (13 rules - mostly cross-cutting validation)
- Settings (various cross-reference rules)
- Hooks (schema validation and file existence)

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
│   ├── rules/               # Validation rules (66 rules)
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

The Rule Registry is a centralized metadata system for all validation rules, serving as the single source of truth for rule definitions across the entire toolkit.

### Purpose

The Rule Registry provides:

1. **Centralized Rule Management**
   - Single source of truth for all available rules
   - Prevents rule ID conflicts across validators and plugins
   - Enables dynamic rule discovery and querying

2. **Configuration Validation**
   - Validates user configs reference only known rules
   - Detects deprecated rules and suggests replacements
   - Provides helpful error messages for typos

3. **Documentation Generation**
   - Generates per-rule documentation automatically
   - Powers CLI commands like `claudelint list-rules`
   - Provides metadata for IDE integrations

4. **Plugin Integration**
   - Allows plugins to register custom rules
   - Validates plugin rules don't conflict with core rules
   - Tracks which rules come from which plugins

5. **Versioning and Deprecation**
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
  docUrl?: string; // Documentation URL
  source?: string; // 'core' or plugin name
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

**Core rules** register at module load time:

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
  source: 'core',
});
```

**Plugin rules** register during plugin loading:

```typescript
// claudelint-plugin-custom/index.ts
export function register(registry: RuleRegistry) {
  registry.register({
    id: 'custom-rule',
    name: 'Custom Rule',
    description: 'Validates custom requirement',
    category: 'Custom',
    severity: 'warning',
    fixable: true,
    deprecated: false,
    since: '1.0.0',
    source: 'claudelint-plugin-custom',
  });
}
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
if (RuleRegistry.exists('custom-rule')) {
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

Core rules (v1.0):

- **CLAUDE.md** (11 rules): size-error, size-warning, import-missing, import-circular, import-in-code-block, filename-case-sensitive, glob-pattern-backslash, glob-pattern-too-broad, rules-circular-symlink, content-too-many-sections, paths
- **Skills** (28 rules): missing-shebang, missing-comments, dangerous-command, eval-usage, path-traversal, missing-changelog, missing-examples, missing-version, too-many-files, deep-nesting, naming-inconsistent, time-sensitive-content, body-too-long, large-reference-no-toc, name, description, version, model, tags, context, dependencies, agent, allowed-tools, disallowed-tools
- **Agents** (10 rules): name, description, model, tools, disallowed-tools, skills, skills-not-found, hooks, hooks-invalid-schema, events
- **Settings** (4 rules): invalid-permission, invalid-env-var, permission-invalid-rule, permission-empty-pattern
- **Hooks** (3 rules): invalid-event, missing-script, invalid-config
- **MCP** (3 rules): invalid-server, invalid-transport, invalid-env-var
- **Plugin** (6 rules): invalid-manifest, invalid-version, missing-file, circular-dependency, dependency-invalid-version, commands-in-plugin-deprecated
- **Commands** (2 rules): deprecated-directory, migrate-to-skills
- **OutputStyles** (3 rules): name, description, examples
- **LSP** (0 rules): Schema-validated only

**Total:** 66 core rules (ESLint-style auto-discovered from filesystem)

Plugin rules can be added by third-party packages.

### Integration with Validators

Validators use the Rule Registry when reporting errors:

```typescript
class ClaudeMdValidator extends BaseValidator {
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

# Speedup: ~2.4x
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

- Dramatic speedup on repeated runs (~2.4x)
- Automatic invalidation (no stale results)
- Negligible disk space (<1MB for typical project)

**Costs:**

- Extra I/O for cache read/write
- Cache directory management
- Not beneficial for CI (single runs)

**Best for:**

- Local development (frequent runs)
- Pre-commit hooks (multiple validators)
- Watch mode (future)

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

  static create(id: string, options: any): BaseValidator {
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
export class ClaudeMdValidator extends BaseValidator {
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
4. **Plugin support** - External validators can register
5. **Testability** - Easy to mock/stub validators

### Plugin Integration

External plugins can add validators:

```typescript
// claudelint-plugin-custom/index.ts
export function register(registry: ValidatorRegistry) {
  registry.register({
    id: 'custom-validator',
    name: 'Custom Validator',
    constructor: CustomValidator,
    enabled: true,
    category: 'Custom',
  });
}
```

## Composition Framework

**Location:** `src/composition/`

A functional approach to building validators through composition of small, reusable validation primitives.

### Overview

The Composition Framework enables building complex validators by combining simple, focused validation functions. Instead of writing monolithic validators with duplicated logic, you compose validators from reusable building blocks.

This approach is inspired by functional programming patterns and provides:

- **Reusability** - Write validation logic once, use everywhere
- **Testability** - Test small units independently
- **Type Safety** - Full TypeScript type inference
- **Maintainability** - Changes localized to specific validators
- **Composability** - Build complex logic from simple pieces

### Core Types

```typescript
// A composable validator function
type ComposableValidator<T> = (
  value: T,
  context: ValidationContext
) => ValidationResult | Promise<ValidationResult>;

// Context passed to validators
interface ValidationContext {
  filePath?: string;
  line?: number;
  options: BaseValidatorOptions;
  state?: Map<string, unknown>;
}

// Result from validation
interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}
```

### Composable Validators

The framework provides a library of reusable validators:

**File System Validators:**

- `fileExists(path)` - Validates file exists
- `directoryExists(path)` - Validates directory exists
- `isReadable(path)` - Validates file is readable

**Schema Validators:**

- `jsonSchema(schema)` - Validates against Zod schema
- `objectShape(keys)` - Validates object structure

**String Validators:**

- `regex(pattern, message)` - Validates string matches pattern
- `minLength(min)` - Validates minimum length
- `maxLength(max)` - Validates maximum length

**Array Validators:**

- `arrayOf(validator)` - Validates all array items
- `arrayLength(min, max)` - Validates array length

**Value Validators:**

- `required()` - Validates value exists
- `oneOf(values)` - Validates value in allowed set

### Composition Operators

Operators combine validators into complex validation logic:

**`compose(...validators)`** - Chain validators sequentially:

```typescript
const validateSkillName = compose(
  required(),
  minLength(3),
  maxLength(64),
  regex(/^[a-z0-9-]+$/, 'Must be lowercase with hyphens')
);
```

**`optional(validator)`** - Skip validation if value is null/undefined:

```typescript
const validateOptionalEmail = optional(
  regex(/^.+@.+\..+$/, 'Invalid email format')
);
```

**`conditional(predicate, validator)`** - Conditionally apply validation:

```typescript
const validateIfProduction = conditional(
  (_, ctx) => ctx.options.config?.env === 'production',
  minLength(10)
);
```

**`all(...validators)`** - All validators must pass (accumulates errors):

```typescript
const validateConfig = all(
  hasRequiredFields(['name', 'version']),
  hasValidVersion,
  hasValidDependencies
);
```

**`any(...validators)`** - At least one validator must pass:

```typescript
const validatePathType = any(
  fileExists,
  directoryExists
);
```

### Practical Examples

**SKILL.md Frontmatter Validation:**

```typescript
const validateSkillFrontmatter = objectValidator({
  name: compose(
    required(),
    minLength(3),
    maxLength(64),
    regex(/^[a-z0-9-]+$/, 'Must be lowercase with hyphens')
  ),
  description: compose(
    required(),
    minLength(20)
  ),
  version: optional(
    regex(/^\d+\.\d+\.\d+$/, 'Must be semver format')
  ),
  'allowed-tools': optional(
    arrayOf(oneOf(VALID_TOOLS))
  ),
  model: optional(
    oneOf(['sonnet', 'opus', 'haiku', 'inherit'])
  )
});
```

**Settings.json Validation:**

```typescript
const validateSettings = compose(
  jsonSchema(SettingsSchema),
  objectValidator({
    permissions: optional(
      arrayOf(validatePermissionRule)
    ),
    hooks: optional(
      arrayOf(validateHook)
    ),
    env: optional(
      objectValidator({}, validateEnvironmentVariable)
    )
  })
);
```

### Integration with BaseValidator

Composable validators integrate seamlessly with existing validators:

```typescript
class SkillsValidator extends BaseValidator {
  async validate() {
    // Use composition framework for frontmatter
    const frontmatterResult = await validateSkillFrontmatter(
      frontmatter,
      {
        filePath: this.filePath,
        options: this.options
      }
    );

    // Merge results into validator
    this.errors.push(...frontmatterResult.errors);
    this.warnings.push(...frontmatterResult.warnings);

    return this.getResult();
  }
}
```

### Benefits Over Monolithic Validation

**Before (Monolithic):**

```typescript
class SkillsValidator extends BaseValidator {
  private validateFrontmatter(fm: any) {
    if (!fm.name) {
      this.reportError('Missing name');
    }
    if (typeof fm.name !== 'string') {
      this.reportError('Name must be string');
    }
    if (fm.name.length < 3) {
      this.reportError('Name too short');
    }
    if (fm.name.length > 64) {
      this.reportError('Name too long');
    }
    if (!/^[a-z0-9-]+$/.test(fm.name)) {
      this.reportError('Invalid name format');
    }
    // ... 50 more lines
  }
}
```

**After (Composable):**

```typescript
const validateFrontmatter = objectValidator({
  name: compose(required(), minLength(3), maxLength(64)),
  description: compose(required(), minLength(20)),
  // Clear, declarative validation
});

class SkillsValidator extends BaseValidator {
  async validateFrontmatter(fm: any, filePath: string) {
    const result = await validateFrontmatter(fm, {
      filePath,
      options: this.options
    });
    this.errors.push(...result.errors);
    this.warnings.push(...result.warnings);
  }
}
```

### Plugin Usage

Plugins can use the composition framework to create custom validators:

```typescript
// claudelint-plugin-custom/validators/custom.ts
import { compose, required, regex } from '@pdugan20/claudelint/composition';

const validateProjectId = compose(
  required(),
  regex(/^PROJ-\d+$/, 'Must be format PROJ-<number>')
);

export class CustomValidator extends BaseValidator {
  async validate() {
    const result = await validateProjectId(
      this.value,
      { options: this.options }
    );
    this.errors.push(...result.errors);
    return this.getResult();
  }
}
```

### Performance Considerations

- Validators are async to support I/O operations
- Composition operators can short-circuit (e.g., `compose` stops at first error)
- Results can be cached for repeated validations
- Parallel validation via `Promise.all()` in `arrayOf()`

### Future Extensions

- Custom validators from user configs
- Validation middleware/hooks
- AI-powered validation suggestions
- Visual validation rule builder

## Plugin System

**Location:** `src/utils/plugin-loader.ts`

Extensible plugin system for custom validators and rules, enabling users and organizations to add domain-specific validation without forking claudelint.

### Architecture Overview

The plugin system consists of four components:

1. **PluginLoader** - Discovers and loads plugins from node_modules
2. **ValidatorRegistry** - Registers validators provided by plugins
3. **RuleRegistry** - Registers rules provided by plugins
4. **Composition Framework** - Enables plugins to build validators easily

### Plugin Lifecycle

**1. Discovery Phase:**

```typescript
// PluginLoader searches for plugins
const patterns = [
  'node_modules/claudelint-plugin-*/',
  'node_modules/@*/claudelint-plugin-*/'
];
```

Plugins are discovered by:

- Matching naming convention (`claudelint-plugin-*`)
- Scanning `node_modules` directory
- Checking for valid `package.json`

**2. Loading Phase:**

```typescript
const plugin = require('claudelint-plugin-custom');
```

Each plugin is loaded via `require()` and validated:

- Has a `register()` function
- Exports valid metadata
- Dependencies are satisfied

**3. Validation Phase:**

```typescript
// Validate plugin structure
if (typeof plugin.register !== 'function') {
  throw new Error('Plugin must export register() function');
}
```

Plugins are validated for:

- Required API implementation
- No conflicts with core validators
- No conflicts with other plugins

**4. Registration Phase:**

```typescript
// Plugin registers its validators and rules
plugin.register({
  validatorRegistry: ValidatorRegistry,
  ruleRegistry: RuleRegistry,
  composition: CompositionFramework
});
```

Plugins register:

- Custom validators via ValidatorRegistry
- Custom rules via RuleRegistry
- Can use composition framework

**5. Execution Phase:**

```typescript
// Plugin validators run alongside core validators
const results = await Promise.all([
  ...coreValidators.map(v => v.validate()),
  ...pluginValidators.map(v => v.validate())
]);
```

### Plugin API

**Minimal Plugin Structure:**

```typescript
// claudelint-plugin-custom/index.ts
import { BaseValidator, PluginAPI } from '@pdugan20/claudelint';

class CustomValidator extends BaseValidator {
  async validate() {
    // Custom validation logic
    return this.getResult();
  }
}

export function register(api: PluginAPI) {
  // Register validator
  api.validatorRegistry.register({
    id: 'custom-validator',
    name: 'Custom Validator',
    constructor: CustomValidator,
    enabled: true,
    category: 'Custom',
  });

  // Register rules
  api.ruleRegistry.register({
    id: 'custom-rule',
    name: 'Custom Rule',
    description: 'Validates custom requirement',
    category: 'Custom',
    severity: 'warning',
    source: 'claudelint-plugin-custom',
  });
}
```

**PluginAPI Interface:**

```typescript
interface PluginAPI {
  validatorRegistry: ValidatorRegistry;
  ruleRegistry: RuleRegistry;
  composition: CompositionFramework;
  version: string; // claudelint version
}
```

### Plugin Integration Points

**1. ValidatorRegistry Integration:**

```typescript
// Plugin registers custom validator
api.validatorRegistry.register({
  id: 'mycompany-style-guide',
  name: 'MyCompany Style Guide',
  constructor: StyleGuideValidator,
  enabled: true,
  category: 'Style',
});
```

The validator runs alongside core validators:

```typescript
// CLI automatically includes plugin validators
const allValidators = ValidatorRegistry.getAllMetadata();
// Returns: [core validators] + [plugin validators]
```

**2. RuleRegistry Integration:**

```typescript
// Plugin registers custom rules
api.ruleRegistry.register({
  id: 'require-ticket-reference',
  name: 'Require Ticket Reference',
  description: 'Skills must reference JIRA ticket in frontmatter',
  category: 'Custom',
  severity: 'error',
  source: 'claudelint-plugin-mycompany',
});
```

Rules are available in CLI output and documentation:

```bash
claudelint list-rules --source claudelint-plugin-mycompany
```

**3. Composition Framework Integration:**

Plugins can use composable validators:

```typescript
import { compose, required, regex } from '@pdugan20/claudelint/composition';

const validateTicketRef = compose(
  required(),
  regex(/^[A-Z]+-\d+$/, 'Must be format PROJ-123')
);

class TicketValidator extends BaseValidator {
  async validate() {
    const result = await validateTicketRef(
      this.frontmatter.ticket,
      { filePath: this.filePath, options: this.options }
    );
    this.errors.push(...result.errors);
    return this.getResult();
  }
}
```

### Plugin Discovery

**Search Patterns:**

```typescript
const patterns = [
  'node_modules/claudelint-plugin-*/',
  'node_modules/@org/claudelint-plugin-*/',
  '.claudelint/plugins/*/'  // Local plugins
];
```

**Plugin Directory Structure:**

```text
claudelint-plugin-custom/
├── package.json          # Package metadata
├── index.js              # Entry point (register function)
├── validators/           # Custom validators
│   ├── custom.ts
│   └── index.ts
├── rules/                # Rule definitions
│   └── custom-rules.ts
├── README.md             # Plugin documentation
└── tests/                # Plugin tests
```

### Error Handling and Fallback

**Plugin Load Failures:**

```typescript
try {
  const plugin = require(pluginPath);
  await plugin.register(api);
  results.push({ plugin: pluginName, status: 'success' });
} catch (error) {
  console.warn(`Failed to load plugin ${pluginName}: ${error.message}`);
  results.push({ plugin: pluginName, status: 'failed', error });
  // Continue loading other plugins
}
```

**Validator Failures:**

```typescript
// Plugin validator errors don't crash validation
const results = await Promise.allSettled(
  validators.map(v => v.validate())
);

// Report plugin validator errors separately
results.forEach((result, i) => {
  if (result.status === 'rejected') {
    console.error(`Validator ${validators[i].name} failed:`, result.reason);
  }
});
```

### Security Considerations

**1. Plugin Isolation:**

- Plugins run in same process (no sandboxing)
- Use only trusted plugins
- Review plugin code before installation

**2. Validation:**

- Validate plugin exports required API
- Check for conflicting rule/validator IDs
- Prevent circular dependencies

**3. Configuration:**

```json
// .claudelintrc
{
  "plugins": {
    "allowlist": ["claudelint-plugin-mycompany"],
    "denylist": ["claudelint-plugin-untrusted"]
  }
}
```

### Plugin Development Guide

**1. Setup:**

```bash
mkdir claudelint-plugin-mycompany
cd claudelint-plugin-mycompany
npm init
npm install --save-peer @pdugan20/claudelint
```

**2. package.json:**

```json
{
  "name": "claudelint-plugin-mycompany",
  "version": "1.0.0",
  "description": "MyCompany-specific Claude Code validation",
  "main": "dist/index.js",
  "peerDependencies": {
    "@pdugan20/claudelint": "^1.0.0"
  },
  "keywords": ["claudelint", "claudelint-plugin", "validation"]
}
```

**3. Implementation:**

```typescript
// src/index.ts
import { BaseValidator, PluginAPI } from '@pdugan20/claudelint';
import { compose, required, regex } from '@pdugan20/claudelint/composition';

// Define custom validator using composition
const validateProjectId = compose(
  required(),
  regex(/^PROJ-\d+$/, 'Must be format PROJ-<number>')
);

class ProjectValidator extends BaseValidator {
  async validate() {
    const result = await validateProjectId(
      this.config.projectId,
      { options: this.options }
    );
    this.errors.push(...result.errors);
    return this.getResult();
  }
}

// Plugin registration
export function register(api: PluginAPI) {
  api.validatorRegistry.register({
    id: 'mycompany-project',
    name: 'MyCompany Project Validator',
    constructor: ProjectValidator,
    enabled: true,
    category: 'Custom',
  });

  api.ruleRegistry.register({
    id: 'project-id-required',
    name: 'Project ID Required',
    description: 'All Claude projects must have valid project ID',
    category: 'Custom',
    severity: 'error',
    source: 'claudelint-plugin-mycompany',
    since: '1.0.0',
  });
}
```

**4. Testing:**

```typescript
// tests/index.test.ts
import { register } from '../src/index';
import { ValidatorRegistry, RuleRegistry } from '@pdugan20/claudelint';

describe('MyCompany Plugin', () => {
  it('registers validators and rules', () => {
    const api = {
      validatorRegistry: ValidatorRegistry,
      ruleRegistry: RuleRegistry,
      composition: {},
      version: '1.0.0'
    };

    register(api);

    expect(ValidatorRegistry.exists('mycompany-project')).toBe(true);
    expect(RuleRegistry.exists('project-id-required')).toBe(true);
  });
});
```

**5. Usage:**

```bash
# Install plugin
npm install --save-dev claudelint-plugin-mycompany

# Plugin loads automatically
claudelint check-all

# List plugin rules
claudelint list-rules --source claudelint-plugin-mycompany
```

### Example Plugins

See `examples/custom-validator-plugin/` for a complete working example demonstrating:

- Custom validator implementation
- Composition framework usage
- Rule registration
- Testing strategies

### Plugin Configuration

Users can configure plugins via `.claudelintrc`:

```json
{
  "plugins": {
    "mycompany": {
      "enabled": true,
      "severity": "error",
      "options": {
        "requireTicket": true,
        "allowedProjects": ["PROJ", "DEV"]
      }
    }
  }
}
```

Plugins access config via options:

```typescript
class ProjectValidator extends BaseValidator {
  async validate() {
    const pluginConfig = this.options.plugins?.mycompany;
    if (pluginConfig?.requireTicket) {
      // Validate ticket reference
    }
  }
}
```

### Future Enhancements

1. **Plugin Marketplace**
   - Central registry at claudelint.dev/plugins
   - Search and discovery
   - Verified publishers

2. **Plugin CLI**

   ```bash
   claudelint plugin install <name>
   claudelint plugin list
   claudelint plugin update
   ```

3. **Plugin Sandboxing**
   - Run plugins in separate processes
   - Resource limits (CPU, memory)
   - Permission system

4. **Plugin Verification**
   - Code signing
   - Security scanning
   - Compatibility testing

## System Integration

This section demonstrates how the core architectural components (Rule Registry, Validator Registry, Composition Framework, and Plugin System) integrate to provide a cohesive validation experience.

### Component Interaction Overview

```text
┌─────────────────────────────────────────────────────────────────┐
│                         CLI / API Entry                         │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Plugin Loader                             │
│  • Discovers plugins                                             │
│  • Loads and validates plugins                                   │
│  • Calls plugin.register()                                       │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    ▼                         ▼
      ┌─────────────────────┐   ┌─────────────────────┐
      │  Validator Registry │   │    Rule Registry    │
      │  • Core validators  │   │  • Core rules       │
      │  • Plugin validators│   │  • Plugin rules     │
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
      │  • Use Composition Framework            │
      │  • Register errors via Rule Registry    │
      │  • Return ValidationResult              │
      └─────────────────────────────────────────┘
```

### Full Integration Example

**Step 1: Core Setup (Module Loading)**

```typescript
// src/validators/index.ts
// Import all validators - triggers self-registration
import './claude-md';
import './skills';
import './settings';

// Each validator registers itself
// src/validators/skills.ts
export class SkillsValidator extends BaseValidator {
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
  source: 'core',
});
```

**Step 2: Plugin Loading**

```typescript
// src/cli.ts
import { PluginLoader } from './utils/plugin-loader';

// Load plugins
const pluginLoader = new PluginLoader();
const plugins = await pluginLoader.loadPlugins(process.cwd());

// Each plugin registers its components
// claudelint-plugin-mycompany/index.ts
export function register(api: PluginAPI) {
  // Register custom validator
  api.validatorRegistry.register({
    id: 'mycompany-style',
    name: 'MyCompany Style Guide',
    constructor: StyleGuideValidator,
    category: 'Custom',
  });

  // Register custom rules
  api.ruleRegistry.register({
    id: 'require-jira-ticket',
    name: 'Require JIRA Ticket',
    description: 'Skills must reference JIRA ticket',
    category: 'Custom',
    severity: 'error',
    source: 'claudelint-plugin-mycompany',
  });
}
```

**Step 3: Validator Execution**

```typescript
// src/cli.ts
async function checkAll() {
  // Get all registered validators (core + plugins)
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

**Step 4: Validator Implementation Using Composition**

```typescript
// src/validators/skills.ts
import { compose, required, minLength, regex } from '../composition';

// Define composable validators
const validateSkillName = compose(
  required(),
  minLength(3),
  maxLength(64),
  regex(/^[a-z0-9-]+$/, 'Must be lowercase with hyphens')
);

export class SkillsValidator extends BaseValidator {
  async validate() {
    const files = await this.findSkillFiles();

    for (const file of files) {
      const frontmatter = await this.parseFrontmatter(file);

      // Use composable validator
      const nameResult = await validateSkillName(
        frontmatter.name,
        { filePath: file, options: this.options }
      );

      // Merge results and report errors using Rule Registry
      if (!nameResult.valid) {
        for (const error of nameResult.errors) {
          const rule = RuleRegistry.get('invalid-skill-name');
          this.reportError(error.message, {
            line: error.line,
            rule: rule?.id
          });
        }
      }
    }

    return this.getResult();
  }
}
```

**Step 5: Plugin Validator Using Same Framework**

```typescript
// claudelint-plugin-mycompany/validators/style-guide.ts
import { BaseValidator } from '@pdugan20/claudelint';
import { compose, required, regex } from '@pdugan20/claudelint/composition';

// Plugin uses same composition framework
const validateJiraTicket = compose(
  required(),
  regex(/^[A-Z]+-\d+$/, 'Must be format PROJ-123')
);

export class StyleGuideValidator extends BaseValidator {
  async validate() {
    const skills = await this.findSkillFiles();

    for (const file of skills) {
      const fm = await this.parseFrontmatter(file);

      // Use composable validator
      const ticketResult = await validateJiraTicket(
        fm.jiraTicket,
        { filePath: file, options: this.options }
      );

      // Report via Rule Registry (plugin rule)
      if (!ticketResult.valid) {
        const rule = RuleRegistry.get('require-jira-ticket');
        this.reportError(ticketResult.errors[0].message, {
          line: 1,
          rule: rule?.id,
          source: 'claudelint-plugin-mycompany'
        });
      }
    }

    return this.getResult();
  }
}
```

**Step 6: Result Reporting**

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
  Source: ${rule?.source || 'core'}
  ${rule?.docUrl ? `Docs: ${rule.docUrl}` : ''}
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
    "size-error": "error",
    "missing-shebang": "warning",
    "require-jira-ticket": "error"  // Plugin rule
  },
  "plugins": {
    "mycompany": {
      "enabled": true,
      "options": {
        "enforceTickets": true
      }
    }
  },
  "validators": {
    "skills": { "enabled": true },
    "mycompany-style": { "enabled": true }  // Plugin validator
  }
}
```

**Configuration flow:**

1. CLI reads `.claudelintrc`
2. Rule Registry validates rule IDs exist
3. Validator Registry filters disabled validators
4. Plugin options passed to plugin validators
5. Results filtered based on rule severity

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

  // Group by source
  const core = rules.filter(r => r.source === 'core');
  const plugins = rules.filter(r => r.source !== 'core');

  console.log('Core Rules:', core.length);
  console.log('Plugin Rules:', plugins.length);

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

- All validators (core and plugin) use same API
- Errors reported consistently via Rule Registry
- Common composition patterns across codebase

**2. Extensibility:**

- Plugins integrate seamlessly with core
- No special handling needed for plugin validators
- Same CLI output format for all rules

**3. Maintainability:**

- Changes to Rule Registry automatically affect all validators
- Composition framework reduces code duplication
- Plugin API provides stable extension point

**4. Discoverability:**

- `list-rules` shows all rules (core + plugins)
- Plugin rules documented alongside core rules
- IDE integration sees all available rules

**5. Type Safety:**

- Full TypeScript inference through composition
- Plugin API is strongly typed
- Registry lookups are type-safe

### Testing Integration

Tests validate the integration:

```typescript
// tests/integration/plugin-integration.test.ts
describe('Plugin Integration', () => {
  it('loads plugins and registers validators', async () => {
    // Load plugin
    const loader = new PluginLoader();
    await loader.loadPlugins('./fixtures/plugin');

    // Verify registration
    expect(ValidatorRegistry.exists('custom-validator')).toBe(true);
    expect(RuleRegistry.exists('custom-rule')).toBe(true);
  });

  it('runs plugin validators alongside core', async () => {
    // Get all validators
    const all = ValidatorRegistry.getAllMetadata();

    // Should include both core and plugin
    const core = all.filter(v => !v.id.includes('custom'));
    const plugin = all.filter(v => v.id.includes('custom'));

    expect(core.length).toBeGreaterThan(0);
    expect(plugin.length).toBeGreaterThan(0);
  });

  it('reports errors using Rule Registry', async () => {
    const validator = ValidatorRegistry.create('custom-validator');
    const result = await validator.validate();

    // Errors reference rules in registry
    result.errors.forEach(error => {
      expect(RuleRegistry.exists(error.ruleId)).toBe(true);
    });
  });
});
```

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
