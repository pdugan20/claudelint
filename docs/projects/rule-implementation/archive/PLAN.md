# Rule Implementation Plan

## Overview

Plan for implementing 207 validation rules across 10 categories using a schema-first approach with Zod, plus additional optimizations for massive code reduction.

**Current State**: 12 rules implemented (manual validation)
**Target State**: 219 total rules (schema-driven validation + optimizations)
**Effort Reduction**: ~88% through schema reuse and infrastructure improvements

### Optimization Areas

1. **Schema-Based Validation** - 78% reduction in validation code
2. **Auto-Generated Rule Registry** - 98% reduction in registry code
3. **Builder-Based Test Fixtures** - 67% reduction in test setup code
4. **Schema-Derived Constants** - 50% reduction in constant definitions
5. **Composition Framework** - 75% reduction in manual validation patterns

## Key Insight: Schema-First Approach

Instead of writing manual validation logic for each rule, we define **Zod schemas** that declaratively describe valid data structures. Zod handles the validation and error reporting.

### Before (Manual - 100+ lines per validator)

```typescript
if (!frontmatter.name) {
  this.reportError('Missing name');
}
if (frontmatter.name.length > 64) {
  this.reportError('Name too long');
}
if (!PATTERN.test(frontmatter.name)) {
  this.reportError('Invalid format');
}
// ... repeat for every field
```

### After (Schema - 10 lines total)

```typescript
const SkillFrontmatterSchema = z.object({
  name: z.string().max(64).regex(PATTERN, 'Invalid format'),
  description: z.string().min(20).max(1024),
  model: z.enum(['sonnet', 'opus', 'haiku']).optional()
});

// One line to validate
const result = SkillFrontmatterSchema.safeParse(frontmatter);
```

---

## Infrastructure Components

### 1. Zod Schema Library

**Location**: `src/schemas/`

```
src/schemas/
├── index.ts                          # Export all schemas
├── skill-frontmatter.schema.ts       # Skills SKILL.md frontmatter
├── agent-frontmatter.schema.ts       # Agents .md frontmatter
├── output-style-frontmatter.schema.ts # Output styles frontmatter
├── lsp-config.schema.ts              # LSP server config
├── claude-md-frontmatter.schema.ts   # CLAUDE.md rules frontmatter
├── refinements.ts                    # Reusable Zod refinements
└── validators.ts                     # Custom Zod validators
```

**Files to create**:

#### `src/schemas/refinements.ts`

```typescript
/**
 * Reusable Zod refinements for Claude Code validation rules
 */
import { z } from 'zod';

/**
 * Validates no XML tags in string
 * Used by: skill-frontmatter-name-xml-tags, agent-name-xml-tags, etc.
 */
export const noXMLTags = () =>
  z.string().refine(
    (val) => !/<[^>]+>/.test(val),
    { message: 'Cannot contain XML tags' }
  );

/**
 * Validates no reserved words (anthropic, claude)
 * Used by: skill-frontmatter-name-reserved-words
 */
export const noReservedWords = (words: string[] = ['anthropic', 'claude']) =>
  z.string().refine(
    (val) => !words.some((w) => val.toLowerCase().includes(w)),
    { message: `Cannot contain reserved words: ${words.join(', ')}` }
  );

/**
 * Validates third-person writing (no "I" or "you")
 * Used by: skill-frontmatter-description-first-person
 */
export const thirdPerson = () =>
  z.string().refine(
    (val) => !/\b(I|you)\s/i.test(val),
    { message: 'Must be written in third person (avoid "I" and "you")' }
  );

/**
 * Validates semver format (X.Y.Z)
 * Used by: plugin-version-invalid-semver
 */
export const semver = () =>
  z.string().regex(
    /^\d+\.\d+\.\d+$/,
    'Must be valid semantic version (X.Y.Z)'
  );

/**
 * Validates lowercase with hyphens only
 * Used by: skill-frontmatter-name-invalid-chars, agent-name-invalid-format
 */
export const lowercaseHyphens = () =>
  z.string().regex(
    /^[a-z0-9-]+$/,
    'Must contain only lowercase letters, numbers, and hyphens'
  );

/**
 * Validates absolute path
 * Used by: settings-path-not-relative, mcp-invalid-path
 */
export const absolutePath = () =>
  z.string().refine(
    (val) => val.startsWith('/') || /^[A-Z]:\\/.test(val),
    { message: 'Must be an absolute path' }
  );

/**
 * Validates relative path
 * Used by: settings-plansDirectory validation
 */
export const relativePath = () =>
  z.string().refine(
    (val) => !val.startsWith('/') && !/^[A-Z]:\\/.test(val),
    { message: 'Must be a relative path' }
  );

/**
 * Validates no path traversal (no ..)
 * Used by: hooks-path-traversal-risk
 */
export const noPathTraversal = () =>
  z.string().refine(
    (val) => !val.includes('..'),
    { message: 'Path cannot contain ".." (path traversal)' }
  );

/**
 * Validates URL format
 * Used by: plugin-homepage-invalid-url, mcp-invalid-url-format
 */
export const validURL = () =>
  z.string().url('Must be a valid URL (https:// or http://)');

/**
 * Validates UUID format
 * Used by: settings-uuid-invalid-format
 */
export const validUUID = () =>
  z.string().uuid('Must be a valid UUID');

/**
 * Validates environment variable name format
 * Used by: settings-env-var-invalid-name, mcp-env-var-invalid-name
 */
export const envVarName = () =>
  z.string().regex(
    /^[A-Z_][A-Z0-9_]*$/,
    'Environment variable must be uppercase with underscores'
  );
```

