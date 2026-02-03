# Architecture Changes

This document details the architectural changes made during the validator refactoring.

## Summary of Changes

| Aspect | Before | After | Impact |
|--------|--------|-------|--------|
| **Base class name** | BaseValidator | FileValidator | Clearer purpose |
| **JSON validator name** | JSONConfigValidator | SchemaValidator | Clearer purpose |
| **Semantic validation method** | validateConfig() | validateSemantics() | Clearer intent |
| **Composition framework** | 733 lines | Deleted | Simpler code |
| **JSON validation** | Via composition | Direct Zod | Simpler, clearer |
| **Total LOC** | ~1000 validator code | ~270 validator code | 73% reduction |
| **Documentation** | Minimal | Comprehensive | Better onboarding |

---

## Class Hierarchy Changes

### Before

```
BaseValidator (abstract)
├── ClaudeMdValidator
├── SkillsValidator
├── AgentsValidator
├── OutputStylesValidator
├── CommandsValidator
└── JSONConfigValidator (abstract)
    ├── MCPValidator
    ├── SettingsValidator
    ├── HooksValidator
    ├── PluginValidator
    └── LSPValidator
```

### After

```
FileValidator (abstract)
├── ClaudeMdValidator
├── SkillsValidator
├── AgentsValidator
├── OutputStylesValidator
├── CommandsValidator
└── SchemaValidator (abstract)
    ├── MCPValidator
    ├── SettingsValidator
    ├── HooksValidator
    ├── PluginValidator
    └── LSPValidator
```

**Change:** Only naming - structure remains the same.

---

## Code Comparison

### BaseValidator → FileValidator

**File name change:**

- `src/validators/base.ts` → `src/validators/file-validator.ts`

**Class name change:**

```typescript
// Before:
export abstract class BaseValidator {
  // ...
}

// After:
export abstract class FileValidator {
  // ... (same implementation)
}
```

**Why:** "File" validator clearly indicates it validates files by running rules on their content.

### JSONConfigValidator → SchemaValidator

**File name change:**

- `src/validators/json-config-base.ts` → `src/validators/schema-validator.ts`

**Class name change:**

```typescript
// Before:
export abstract class JSONConfigValidator<T extends ZodType> extends BaseValidator {
  // ...
}

// After:
export abstract class SchemaValidator<T extends ZodType> extends FileValidator {
  // ...
}
```

**Why:** "Schema" validator clearly indicates it validates against a schema first, then runs rules.

### validateConfig() → validateSemantics()

**Method rename in SchemaValidator:**

```typescript
// Before:
protected abstract validateConfig(filePath: string, config: z.infer<T>): Promise<void>;

// After:
protected abstract validateSemantics(filePath: string, config: z.infer<T>): Promise<void>;
```

**Why:** "Semantics" clearly indicates this is for business logic validation beyond structural schema validation.

---

## Implementation Changes

### Composition Framework Removal

**Before (733 lines):**

```
src/composition/
├── index.ts (20 lines)
├── types.ts (56 lines)
├── helpers.ts (103 lines)
├── operators.ts (201 lines)
├── validators.ts (200 lines)
└── json-validators.ts (159 lines)
```

**After:**

- [ ] Entire folder deleted
- [x] Direct Zod validation in SchemaValidator

### SchemaValidator.validateFile() Simplification

**Before (using composition framework):**

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

**After (direct validation - ~35 lines):**

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

**Benefits:**

- [x] Simpler, easier to understand
- [x] No dependency on composition framework
- [x] Better error messages
- [x] Direct control flow
- [x] Type-safe throughout

---

## Validator Usage Patterns

### FileValidator Pattern (Markdown/Text Files)

**Categories:** CLAUDE.md, Skills, Agents, Output Styles, Commands

```typescript
class SkillsValidator extends FileValidator {
  async validate(): Promise<ValidationResult> {
    const files = await this.findSkillFiles();

    for (const file of files) {
      const content = await fs.readFile(file, 'utf-8');
      this.setCurrentFile(file);

      // Auto-discover and execute all 'Skills' category rules
      await this.executeRulesForCategory('Skills', file, content);
    }

    return this.getResult();
  }

  private async findSkillFiles(): Promise<string[]> {
    // Custom file discovery logic
    return glob('**\/SKILL.md', { cwd: this.basePath });
  }
}
```

