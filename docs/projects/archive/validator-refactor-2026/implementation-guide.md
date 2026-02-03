# Implementation Guide

This guide provides detailed, step-by-step instructions for implementing the validator refactoring.

## Table of Contents

- [Phase 1: Foundation](#phase-1-foundation)
- [Phase 2: Standardization](#phase-2-standardization)
- [Phase 3: Documentation](#phase-3-documentation)
- [Phase 4: Validation](#phase-4-validation)

---

## Phase 1: Foundation

### Step 1.3.1: Replace validateFile() Method

**File:** `src/validators/schema-validator.ts` (currently `json-config-base.ts`)

**Current code (lines 68-101):**

```typescript
private async validateFile(filePath: string): Promise<void> {
  // Create validation context
  const context: ValidationContext = {
    filePath,
    options: this.options,
    state: new Map(),
  };

  // Step 1: Read and parse JSON
  const readValidator = readJSON<z.infer<T>>();
  const readResult = await readValidator(filePath, context);

  // Merge read errors/warnings into validator result
  this.mergeSchemaValidationResult(readResult);

  if (!readResult.valid) {
    return;
  }

  // Step 2: Validate against schema
  const schemaValidator = zodSchema(this.getSchema());
  const schemaResult = await schemaValidator(null, context);

  // Merge schema validation errors/warnings into validator result
  this.mergeSchemaValidationResult(schemaResult);

  // If validation passed, run custom validation
  if (schemaResult.valid) {
    const config = context.state?.get('validatedData') as z.infer<T>;
    if (config) {
      await this.validateConfig(filePath, config);
    }
  }
}
```

**Replace with:**

```typescript
/**
 * Validates a single JSON configuration file
 *
 * Process:
 * 1. Read file content
 * 2. Parse JSON (report syntax errors)
 * 3. Validate against Zod schema (report structure errors)
 * 4. Execute category rules
 * 5. Run custom semantic validation
 *
 * @param filePath - Path to the JSON file to validate
 */
private async validateFile(filePath: string): Promise<void> {
  try {
    // Step 1: Read file
    const content = await fs.readFile(filePath, 'utf-8');

    // Step 2: Parse JSON
    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch (parseError) {
      const message = parseError instanceof Error
        ? parseError.message
        : String(parseError);
      this.report({
        message: `Invalid JSON syntax: ${message}`,
        file: filePath,
        severity: 'error',
      });
      return;
    }

    // Step 3: Validate against Zod schema
    const schema = this.getSchema();
    const result = schema.safeParse(parsed);

    if (!result.success) {
      // Report all schema validation errors
      result.error.issues.forEach((issue) => {
        const path = issue.path.length > 0
          ? `${issue.path.join('.')}: `
          : '';
        this.report({
          message: `${path}${issue.message}`,
          file: filePath,
          severity: 'error',
        });
      });
      return;
    }

    // Step 4: Execute all rules for this category
    // This runs rule validation on the raw content
    await this.executeRulesForCategory(
      this.getCategoryFromValidator(),
      filePath,
      content
    );

    // Step 5: Run custom semantic validation
    // This receives the parsed, validated config object
    await this.validateSemantics(filePath, result.data);

  } catch (error) {
    const message = error instanceof Error
      ? error.message
      : String(error);
    this.report({
      message: `Error validating file: ${message}`,
      file: filePath,
      severity: 'error',
    });
  }
}

/**
 * Get the category for this validator (used for rule execution)
 * Must be implemented by subclasses
 */
protected abstract getCategoryFromValidator(): RuleCategory;
```

**Note:** You'll need to add the `getCategoryFromValidator()` abstract method, or have each validator store its category in a property.

**Alternative (simpler):** If validators already have a category property or can determine it:

```typescript
private async validateFile(filePath: string): Promise<void> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch (parseError) {
      const message = parseError instanceof Error ? parseError.message : String(parseError);
      this.report({
        message: `Invalid JSON syntax: ${message}`,
        file: filePath,
        severity: 'error',
      });
      return;
    }

    const schema = this.getSchema();
    const result = schema.safeParse(parsed);

    if (!result.success) {
      result.error.issues.forEach((issue) => {
        const path = issue.path.length > 0 ? `${issue.path.join('.')}: ` : '';
        this.report({
          message: `${path}${issue.message}`,
          file: filePath,
          severity: 'error',
        });
      });
      return;
    }

    // Note: Category-based rule execution should be called by subclass
    // Or add abstract getCategoryName() method

    await this.validateSemantics(filePath, result.data);

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    this.report({
      message: `Error validating file: ${message}`,
      file: filePath,
      severity: 'error',
    });
  }
}
```

**Required imports at top of file:**

```typescript
import { promises as fs } from 'fs';
```

### Step 1.6.x: Update Validator Implementations

For each validator that extends SchemaValidator (was JSONConfigValidator):

**Pattern for updating:**

```typescript
// Before:
import { JSONConfigValidator, JSONConfigValidatorOptions } from './json-config-base';

export class MCPValidator extends JSONConfigValidator<typeof MCPConfigSchema> {
  protected async validateConfig(filePath: string, config: MCPConfig): Promise<void> {
    // ...
  }
}

// After:
import { SchemaValidator, SchemaValidatorOptions } from './schema-validator';

export class MCPValidator extends SchemaValidator<typeof MCPConfigSchema> {
  protected async validateSemantics(filePath: string, config: MCPConfig): Promise<void> {
    // ...
  }
}
```

**Files to update:**

1. `src/validators/mcp.ts`
2. `src/validators/settings.ts`
3. `src/validators/hooks.ts`
4. `src/validators/plugin.ts`
5. `src/validators/lsp.ts`

For each validator that extends FileValidator (was BaseValidator):

```typescript
// Before:
import { BaseValidator, ValidationResult } from './base';

export class ClaudeMdValidator extends BaseValidator {
  // ...
}

// After:
import { FileValidator, ValidationResult } from './file-validator';

export class ClaudeMdValidator extends FileValidator {
  // ...
}
```

**Files to update:**

1. `src/validators/claude-md.ts`
2. `src/validators/skills.ts`
3. `src/validators/agents.ts`
4. `src/validators/output-styles.ts`
5. `src/validators/commands.ts`

---

## Phase 2: Standardization

### Step 2.3.1: Add JSDoc to FileValidator

**File:** `src/validators/file-validator.ts`

**Add above the class declaration:**

```typescript
/**
 * Base class for validators that validate text/markdown files
 *
 * FileValidator provides the foundation for validating files without strict schemas.
 * It handles:
 * - Issue collection and reporting
 * - Config resolution for rules
 * - Inline disable comment parsing (claudelint-disable)
 * - Category-based rule execution
 * - Result aggregation
 *
 * Use FileValidator when:
 * - Files are markdown or plain text
 * - Files don't have strict schemas (CLAUDE.md, SKILL.md, etc.)
 * - Validation is primarily rule-based
 *
 * Subclasses must implement:
 * - `validate()` - Main validation logic
 *
 * @example
 * ```typescript
 * class SkillsValidator extends FileValidator {
 *   async validate(): Promise<ValidationResult> {
 *     // Find skill files
 *     const files = await glob('**\/SKILL.md', { cwd: this.basePath });
 *
 *     for (const file of files) {
 *       // Read file content
 *       const content = await fs.readFile(file, 'utf-8');
 *
 *       // Set context for config resolution
 *       this.setCurrentFile(file);
 *
 *       // Execute all rules in 'Skills' category
 *       await this.executeRulesForCategory('Skills', file, content);
 *     }
 *
 *     return this.getResult();
 *   }
 * }
 * ```
 *
 * @see {@link SchemaValidator} for JSON file validation with schemas
 */
export abstract class FileValidator {
  // ... class implementation
}
```

**Add to key methods:**

```typescript
/**
 * Execute all rules for a given category
 *
 * Automatically discovers all rules registered for the category via RuleRegistry
 * and executes them against the file content.
 *
 * @param category - Rule category to execute (e.g., 'CLAUDE.md', 'Skills')
 * @param filePath - Path to the file being validated
 * @param fileContent - Content of the file as a string
 *
 * @example
 * ```typescript
 * await this.executeRulesForCategory('MCP', '/path/to/config.mcp.json', content);
 * ```
 */
protected async executeRulesForCategory(
  category: RuleCategory,
  filePath: string,
  fileContent: string
): Promise<void> {
  // ... implementation
}

/**
 * Set the current file being validated
 *
 * Must be called before accessing rule options or checking if rules are enabled.
 * This allows config resolution to apply file-specific overrides.
 *
 * @param filePath - Path to the file being validated
 *
 * @example
 * ```typescript
 * for (const file of files) {
 *   this.setCurrentFile(file);
 *   const options = this.getRuleOptions('my-rule');
 *   // ... validate file
 * }
 * ```
 */
protected setCurrentFile(filePath: string): void {
  // ... implementation
}
```

### Step 2.4.1: Add JSDoc to SchemaValidator

**File:** `src/validators/schema-validator.ts`

**Add above the class declaration:**

```typescript
/**
 * Base class for validators that validate JSON configuration files
 *
 * SchemaValidator extends FileValidator with automatic JSON parsing and Zod schema validation.
 * It provides:
 * - Automatic JSON syntax validation
 * - Zod schema structure validation
 * - All FileValidator capabilities (rules, config resolution, etc.)
 * - validateSemantics() hook for custom validation
 *
 * Use SchemaValidator when:
 * - Files are JSON configuration files
 * - You have a Zod schema for structural validation
 * - You need automatic JSON parse error reporting
 * - You want type-safe access to parsed config
 *
 * Subclasses must implement:
 * - `findConfigFiles(basePath)` - Find JSON config files
 * - `getSchema()` - Return Zod schema for validation
 * - `validateSemantics(filePath, config)` - Custom validation beyond schema
 *
 * @example
 * ```typescript
 * class MCPValidator extends SchemaValidator<typeof MCPConfigSchema> {
 *   protected getSchema() {
 *     return MCPConfigSchema;
 *   }
 *
 *   protected async findConfigFiles(basePath: string) {
 *     return glob('**\/*.mcp.json', { cwd: basePath });
 *   }
 *
 *   protected async validateSemantics(filePath: string, config: MCPConfig) {
 *     // Schema validation already complete at this point
 *     // config is typed and guaranteed to match schema
 *
 *     // Check business rules that can't be expressed in schema
 *     if (config.mcpServers) {
 *       const serverNames = new Set<string>();
 *       for (const [, server] of Object.entries(config.mcpServers)) {
 *         if (server.name && serverNames.has(server.name)) {
 *           this.report({
 *             message: `Duplicate server name: ${server.name}`,
 *             file: filePath,
 *           });
 *         }
 *         serverNames.add(server.name);
 *       }
 *     }
 *   }
 * }
 * ```
 *
 * @typeParam T - Zod schema type for the configuration
 *
 * @see {@link FileValidator} for text/markdown file validation
 */
export abstract class SchemaValidator<T extends ZodType> extends FileValidator {
  // ... class implementation
}
```

**Add to abstract methods:**

```typescript
/**
 * Get the Zod schema for validating this configuration type
 *
 * The schema is used for structural validation of the parsed JSON.
 * Schema validation happens before rules and validateSemantics().
 *
 * @returns Zod schema instance
 *
 * @example
 * ```typescript
 * protected getSchema() {
 *   return MCPConfigSchema; // Defined in src/validators/schemas/mcp.ts
 * }
 * ```
 */
protected abstract getSchema(): T;

/**
 * Find all configuration files in the given base path
 *
 * @param basePath - Base directory to search from
 * @returns Array of absolute file paths
 *
 * @example
 * ```typescript
 * protected async findConfigFiles(basePath: string) {
 *   return glob('**\/*.mcp.json', {
 *     cwd: basePath,
 *     absolute: true
 *   });
 * }
 * ```
 */
protected abstract findConfigFiles(basePath: string): Promise<string[]>;

/**
 * Perform semantic/business logic validation beyond schema structure
 *
 * This method is called after:
 * 1. JSON parsing succeeds
 * 2. Schema validation passes
 * 3. Category rules execute
 *
 * Use this for validation that can't be expressed in Zod schemas:
 * - Cross-field dependencies
 * - Duplicate detection
 * - Business logic constraints
 * - File reference validation
 *
 * @param filePath - Path to the config file
 * @param config - Parsed and schema-validated configuration object
 *
 * @example
 * ```typescript
 * protected async validateSemantics(filePath: string, config: SettingsConfig) {
 *   // Check for conflicting settings
 *   if (config.sandbox?.enabled && config.permissions?.allowAll) {
 *     this.report({
 *       message: 'Sandbox mode conflicts with allowAll permissions',
 *       file: filePath,
 *     });
 *   }
 * }
 * ```
 */
protected abstract validateSemantics(filePath: string, config: z.infer<T>): Promise<void>;
```

---

## Phase 3: Documentation

### Step 3.1.1: Create validation-architecture.md

**File:** `docs/validation-architecture.md`

See the complete content in architecture-changes.md section "New Documentation".

**Key sections to include:**

1. **Overview** - High-level explanation of two-tier system
2. **Validator Types** - FileValidator vs SchemaValidator
3. **Two-Layer Validation** - Schema vs Rules
4. **Decision Flowchart** - When to use which validator
5. **Rule Capabilities** - What rules can do
6. **Examples** - Concrete code examples
7. **Best Practices** - Guidelines for contributors

### Step 3.2.x: Update Existing Docs

**Search and replace patterns:**

```bash
# Find all references to old names
grep -r "BaseValidator" docs/
grep -r "JSONConfigValidator" docs/
grep -r "validateConfig" docs/

# Replace in each file:
BaseValidator → FileValidator
JSONConfigValidator → SchemaValidator
validateConfig → validateSemantics
```

**Files likely to need updates:**

- `docs/architecture.md`
- `docs/rule-development.md`
- `docs/custom-rules.md`
- `docs/contributing-rules.md`
- Any other docs mentioning validators

---

## Phase 4: Validation

### Step 4.2.2: Test All Validator Categories

**Manual test checklist:**

```bash
# Test CLAUDE.md validation
echo "Testing CLAUDE.md validator..."
# Create test file or use existing CLAUDE.md

# Test Skills validation
echo "Testing Skills validator..."
# Navigate to .claude/skills directory

# Test MCP validation
echo "Testing MCP validator..."
# Create or test existing .mcp.json files

# Test Settings validation
echo "Testing Settings validator..."
# Test settings.json

# Test Hooks validation
echo "Testing Hooks validator..."
# Test hooks.json

# Test Plugin validation
echo "Testing Plugin validator..."
# Test plugin.json files

# Test LSP validation
echo "Testing LSP validator..."
# Test LSP config files

# Test Agents validation
echo "Testing Agents validator..."
# Test agent directories

# Test Output Styles validation
echo "Testing Output Styles validator..."
# Test output style files

# Test Commands validation (deprecated)
echo "Testing Commands validator..."
# Should warn about deprecation
```

### Step 4.3.1: Update CHANGELOG.md

**Add entry:**

```markdown
## [Unreleased]

### Changed

#### Internal Refactoring: Validator Architecture

**Breaking changes for plugin/custom validator developers:**

- Renamed `BaseValidator` → `FileValidator` for clarity
- Renamed `JSONConfigValidator` → `SchemaValidator` for clarity
- Renamed `validateConfig()` → `validateSemantics()` in SchemaValidator
- Removed composition framework (internal implementation detail)

**Impact:**
- End users: No changes required
- Plugin developers with custom validators: Update imports and class names
- Migration guide: See `docs/validation-architecture.md`

**Benefits:**
- Removed 733 lines of unused code
- Clearer naming that explains validator purposes
- Improved documentation and onboarding
- Simplified implementation (no composition framework)
- Better type safety and IDE support

### Removed

- Composition framework (`src/composition/`) - 733 lines of unused validation utilities

### Added

- Comprehensive validation architecture documentation (`docs/validation-architecture.md`)
- JSDoc documentation for FileValidator and SchemaValidator
- Decision flowchart for choosing validator types
```

---

## Common Issues & Solutions

### Issue: TypeScript errors after renaming

**Solution:** Ensure all imports are updated:

```bash
# Find any remaining old imports
grep -r "from './base'" src/
grep -r "from './json-config-base'" src/
grep -r "BaseValidator" src/
grep -r "JSONConfigValidator" src/
```

### Issue: Tests failing after composition removal

**Solution:** Update test imports and mocks:

```typescript
// Before:
import { readJSON } from '../composition/json-validators';

// After:
// Remove import, use direct JSON.parse in tests
```

### Issue: Missing category in SchemaValidator

**Solution:** Add category tracking to SchemaValidator if needed:

```typescript
export abstract class SchemaValidator<T extends ZodType> extends FileValidator {
  protected abstract category: RuleCategory;

  // Then use in validateFile():
  await this.executeRulesForCategory(this.category, filePath, content);
}
```

---

## Rollback Instructions

If you need to rollback:

```bash
# Reset to main
git reset --hard main

# Or revert specific commits
git revert <commit-hash>

# Composition framework is in git history
git checkout main -- src/composition
```

---

## Success Criteria

After completing all phases, verify:

- [x] All tests pass
- [x] Build succeeds with no errors
- [x] ~733 lines removed
- [x] No references to composition framework remain
- [x] All validators use new naming
- [x] Documentation is complete and accurate
- [x] Running claudelint on a real project works
- [x] All 10 validator categories function correctly