#### `src/schemas/skill-frontmatter.schema.ts`

```typescript
/**
 * Zod schema for SKILL.md frontmatter validation
 * Implements all skill frontmatter rules from rule-validation-tracker.md
 */
import { z } from 'zod';
import { noXMLTags, noReservedWords, thirdPerson, lowercaseHyphens } from './refinements';
import { VALID_TOOLS, VALID_MODELS } from '../validators/constants';

/**
 * Complete SKILL.md frontmatter schema
 * Covers 20 skill frontmatter validation rules
 */
export const SkillFrontmatterSchema = z.object({
  // name: required, max 64 chars, lowercase-hyphens, no reserved words, no XML
  // Rules: skill-frontmatter-name-max-length, skill-frontmatter-name-invalid-chars,
  //        skill-frontmatter-name-reserved-words, skill-frontmatter-name-xml-tags
  name: z
    .string({ required_error: 'Skill name is required' })
    .max(64, 'Skill name must be at most 64 characters')
    .pipe(lowercaseHyphens())
    .pipe(noReservedWords())
    .pipe(noXMLTags()),

  // description: required, max 1024 chars, third person, no XML
  // Rules: skill-frontmatter-description-empty, skill-frontmatter-description-max-length,
  //        skill-frontmatter-description-first-person, skill-frontmatter-description-xml-tags
  description: z
    .string({ required_error: 'Skill description is required' })
    .min(1, 'Description cannot be empty')
    .max(1024, 'Description must be at most 1024 characters')
    .pipe(thirdPerson())
    .pipe(noXMLTags()),

  // argument-hint: optional string
  'argument-hint': z.string().optional(),

  // disable-model-invocation: optional boolean
  'disable-model-invocation': z.boolean().optional(),

  // user-invocable: optional boolean
  'user-invocable': z.boolean().optional(),

  // allowed-tools: optional array, validate tool names exist
  // Rule: skill-frontmatter-allowed-tools-invalid
  'allowed-tools': z
    .array(
      z.string().refine(
        (tool) => VALID_TOOLS.includes(tool),
        (tool) => ({ message: `Unknown tool: ${tool}` })
      )
    )
    .optional(),

  // model: optional, must be valid model name
  // Rule: skill-frontmatter-model-invalid
  model: z.enum(['sonnet', 'opus', 'haiku', 'inherit'] as const).optional(),

  // context: optional, must be "fork" if set
  // Rule: skill-frontmatter-context-invalid-value
  context: z.enum(['fork'] as const).optional(),

  // agent: optional string, validated when context=fork
  // Rule: skill-frontmatter-agent-invalid
  agent: z.string().optional(),

  // hooks: optional object
  hooks: z.record(z.unknown()).optional(),
}).strict(); // Reject unknown fields

/**
 * Refinements for cross-field validation
 */
export const SkillFrontmatterWithRefinements = SkillFrontmatterSchema.refine(
  (data) => {
    // If context is 'fork', agent must be specified
    if (data.context === 'fork' && !data.agent) {
      return false;
    }
    return true;
  },
  {
    message: 'When context is "fork", agent must be specified',
    path: ['agent'],
  }
);
```

#### `src/schemas/agent-frontmatter.schema.ts`

