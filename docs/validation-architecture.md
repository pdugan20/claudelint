# Validation Architecture

This document describes the architecture of claudelint's validation system, explaining how validators work, when to use each type, and how to create new validators.

## Table of Contents

- [Overview](#overview)
- [Validator Types](#validator-types)
- [Two-Layer Validation](#two-layer-validation)
- [Decision Guide](#decision-guide)
- [Creating Validators](#creating-validators)
- [Best Practices](#best-practices)

## Overview

Claudelint uses a **two-validator architecture** to handle different file types:

1. **FileValidator** - For text and markdown files (CLAUDE.md, SKILL.md, etc.)
2. **SchemaValidator** - For JSON configuration files (mcp.json, settings.json, etc.)

Both validators extend from the same base class, sharing common functionality for issue reporting, config resolution, and rule execution.

### Key Components

- **Rule Registry** - Central registry of all validation rules organized by category
- **Config Resolver** - Resolves rule configuration and severity overrides
- **Issue Collection** - Aggregates errors and warnings from multiple sources
- **Category-Based Execution** - Automatically discovers and runs rules by category

## Validator Types

### FileValidator

**Purpose:** Validates text and markdown files with flexible, rule-based validation.

**Used For:**

- CLAUDE.md files
- SKILL.md files (skill definitions)
- AGENT.md files (agent definitions)
- OUTPUT_STYLE.md files (output style definitions)
- Shell scripts (skill implementation files)

**Features:**

- Inline disable comment support (`claudelint-disable`, `claudelint-disable-next-line`)
- Category-based rule execution
- Optional frontmatter validation with Zod schemas
- Flexible content validation

**Architecture:**

```
FileValidator
├── Read file content
├── Parse inline disable comments
├── Validate frontmatter (optional, schema-based)
├── Execute category rules
└── Return aggregated results
```

**Example:**

```typescript
class SkillsValidator extends FileValidator {
  async validate(): Promise<ValidationResult> {
    const skillDirs = await findSkillDirectories(this.basePath);

    for (const skillDir of skillDirs) {
      const skillMdPath = join(skillDir, 'SKILL.md');
      const content = await readFileContent(skillMdPath);

      // Parse disable comments
      this.parseDisableComments(skillMdPath, content);

      // Validate frontmatter
      this.validateFrontmatter(skillMdPath, content);

      // Execute ALL Skills rules via category-based discovery
      await this.executeRulesForCategory('Skills', skillMdPath, content);
    }

    return this.getResult();
  }
}
```

### SchemaValidator

**Purpose:** Validates JSON configuration files with strict schema validation followed by semantic rules.

**Used For:**

- MCP server configurations (mcp.json)
- Settings files (settings.json)
- Hook configurations (hooks.json)
- Plugin manifests (plugin.json)
- LSP configurations (lsp.json)

**Features:**

- Automatic JSON parsing with error reporting
- Zod schema validation (non-configurable)
- Semantic validation with rules (configurable)
- Type-safe config access after validation

**Architecture:**

```
SchemaValidator
├── Read file content
├── Parse JSON (report syntax errors)
├── Validate against Zod schema (report structure errors)
├── Execute category rules (semantic validation)
└── Return aggregated results
```

**Example:**

```typescript
class MCPValidator extends SchemaValidator<typeof MCPConfigSchema> {
  protected findConfigFiles(basePath: string): Promise<string[]> {
    return findMcpFiles(basePath);
  }

  protected getSchema(): typeof MCPConfigSchema {
    return MCPConfigSchema;
  }

  protected async validateSemantics(
    filePath: string,
    config: z.infer<typeof MCPConfigSchema>
  ): Promise<void> {
    const content = await readFileContent(filePath);

    // Execute ALL MCP rules via category-based discovery
    await this.executeRulesForCategory('MCP', filePath, content);
  }
}
```

## Two-Layer Validation

SchemaValidator provides two distinct validation layers:

### Layer 1: Schema Validation (Structure)

**Purpose:** Validate JSON structure and types against Zod schema

**Characteristics:**

- Non-configurable (always runs)
- Reports structural errors (missing fields, wrong types, invalid formats)
- Stops validation if schema fails
- Fast and deterministic

**Example Errors:**

- "Missing required field: name"
- "Expected string, got number"
- "Invalid URL format"

### Layer 2: Semantic Validation (Business Logic)

**Purpose:** Validate business rules, relationships, and best practices

**Characteristics:**

- Configurable (respects .claudelintrc.json)
- Reports semantic issues (broken references, deprecated usage, security issues)
- Runs after schema passes
- Can be disabled per-rule

**Example Errors:**

- "Referenced file not found: ./script.sh"
- "Environment variable \${INVALID} contains special characters"
- "Command not found in PATH: /usr/bin/foo"

**Why Two Layers?**

This separation provides:

1. **Clear failure modes** - Structure errors vs business logic errors
2. **Configurability** - Schema always enforced, rules can be customized
3. **Type safety** - Semantic validation receives typed, validated config
4. **Performance** - No point validating semantics if structure is invalid

## Decision Guide

### When to Use FileValidator

Choose FileValidator if:

- [YES] File is text or markdown format
- [YES] Content is human-written documentation
- [YES] Validation is primarily rule-based
- [YES] Structure is flexible (optional frontmatter, free-form content)
- [YES] File may contain inline disable comments

**Examples:** CLAUDE.md, SKILL.md, AGENT.md, OUTPUT_STYLE.md

### When to Use SchemaValidator

Choose SchemaValidator if:

- [YES] File is JSON format
- [YES] Structure is strictly defined
- [YES] Type validation is critical
- [YES] Need two-layer validation (structure + semantics)
- [YES] Machine-generated or machine-parsed content

**Examples:** mcp.json, settings.json, hooks.json, plugin.json, lsp.json

### Decision Flowchart

```
Is the file JSON?
├─ Yes → Use SchemaValidator
│         ├─ Define Zod schema
│         ├─ Implement findConfigFiles()
│         └─ Implement validateSemantics()
│
└─ No → Use FileValidator
          ├─ Implement validate()
          ├─ Parse disable comments
          └─ Execute category rules
```

## Creating Validators

### Creating a FileValidator

**Steps:**

1. Create validator class extending FileValidator
2. Implement `validate()` method
3. Find files to validate
4. For each file:
   - Read content
   - Parse disable comments
   - Execute category rules
5. Return aggregated results
6. Register with ValidatorRegistry

**Template:**

```typescript
import { FileValidator, ValidationResult, BaseValidatorOptions } from './file-validator';
import { ValidatorRegistry } from '../utils/validators/factory';

export class MyValidator extends FileValidator {
  private basePath: string;

  constructor(options: BaseValidatorOptions = {}) {
    super(options);
    this.basePath = options.path || process.cwd();
  }

  async validate(): Promise<ValidationResult> {
    const files = await this.findFiles();

    for (const file of files) {
      const content = await readFileContent(file);

      // Set context for config resolution
      this.setCurrentFile(file);

      // Parse disable comments
      this.parseDisableComments(file, content);

      // Execute rules
      await this.executeRulesForCategory('MyCategory', file, content);
    }

    return this.getResult();
  }

  private async findFiles(): Promise<string[]> {
    // Find files to validate
  }
}

// Register with factory
ValidatorRegistry.register(
  {
    id: 'my-validator',
    name: 'My Validator',
    description: 'Validates my files',
    filePatterns: ['**/MY_FILE.md'],
    enabled: true,
  },
  (options) => new MyValidator(options)
);
```

### Creating a SchemaValidator

**Steps:**

1. Create Zod schema for JSON structure
2. Create validator class extending SchemaValidator
3. Implement three abstract methods:
   - `findConfigFiles()` - Find JSON files
   - `getSchema()` - Return Zod schema
   - `validateSemantics()` - Execute rules and custom validation
4. Register with ValidatorRegistry

**Template:**

```typescript
import { SchemaValidator, SchemaValidatorOptions } from './schema-validator';
import { z } from 'zod';
import { ValidatorRegistry } from '../utils/validators/factory';

// Define schema
const MyConfigSchema = z.object({
  name: z.string(),
  version: z.string(),
  // ... other fields
});

export class MyConfigValidator extends SchemaValidator<typeof MyConfigSchema> {
  protected findConfigFiles(basePath: string): Promise<string[]> {
    return findMyConfigFiles(basePath);
  }

  protected getSchema(): typeof MyConfigSchema {
    return MyConfigSchema;
  }

  protected async validateSemantics(
    filePath: string,
    config: z.infer<typeof MyConfigSchema>
  ): Promise<void> {
    const content = await readFileContent(filePath);

    // Execute category rules
    await this.executeRulesForCategory('MyConfig', filePath, content);

    // Custom validation
    if (config.someField) {
      this.report('Issue message', filePath, undefined, 'my-rule-id');
    }
  }
}

// Register with factory
ValidatorRegistry.register(
  {
    id: 'my-config',
    name: 'My Config Validator',
    description: 'Validates my config files',
    filePatterns: ['**/myconfig.json'],
    enabled: true,
  },
  (options) => new MyConfigValidator(options)
);
```

## Best Practices

### General Guidelines

1. **Use category-based rule execution** - Call `executeRulesForCategory()` instead of importing rules manually
2. **Report issues, don't throw** - Use `this.report()` for validation issues, throw only for operational errors
3. **Set current file context** - Call `this.setCurrentFile()` before checking rule options or enabled status
4. **Parse disable comments** - Always call `parseDisableComments()` for text files
5. **Return aggregated results** - Always end with `return this.getResult()`

### FileValidator Patterns

**[YES] Good:**

```typescript
async validate(): Promise<ValidationResult> {
  const files = await this.findFiles();

  for (const file of files) {
    const content = await readFileContent(file);
    this.parseDisableComments(file, content);
    await this.executeRulesForCategory('Category', file, content);
  }

  return this.getResult();
}
```

**[NO] Bad:**

```typescript
async validate(): Promise<ValidationResult> {
  const files = await this.findFiles();

  for (const file of files) {
    const content = await readFileContent(file);
    // Missing parseDisableComments - inline disables won't work
    // Manual rule imports instead of category-based execution
    const rule = new MyRule();
    await rule.validate({ filePath: file, fileContent: content });
  }

  return this.getResult();
}
```

### SchemaValidator Patterns

**[YES] Good:**

```typescript
protected async validateSemantics(
  filePath: string,
  config: ConfigType
): Promise<void> {
  const content = await readFileContent(filePath);

  // Execute rules first (configurable)
  await this.executeRulesForCategory('Category', filePath, content);

  // Then custom validation (always runs)
  if (config.reference && !existsSync(config.reference)) {
    this.report('Referenced file not found', filePath, undefined, 'rule-id');
  }
}
```

**[NO] Bad:**

```typescript
protected async validateSemantics(
  filePath: string,
  config: ConfigType
): Promise<void> {
  // Don't throw for validation issues
  if (!config.name) {
    throw new Error('Name required'); // [NO] This is schema's job
  }

  // Don't skip category rules
  // Missing: await this.executeRulesForCategory(...)
}
```

### Rule Reporting

**[YES] Good:**

```typescript
// Always provide ruleId for configurable rules
this.report('Issue message', filePath, lineNumber, 'my-rule-id');

// With additional context
this.report('Issue message', filePath, lineNumber, 'my-rule-id', {
  fix: 'How to fix this',
  explanation: 'Why this is a problem',
  howToFix: 'Step-by-step instructions',
});
```

**[NO] Bad:**

```typescript
// Missing ruleId - can't be configured or disabled
this.report('Issue message', filePath);

// Using defaultSeverity in new code - only for backwards compatibility
this.report('Issue message', filePath, undefined, undefined, {
  defaultSeverity: 'error', // [NO] Use ruleId instead
});
```

### Error Handling

**[YES] Good:**

```typescript
async validate(): Promise<ValidationResult> {
  try {
    const files = await this.findFiles();
    // ... validation logic
    return this.getResult();
  } catch (error) {
    // Operational errors (file not found, permission denied) are thrown
    throw new Error(`Validation failed: ${error.message}`);
  }
}
```

**[NO] Bad:**

```typescript
async validate(): Promise<ValidationResult> {
  const files = await this.findFiles();

  for (const file of files) {
    try {
      // ... validation logic
    } catch (error) {
      // [NO] Don't swallow errors silently
      return this.getResult();
    }
  }

  return this.getResult();
}
```

## Summary

- **FileValidator** - Text/markdown files with flexible validation
- **SchemaValidator** - JSON configs with schema + semantic validation
- **Two layers** - Structure (schema) + business logic (rules)
- **Category-based** - Rules auto-discovered by category
- **Configurable** - Rules respect .claudelintrc.json settings
- **Consistent** - All validators follow same patterns

For more details, see:

- [Rule Development Guide](./rule-development.md)
- [Custom Rules Guide](./custom-rules.md)
- [Architecture Overview](./architecture.md)