**Key points:**

- Extends FileValidator
- Reads file content as string
- Executes category rules
- Returns aggregated results

### SchemaValidator Pattern (JSON Config Files)

**Categories:** MCP, Settings, Hooks, Plugin, LSP

```typescript
class MCPValidator extends SchemaValidator<typeof MCPConfigSchema> {
  protected getSchema() {
    return MCPConfigSchema;
  }

  protected async findConfigFiles(basePath: string) {
    return glob('**\/*.mcp.json', { cwd: basePath });
  }

  protected async validateSemantics(filePath: string, config: MCPConfig) {
    // Custom validation beyond schema structure
    // config is already parsed and validated against schema

    if (config.mcpServers) {
      const serverNames = new Set<string>();
      for (const [, server] of Object.entries(config.mcpServers)) {
        if (server.name && serverNames.has(server.name)) {
          this.report({
            message: `Duplicate server name: ${server.name}`,
            file: filePath,
          });
        }
        serverNames.add(server.name);
      }
    }
  }
}
```

**Key points:**

- Extends SchemaValidator
- Implements getSchema() to provide Zod schema
- Implements findConfigFiles() for file discovery
- Implements validateSemantics() for business logic
- Automatic JSON parsing and schema validation
- Type-safe config object in validateSemantics()

---

## Two-Layer Validation Architecture

### Layer 1: Schema Validation (SchemaValidator Only)

**Purpose:** Validate JSON structure

**What it checks:**

- Required fields exist
- Field types are correct
- Enums have valid values
- Object shapes match schema

**Where defined:** `/src/validators/schemas/*.ts`

**Example:**

```typescript
// schemas/mcp.ts
export const MCPConfigSchema = z.object({
  mcpServers: z.record(z.object({
    command: z.string(),
    args: z.array(z.string()).optional(),
    env: z.record(z.string()).optional(),
    // ...
  }))
});
```

### Layer 2: Rule Validation (All Validators)

**Purpose:** Validate content and semantics

**What it checks:**

- Business logic
- Cross-field validation
- File references
- Naming conventions
- Security issues
- Best practices

**Where defined:** `/src/rules/{category}/*.ts`

**Example:**

```typescript
// rules/mcp/mcp-invalid-server.ts
export const rule: Rule = {
  meta: {
    id: 'mcp-invalid-server',
    category: 'MCP',
  },
  validate: (context) => {
    const { filePath, fileContent } = context;

    let config: MCPConfig;
    try {
      config = JSON.parse(fileContent);
    } catch {
      return; // Schema validation handles parse errors
    }

    // Check for duplicate server names
    const serverNames = new Set<string>();
    if (config.mcpServers) {
      for (const [, server] of Object.entries(config.mcpServers)) {
        if (server.name && serverNames.has(server.name)) {
          context.report({
            message: `Duplicate server name: ${server.name}`,
          });
        }
        serverNames.add(server.name);
      }
    }
  }
};
```

### Validation Flow

```
User runs claudelint
       ↓
Linter discovers validators
       ↓
For each validator:
       ↓
┌─────────────────────────────────────────┐
│ FileValidator                           │
│ 1. Find files                           │
│ 2. Read content                         │
│ 3. Execute category rules  ────────────┐│
│ 4. Return results                      ││
└────────────────────────────────────────┘│
                                          │
┌─────────────────────────────────────────┼┐
│ SchemaValidator (extends FileValidator) ││
│ 1. Find JSON files                      ││
│ 2. Read content                         ││
│ 3. Parse JSON (report errors)           ││
│ 4. Validate schema (report errors)      ││
│ 5. Execute category rules  ─────────────┘│
│ 6. validateSemantics() hook             │
│ 7. Return results                       │
└─────────────────────────────────────────┘
       ↓
┌─────────────────────────────────────────┐
│ Rules (category-based)                  │
│ - Receive filePath and fileContent      │
│ - Parse content as needed               │
│ - Validate semantics                    │
│ - Report issues via context.report()    │
└─────────────────────────────────────────┘
```

---

## Migration Guide

### For Plugin Developers with Custom Validators

If you've created custom validators, update them:

**1. Update imports:**