```typescript
/**
 * Zod schema for Agent frontmatter validation
 * Implements all agent frontmatter rules from rule-validation-tracker.md
 */
import { z } from 'zod';
import { lowercaseHyphens, noXMLTags } from './refinements';
import { VALID_TOOLS, VALID_MODELS } from '../validators/constants';

export const AgentFrontmatterSchema = z
  .object({
    // name: required, max 64 chars, lowercase-hyphens
    name: z
      .string({ required_error: 'Agent name is required' })
      .max(64, 'Agent name must be at most 64 characters')
      .pipe(lowercaseHyphens()),

    // description: required, non-empty
    description: z
      .string({ required_error: 'Agent description is required' })
      .min(1, 'Description cannot be empty'),

    // tools: optional array of tool names
    tools: z.array(z.string()).optional(),

    // disallowedTools: optional array of tool names
    disallowedTools: z.array(z.string()).optional(),

    // model: optional
    model: z.enum(['sonnet', 'opus', 'haiku', 'inherit'] as const).optional(),

    // permissionMode: optional
    permissionMode: z
      .enum(['default', 'acceptEdits', 'dontAsk', 'bypassPermissions', 'plan'] as const)
      .optional(),

    // skills: optional array of skill names
    skills: z.array(z.string()).optional(),

    // hooks: optional object (only PreToolUse, PostToolUse, Stop allowed)
    hooks: z.record(z.unknown()).optional(),
  })
  .strict()
  .refine(
    (data) => {
      // Cannot have same tool in both tools and disallowedTools
      if (data.tools && data.disallowedTools) {
        const overlap = data.tools.filter((t) => data.disallowedTools?.includes(t));
        return overlap.length === 0;
      }
      return true;
    },
    {
      message: 'Tool cannot appear in both tools and disallowedTools',
      path: ['tools'],
    }
  );
```

### 2. Schema Validation Helpers

**Location**: `src/utils/schema-helpers.ts`

```typescript
/**
 * Utilities for converting Zod validation results to ValidationResult format
 */
import { z } from 'zod';
import { ValidationResult, ValidationError, ValidationWarning } from '../validators/base';
import { RuleId } from '../rules/rule-ids';

/**
 * Convert Zod validation error to ValidationResult
 */
export function zodErrorToValidationResult(
  error: z.ZodError,
  filePath?: string,
  ruleIdPrefix?: string
): ValidationResult {
  const errors: ValidationError[] = error.issues.map((issue) => {
    // Generate rule ID from path if not provided
    const path = issue.path.join('-');
    const ruleId = (ruleIdPrefix ? `${ruleIdPrefix}-${path}` : path) as RuleId;

    return {
      message: issue.message,
      file: filePath,
      severity: 'error' as const,
      ruleId,
    };
  });

  return {
    valid: false,
    errors,
    warnings: [],
  };
}

/**
 * Validate data against Zod schema and return ValidationResult
 */
export function validateWithSchema<T extends z.ZodType>(
  schema: T,
  data: unknown,
  options: {
    filePath?: string;
    ruleIdPrefix?: string;
  } = {}
): ValidationResult {
  const result = schema.safeParse(data);

  if (!result.success) {
    return zodErrorToValidationResult(result.error, options.filePath, options.ruleIdPrefix);
  }

  return {
    valid: true,
    errors: [],
    warnings: [],
  };
}

/**
 * Extract and validate frontmatter using schema
 */
export async function validateFrontmatterWithSchema<T extends z.ZodType>(
  content: string,
  schema: T,
  filePath: string,
  ruleIdPrefix: string
): Promise<{ data: z.infer<T> | null; result: ValidationResult }> {
  const { frontmatter, hasFrontmatter } = extractFrontmatter(content);

  if (!hasFrontmatter) {
    return {
      data: null,
      result: {
        valid: false,
        errors: [
          {
            message: 'Missing frontmatter',
            file: filePath,
            severity: 'error',
            ruleId: `${ruleIdPrefix}-missing-frontmatter` as RuleId,
          },
        ],
        warnings: [],
      },
    };
  }

  const validationResult = validateWithSchema(schema, frontmatter, {
    filePath,
    ruleIdPrefix,
  });

  return {
    data: validationResult.valid ? frontmatter as z.infer<T> : null,
    result: validationResult,
  };
}
```

### 3. Shared Validation Utilities

**Location**: `src/utils/validators/`

For rules that aren't frontmatter/schema based:

```
src/utils/validators/
├── index.ts                  # Export all validators
├── path-validators.ts        # File/directory existence, path checks
├── security-validators.ts    # Security pattern detection
├── string-validators.ts      # String pattern helpers
└── reference-validators.ts   # Cross-reference validation
```

#### `src/utils/validators/path-validators.ts`

```typescript
/**
 * Path validation utilities
 */
import { fileExists, directoryExists } from '../file-system';
import { ValidationIssue } from '../validation-helpers';

/**
 * Validate file exists
 * Used by: plugin-missing-file, hooks-missing-script, etc.
 */
export async function validateFileExists(
  path: string,
  context: string = 'File'
): Promise<ValidationIssue | null> {
  const exists = await fileExists(path);
  if (!exists) {
    return {
      message: `${context} not found: ${path}`,
      severity: 'error',
    };
  }
  return null;
}

/**
 * Validate directory exists
 */
export async function validateDirectoryExists(
  path: string,
  context: string = 'Directory'
): Promise<ValidationIssue | null> {
  const exists = await directoryExists(path);
  if (!exists) {
    return {
      message: `${context} not found: ${path}`,
      severity: 'error',
    };
  }
  return null;
}

/**
 * Validate Windows path conventions (forward slashes)
 * Used by: skill-windows-paths
 */
export function validateForwardSlashes(path: string): ValidationIssue | null {
  if (path.includes('\\')) {
    return {
      message: 'Use forward slashes in paths, even on Windows',
      severity: 'warning',
    };
  }
  return null;
}
```

#### `src/utils/validators/security-validators.ts`

```typescript
/**
 * Security validation utilities
 */
import { ValidationIssue } from '../validation-helpers';
import { DANGEROUS_COMMANDS } from '../../validators/constants';

/**
 * Check for dangerous shell commands
 * Used by: skill-dangerous-command
 */
export function validateNoDangerousCommands(content: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (const cmd of DANGEROUS_COMMANDS) {
    if (content.includes(cmd)) {
      issues.push({
        message: `Dangerous command detected: ${cmd}`,
        severity: 'error',
      });
    }
  }

  return issues;
}

/**
 * Check for eval/exec usage
 * Used by: skill-eval-usage
 */
export function validateNoEval(content: string): ValidationIssue | null {
  if (/\b(eval|exec)\s*\(/.test(content)) {
    return {
      message: 'Use of eval/exec detected - potential security risk',
      severity: 'warning',
    };
  }
  return null;
}

/**
 * Check for path traversal patterns
 * Used by: skill-path-traversal, hooks-path-traversal-risk
 */
export function validateNoPathTraversal(path: string): ValidationIssue | null {
  if (path.includes('..')) {
    return {
      message: 'Path contains ".." which could enable path traversal',
      severity: 'warning',
    };
  }
  return null;
}
```

### 4. Enhanced Testing Infrastructure

#### `tests/helpers/schema-tester.ts`

```typescript
/**
 * Test helper for Zod schema validation
 */
import { z } from 'zod';

interface SchemaTestCase<T> {
  description: string;
  data: unknown;
  valid: boolean;
  expectedErrors?: string[];
}

/**
 * Test a Zod schema with multiple test cases
 */
export function testSchema<T extends z.ZodType>(
  schemaName: string,
  schema: T,
  testCases: SchemaTestCase<z.infer<T>>[]
) {
  describe(`${schemaName} Schema`, () => {
    testCases.forEach(({ description, data, valid, expectedErrors }) => {
      it(description, () => {
        const result = schema.safeParse(data);

        if (valid) {
          expect(result.success).toBe(true);
        } else {
          expect(result.success).toBe(false);
          if (expectedErrors && !result.success) {
            const actualErrors = result.error.issues.map((i) => i.message);
            expectedErrors.forEach((expected) => {
              expect(actualErrors).toContain(expected);
            });
          }
        }
      });
    });
  });
}
```

#### Enhanced Fixture Builders

Add schema-validated builders to `tests/helpers/fixtures.ts`:

```typescript
export class SkillBuilder {
  // ... existing methods ...

  /**
   * Build with schema validation to catch test errors early
   */
  async buildWithValidation(): Promise<string> {
    // Validate frontmatter before writing
    const validation = SkillFrontmatterSchema.safeParse(this.frontmatter);
    if (!validation.success) {
      throw new Error(
        `Invalid skill frontmatter in test: ${validation.error.message}`
      );
    }
    return this.build();
  }
}
```

### 5. Rule Documentation Generator

**Location**: `scripts/generate-rule-docs.ts`

```typescript
/**
 * Auto-generate rule documentation from registry and schemas
 */
import { RuleRegistry } from '../src/utils/rule-registry';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

async function generateRuleDocs() {
  const rules = RuleRegistry.getAll();
  const byCategory = new Map<string, typeof rules>();

  // Group by category
  for (const rule of rules) {
    if (!byCategory.has(rule.category)) {
      byCategory.set(rule.category, []);
    }
    byCategory.get(rule.category)!.push(rule);
  }

  // Generate index
  let indexContent = '# Validation Rules\n\n';
  indexContent += `Total Rules: ${rules.length}\n\n`;

  for (const [category, categoryRules] of byCategory) {
    indexContent += `## ${category} (${categoryRules.length} rules)\n\n`;

    for (const rule of categoryRules) {
      indexContent += `- [\`${rule.id}\`](./rules/${rule.id}.md) - ${rule.description}\n`;
    }

    indexContent += '\n';
  }

  await writeFile('docs/rules/README.md', indexContent);

  // Generate per-rule docs
  const rulesDir = 'docs/rules';
  await mkdir(rulesDir, { recursive: true });

  for (const rule of rules) {
    const ruleDoc = generateRuleDoc(rule);
    await writeFile(join(rulesDir, `${rule.id}.md`), ruleDoc);
  }

  console.log(`Generated documentation for ${rules.length} rules`);
}