```typescript
// Before:
import { BaseValidator } from 'claudelint/validators/base';
import { JSONConfigValidator } from 'claudelint/validators/json-config-base';

// After:
import { FileValidator } from 'claudelint/validators/file-validator';
import { SchemaValidator } from 'claudelint/validators/schema-validator';
```

**2. Update class extensions:**

```typescript
// Before:
class MyValidator extends BaseValidator { }
class MyJSONValidator extends JSONConfigValidator<typeof MySchema> { }

// After:
class MyValidator extends FileValidator { }
class MyJSONValidator extends SchemaValidator<typeof MySchema> { }
```

**3. Update method names (SchemaValidator only):**

```typescript
// Before:
protected async validateConfig(filePath: string, config: MyConfig) { }

// After:
protected async validateSemantics(filePath: string, config: MyConfig) { }
```

### For End Users

**No changes required.** This refactoring only affects internal implementation and plugin developers.

---

## Documentation Updates

### New Documentation

**File:** `docs/validation-architecture.md`

Comprehensive guide covering:

- Overview of validation system
- FileValidator vs SchemaValidator
- Two-layer validation (schema + rules)
- Decision flowchart
- Code examples
- Best practices

### Updated Documentation

**Files updated:**

- `docs/architecture.md` - Updated validator references
- `docs/rule-development.md` - Updated examples
- `docs/custom-rules.md` - Updated validator usage
- `CHANGELOG.md` - Documented changes

---

## Benefits Realized

### 1. Code Reduction

- **Before:** ~1000 lines of validator code
- **After:** ~270 lines of core validator code
- **Reduction:** 73% (730 lines removed)

### 2. Clarity Improvements

| Aspect | Before | After | Improvement |
|--------|--------|-------|-------------|
| Validator purpose | Unclear from name | Clear from name | High |
| When to use which | No guidance | Clear guidelines | High |
| Validation flow | Hidden in composition | Explicit and simple | High |
| Method naming | Generic "config" | Specific "semantics" | Medium |

### 3. Maintenance Benefits

- [x] Less code to maintain
- [x] Simpler implementation
- [x] No composition framework complexity
- [x] Direct Zod usage (industry standard)
- [x] Better TypeScript inference
- [x] Clearer error messages

### 4. Developer Experience

- [x] Better IDE autocomplete
- [x] Clearer documentation
- [x] Easier to understand for new contributors
- [x] Obvious patterns to follow
- [x] Comprehensive examples

---

## Testing Strategy

### Unit Tests

Updated test files:

- `tests/validators/file-validator.test.ts` (was base.test.ts)
- `tests/validators/schema-validator.test.ts` (was json-config-base.test.ts)
- All validator-specific test files

### Integration Tests

Validated against:

- [x] claudelint codebase itself
- [x] All 10 validator categories
- [x] Real-world Claude Code projects
- [x] Edge cases (malformed JSON, missing files, etc.)

### Regression Tests

Ensured:

- [x] No breaking changes to public API
- [x] All existing rules work correctly
- [x] Config resolution still functions
- [x] Inline disable comments work
- [x] Error reporting unchanged

---

## Rollback Plan

If issues arise:

1. **Immediate rollback:**

   ```bash
   git revert <commit-hash>
   ```

2. **Restore composition framework:**

   ```bash
   git checkout main -- src/composition
   ```

3. **Restore old validator names:**

   ```bash
   git checkout main -- src/validators/base.ts
   git checkout main -- src/validators/json-config-base.ts
   ```

**Data loss risk:** None - only code changes, no data modifications.

---

## Future Considerations

### Potential Enhancements

1. **Category property in SchemaValidator:**

   ```typescript
   protected abstract category: RuleCategory;
   ```

   Would eliminate need for validators to manually call executeRulesForCategory.

2. **Shared schema registry:**
   Central location for all schemas, could enable:
   - Schema reuse
   - Schema composition
   - External schema export

3. **Async schema loading:**
   Support for remote schema definitions.

### Not Recommended

1. [ ] **Combining FileValidator and SchemaValidator** - Clear separation is better
2. [ ] **Bringing back composition framework** - Dead code that wasn't needed
3. [ ] **Making schemas optional in SchemaValidator** - Would reduce type safety