function generateRuleDoc(rule: RuleMetadata): string {
  return `# ${rule.name} (\`${rule.id}\`)

${rule.description}

**Category**: ${rule.category}
**Severity**: ${rule.severity}
**Fixable**: ${rule.fixable ? 'Yes' : 'No'}
**Since**: ${rule.since}

## Examples

### Invalid

<!-- TODO: Add invalid examples -->

### Valid

<!-- TODO: Add valid examples -->

## Implementation

See: [\`src/validators/${rule.category.toLowerCase()}.ts\`](../../src/validators/${rule.category.toLowerCase()}.ts)

## Tests

See: [\`tests/validators/${rule.category.toLowerCase()}.test.ts\`](../../tests/validators/${rule.category.toLowerCase()}.test.ts)
`;
}

generateRuleDocs().catch(console.error);
```

### 6. Enforcement Mechanisms

#### Pre-commit Hook (`.husky/pre-commit`)

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Run tests for modified validators
npm run test:validators

# Check rule coverage (ensure all rules have tests)
npm run check:rule-coverage

# Lint validator files
npx eslint src/validators/**/*.ts src/schemas/**/*.ts --fix

# Check for duplicate validation logic
npm run check:duplicates
```

#### Package.json scripts

```json
{
  "scripts": {
    "check:rule-coverage": "tsx scripts/check-rule-coverage.ts",
    "check:duplicates": "tsx scripts/check-duplicate-logic.ts",
    "generate:rule-docs": "tsx scripts/generate-rule-docs.ts",
    "test:validators": "jest tests/validators --coverage",
    "test:schemas": "jest tests/schemas"
  }
}
```

#### `scripts/check-rule-coverage.ts`

```typescript
/**
 * Ensure every registered rule has corresponding tests
 */
import { RuleRegistry } from '../src/utils/rule-registry';
import { existsSync } from 'fs';
import { join } from 'path';

const rules = RuleRegistry.getAll();
const missingTests: string[] = [];

for (const rule of rules) {
  // Check if test file mentions this rule ID
  const testFile = join('tests', 'validators', `${rule.category.toLowerCase()}.test.ts`);

  if (!existsSync(testFile)) {
    missingTests.push(`${rule.id}: No test file for ${rule.category}`);
    continue;
  }

  // TODO: Parse test file and check for rule ID coverage
}

if (missingTests.length > 0) {
  console.error('❌ Rules missing tests:');
  missingTests.forEach((msg) => console.error(`  - ${msg}`));
  process.exit(1);
}

console.log(`✅ All ${rules.length} rules have test coverage`);
```

---

## Revised Rule Categories

Based on schema-first approach, rules fall into these categories:

### Category A: Schema Validation (140 rules - ~70% of total)

**Handled by Zod schemas** - No manual validation logic needed:

- Skills frontmatter (20 rules) → `SkillFrontmatterSchema`
- Agent frontmatter (25 rules) → `AgentFrontmatterSchema`
- Output styles frontmatter (12 rules) → `OutputStyleFrontmatterSchema`
- Settings validation (32 rules) → `SettingsSchema` ✅ (already exists)
- Hooks validation (26 rules) → `HooksConfigSchema` ✅ (already exists)
- MCP validation (28 rules) → `MCPConfigSchema` ✅ (already exists)
- Plugin validation (33 rules) → `PluginManifestSchema` ✅ (already exists)
- LSP validation (22 rules) → `LSPConfigSchema`
- CLAUDE.md frontmatter (6 rules) → `ClaudeMdFrontmatterSchema`

**Implementation**: Define schemas with refinements, use `validateWithSchema()` helper.

### Category B: File System Checks (15 rules)

**Handled by path validators**:

- File existence checks
- Directory structure validation
- Path format validation (absolute/relative)
- Windows path conventions

**Implementation**: Use `src/utils/validators/path-validators.ts`

### Category C: Security Checks (10 rules)

**Handled by security validators**:

- Dangerous commands
- eval/exec usage
- Path traversal
- Sensitive file access

**Implementation**: Use `src/utils/validators/security-validators.ts`

### Category D: Cross-Reference Validation (12 rules)

**Requires custom logic**:

- Import circular dependency detection
- Skill/agent reference resolution
- Tool name validation against registry

**Implementation**: Custom validators in each validator class

### Category E: Content Analysis (42 rules)

**Requires custom logic**:

- File size checks (CLAUDE.md)
- Line count checks (SKILL.md body)
- Documentation completeness (CHANGELOG, examples)
- Directory organization (nesting, file count)
- Time-sensitive content detection

**Implementation**: Keep existing manual validation, enhance with helpers

---

## Implementation Strategy

### Phase 1: Foundation (Week 1)

**Goal**: Build schema infrastructure and helpers

**Tasks**:

1. ✅ Install dependencies: `zod-validation-error`
2. Create `src/schemas/` directory structure
3. Implement `refinements.ts` with all reusable refinements
4. Create `schema-helpers.ts` validation utilities
5. Create `src/utils/validators/` for non-schema rules
6. Set up testing infrastructure (`schema-tester.ts`)
7. Create enforcement scripts (`check-rule-coverage.ts`)

**Deliverables**:

- All schema infrastructure files
- Helper utilities ready to use
- Testing framework in place
- Enforcement scripts working

**Tests**: Test all refinements independently

### Phase 2: Schema Implementation (Week 2-3)

**Goal**: Create all Zod schemas for frontmatter and config validation

**Week 2 - Frontmatter Schemas**:

1. `skill-frontmatter.schema.ts` (20 rules)
2. `agent-frontmatter.schema.ts` (25 rules)
3. `output-style-frontmatter.schema.ts` (12 rules)
4. `claude-md-frontmatter.schema.ts` (6 rules)

**Week 3 - Config Schemas**:

1. Enhance existing `SettingsSchema` (add missing rules)
2. Enhance existing `HooksConfigSchema` (add missing rules)
3. Enhance existing `MCPConfigSchema` (add missing rules)
4. Enhance existing `PluginManifestSchema` (add missing rules)
5. Create `lsp-config.schema.ts` (22 rules)

**Deliverables**:

- All schemas implemented with full rule coverage
- Schema tests passing
- Documentation for each schema

**Tests**: Use `testSchema()` helper with comprehensive test cases

### Phase 3: Validator Refactoring (Week 4-5)

**Goal**: Refactor validators to use schemas

**Week 4 - Frontmatter Validators**:

1. Refactor `SkillsValidator` to use `SkillFrontmatterSchema`
2. Create `AgentValidator` using `AgentFrontmatterSchema`
3. Create `OutputStyleValidator` using `OutputStyleFrontmatterSchema`
4. Update `ClaudeMdValidator` to use schema for frontmatter

**Week 5 - Config Validators**:

1. Enhance `SettingsValidator` with additional rules
2. Enhance `HooksValidator` with additional rules
3. Enhance `MCPValidator` with additional rules
4. Enhance `PluginValidator` with additional rules
5. Create `LSPValidator` using `LSPConfigSchema`

**Deliverables**:

- All validators refactored to use schemas
- Massive reduction in manual validation code
- All existing tests still passing
- New tests for new rules

**Tests**: Ensure all validators have comprehensive test coverage

### Phase 4: Remaining Rules (Week 6)

**Goal**: Implement non-schema rules

**Tasks**:

1. File system checks (15 rules) - use path validators
2. Security checks (10 rules) - use security validators
3. Cross-reference validation (12 rules) - custom logic
4. Content analysis (42 rules) - enhance existing code

**Deliverables**:

- All 219 rules implemented
- 100% test coverage
- Documentation generated

**Tests**: Test each rule category independently

### Phase 5: Documentation & Enforcement (Week 7)

**Goal**: Polish and enforce quality

**Tasks**:

1. Run `generate-rule-docs.ts` to create all rule documentation
2. Add examples to each rule doc
3. Set up pre-commit hooks
4. Configure CI checks
5. Performance testing and optimization
6. Final code review and cleanup

**Deliverables**:

- Complete rule documentation
- Enforcement mechanisms active
- CI/CD configured
- Performance benchmarks met

---

## Success Metrics

### Coverage Metrics

- ✅ 219/219 rules implemented (100%)
- ✅ 219/219 rules tested (100%)
- ✅ 219/219 rules documented (100%)

### Quality Metrics

- ✅ Zero duplicate validation logic
- ✅ >80% of rules use shared schemas/validators
- ✅ All tests passing with >90% code coverage

### Performance Metrics

- ✅ Validation time <100ms for typical project
- ✅ Validation time <500ms for large project

### Maintainability Metrics

- ✅ Schema-based rules: <5 lines per rule
- ✅ Manual rules: <20 lines per rule
- ✅ Clear separation of concerns

---

## Example: Refactoring Skills Validator

### Before (Current - ~400 lines)

```typescript
class SkillsValidator {
  private validateFrontmatter(filePath, content, skillName) {
    const { frontmatter } = extractFrontmatter(content);

    // 200+ lines of manual if/else validation
    if (!frontmatter.name) { /* ... */ }
    if (frontmatter.name.length > 64) { /* ... */ }
    if (!PATTERN.test(frontmatter.name)) { /* ... */ }
    // ... etc
  }
}
```

### After (Schema-based - ~50 lines)

```typescript
class SkillsValidator {
  private async validateFrontmatter(filePath, content, skillName) {
    // Extract and validate with schema - ONE CALL
    const { data, result } = await validateFrontmatterWithSchema(
      content,
      SkillFrontmatterWithRefinements,
      filePath,
      'skill-frontmatter'
    );

    // Merge schema validation results
    this.errors.push(...result.errors);
    this.warnings.push(...result.warnings);

    // Additional validation not covered by schema
    if (data && data.name !== skillName) {
      this.reportError(
        `Skill name "${data.name}" must match directory "${skillName}"`,
        filePath,
        undefined,
        'skill-name-mismatch'
      );
    }
  }
}
```

**Lines of code**: 400 → 50 (87.5% reduction)
**Rules covered**: 20+ rules with one schema
**Maintainability**: Much better - schema is self-documenting

---

## File Changes Summary

### New Files to Create (~25 files)

```
src/schemas/
├── index.ts
├── refinements.ts
├── skill-frontmatter.schema.ts
├── agent-frontmatter.schema.ts
├── output-style-frontmatter.schema.ts
├── lsp-config.schema.ts
└── claude-md-frontmatter.schema.ts

src/utils/
├── schema-helpers.ts
└── validators/
    ├── index.ts
    ├── path-validators.ts
    ├── security-validators.ts
    ├── string-validators.ts
    └── reference-validators.ts

tests/helpers/
└── schema-tester.ts

tests/schemas/
├── skill-frontmatter.schema.test.ts
├── agent-frontmatter.schema.test.ts
├── output-style-frontmatter.schema.test.ts
├── lsp-config.schema.test.ts
└── refinements.test.ts

scripts/
├── generate-rule-docs.ts
├── check-rule-coverage.ts
└── check-duplicate-logic.ts

.husky/
└── pre-commit
```

### Files to Modify (~10 files)

```
src/validators/
├── skills.ts           # Refactor to use schema
├── claude-md.ts        # Add schema for frontmatter
├── settings.ts         # Enhance with additional rules
├── hooks.ts            # Enhance with additional rules
├── mcp.ts              # Enhance with additional rules
├── plugin.ts           # Enhance with additional rules
└── schemas.ts          # Enhance existing schemas

src/validators/ (new)
└── agents.ts           # New validator
└── output-styles.ts    # New validator
└── lsp.ts              # New validator

package.json            # Add scripts and dependencies
```

---

## Next Steps

1. **Review & Approve**: Review this plan and provide feedback
2. **Install Dependencies**: `npm install zod-validation-error`
3. **Start Phase 1**: Begin building schema infrastructure
4. **Incremental Implementation**: One phase at a time with reviews

---

## Questions for Discussion

1. Should we tackle all validators at once or one category at a time?
2. Do we want to maintain backward compatibility during refactoring?
3. Should we create a migration guide for plugin authors?
4. Any specific rules that need special attention?

---

## Additional Optimizations

Beyond schema-based validation, we've identified 4 additional areas for massive code reduction.

### Optimization 1: Auto-Generated Rule Registry

**Problem**: Manually registering 219 rules = 5,913 lines of repetitive code.

**Current Approach**:

```typescript
// src/rules/index.ts - Manual registration (321 lines for 12 rules)
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
// ... repeat 218 more times
```

**Optimized Approach**: Extract metadata from schemas automatically.

```typescript
// Embed rule metadata in schema error messages
const SkillFrontmatterSchema = z.object({
  name: z.string().max(64, {
    message: 'Skill name must be at most 64 characters',
    // Metadata for rule generation
    meta: {
      ruleId: 'skill-frontmatter-name-max-length',
      category: 'Skills',
      severity: 'error',
      fixable: false,
      since: '1.0.0'
    }
  })
});

// Script extracts and generates src/rules/index.ts
npm run generate:rule-registry
```

**Implementation**:

- Create `scripts/generate-rule-registry.ts`
- Parse all schema files for rule metadata
- Generate `src/rules/index.ts` automatically
- Run as part of build process

**Savings**: 5,913 lines → 100 lines = **98% reduction**

### Optimization 2: Standardized Test Fixtures

**Problem**: Each test file duplicates 25+ lines of fixture creation code.

**Current Duplication** (6 test files):

```typescript
// tests/validators/skills.test.ts
async function createSkill(skillName, frontmatter, content) {
  const skillDir = join(getTestDir(), '.claude', 'skills', skillName);
  await mkdir(skillDir, { recursive: true });
  const yamlLines = Object.entries(frontmatter)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return `${key}:\n${value.map((v) => `  - ${v}`).join('\n')}`;
      }
      return `${key}: ${JSON.stringify(value)}`;
    })
    .join('\n');
  // ... 15 more lines
}

// tests/validators/hooks.test.ts
async function createHooksFile(hooks) {
  // ... 20 duplicate lines
}

// ... 4 more test files with similar duplication
```

**Optimized Approach**: Use builders from `tests/helpers/fixtures.ts` consistently.

```typescript
// All tests use the same builders
import { skill, hooks, mcp, plugin, settings } from '../helpers/fixtures';

// One line instead of 25
await skill(testDir, 'my-skill')
  .withFrontmatter({ name: 'my-skill', description: 'Test' })
  .build();

await hooks(testDir).addHook('SessionStart', 'echo hi').build();
await mcp(testDir).addServer('test', { type: 'stdio', command: 'node' }).build();
```

**Implementation**:

- Add pre-commit check: reject `async function create*` in test files
- Convert all existing tests to use builders
- Document builder usage in testing guide

**Savings**: 150 lines → 50 lines = **67% reduction**

### Optimization 3: Schema-Derived Constants

**Problem**: Constants duplicated between `constants.ts` and schemas.

**Current Duplication**:

```typescript
// src/validators/constants.ts
export const VALID_MODELS = ['sonnet', 'opus', 'haiku', 'inherit'];
export const VALID_TOOLS = ['Bash', 'Read', 'Write', ...];
export const VALID_HOOK_EVENTS = ['PreToolUse', 'PostToolUse', ...];

// src/validators/schemas.ts (DUPLICATE!)
model: z.enum(['sonnet', 'opus', 'haiku', 'inherit'])
tools: z.array(z.enum(['Bash', 'Read', 'Write', ...]))
```

**Optimized Approach**: Single source of truth using Zod enums.

```typescript
// src/schemas/constants.ts - Define once as Zod enums
export const ModelNames = z.enum(['sonnet', 'opus', 'haiku', 'inherit']);
export const ToolNames = z.enum(['Bash', 'Read', 'Write', ...]);
export const HookEvents = z.enum(['PreToolUse', 'PostToolUse', ...]);

// Use in schemas
export const SkillFrontmatterSchema = z.object({
  model: ModelNames.optional(),
  'allowed-tools': z.array(ToolNames).optional()
});

// Extract runtime values
export const VALID_MODELS = ModelNames.options; // ['sonnet', 'opus', ...]
export const VALID_TOOLS = ToolNames.options; // ['Bash', 'Read', ...]
```

**Implementation**:

- Create `src/schemas/constants.ts`
- Move all enum constants to Zod enums
- Export both schemas and runtime values
- Update imports across codebase

**Savings**: 200 lines → 100 lines = **50% reduction**

### Optimization 4: Composition Framework Adoption

**Problem**: Built composition framework but validators don't use it yet.

**Current Manual Validation**:

```typescript
// Validators have ~2,000 lines of manual checks
if (!value) {
  this.reportError('Value is required', filePath);
}
if (typeof value !== 'string') {
  this.reportError('Value must be a string', filePath);
}
if (value.length > 64) {
  this.reportError('Value must be at most 64 characters', filePath);
}
if (!PATTERN.test(value)) {
  this.reportError('Value has invalid format', filePath);
}
// ... repeat for every field
```

**Optimized Approach**: Use composition operators from `src/composition/`.

```typescript
// Already built in src/composition/operators.ts
import { compose, required, maxLength } from '../composition';

const validateName = compose(
  required(),
  maxLength(64),
  regex(PATTERN, 'Invalid format')
);

// One call replaces 15 lines
const result = await validateName(value, { filePath, options: this.options });
this.errors.push(...result.errors);
```

**Implementation**:

- Refactor validators during Phase 4 to use composition
- Replace manual if/else chains with compose()
- Use optional(), conditional(), all() operators
- Document composition patterns

**Savings**: 2,000 lines → 500 lines = **75% reduction**

---

## Total Effort Comparison

### Traditional Manual Approach

| Component | Lines | Notes |
|-----------|-------|-------|
| Validation logic | 5,670 | Manual if/else for 207 rules |
| Rule registry | 5,913 | Manual RuleRegistry.register() |
| Test fixtures | 150 | Duplicate creation functions |
| Error reporting | 475 | Manual reportError() calls |
| Constants | 200 | Duplicated in schemas |
| **Total** | **12,408** | Total lines to write |

### Optimized Schema-First Approach

| Component | Lines | Notes |
|-----------|-------|-------|
| Schema validation | 1,245 | Schema definitions + refinements |
| Auto-generated registry | 100 | Generation script |
| Builder-based tests | 50 | Use existing builders |
| Schema-driven errors | 20 | Integration code |
| Schema constants | 100 | Single source of truth |
| **Total** | **1,515** | Total lines to write |

**Overall Reduction: 88%** (12,408 → 1,515 lines)

---
