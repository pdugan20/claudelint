# Validation Composition Framework

A functional approach to building validators through composition of small, reusable validation primitives.

## Overview

The composition framework enables building complex validators by combining simple, focused validation functions. Instead of writing monolithic validators with duplicated logic, you compose validators from reusable building blocks.

## Core Concepts

### Composable Validator

A composable validator is a function that:

- Takes an input value and context
- Returns validation results (errors/warnings)
- Has no side effects
- Can be composed with other validators

```typescript
type ComposableValidator<T> = (
  value: T,
  context: ValidationContext
) => ValidationResult;
```

### ValidationContext

Context passed to validators containing:

- File path being validated
- Line number (if applicable)
- Parent validator options
- Shared state for cross-validator communication

```typescript
interface ValidationContext {
  filePath?: string;
  line?: number;
  options: BaseValidatorOptions;
  state?: Map<string, unknown>;
}
```

### ValidationResult

Result from a validator containing:

- Errors found
- Warnings found
- Valid flag

```typescript
interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}
```

## Composable Validators

### File System Validators

#### `fileExists`

Validates that a file exists at the given path.

```typescript
const fileExists: ComposableValidator<string> = async (path, context) => {
  const exists = await fileExists(path);
  if (!exists) {
    return error(`File not found: ${path}`);
  }
  return success();
};
```

#### `directoryExists`

Validates that a directory exists.

```typescript
const directoryExists: ComposableValidator<string> = async (path, context) => {
  // Implementation
};
```

### Schema Validators

#### `jsonSchema`

Validates a value against a Zod schema.

```typescript
const jsonSchema = <T extends z.ZodType>(schema: T): ComposableValidator<unknown> => {
  return (value, context) => {
    const result = schema.safeParse(value);
    if (!result.success) {
      return errorsFromZod(result.error);
    }
    return success();
  };
};
```

#### `objectShape`

Validates object has specific keys.

```typescript
const objectShape = (keys: string[]): ComposableValidator<object> => {
  return (value, context) => {
    // Check object has required keys
  };
};
```

### String Validators

#### `regex`

Validates string matches a regex pattern.

```typescript
const regex = (pattern: RegExp, message: string): ComposableValidator<string> => {
  return (value, context) => {
    if (!pattern.test(value)) {
      return error(message);
    }
    return success();
  };
};
```

#### `minLength`

Validates string minimum length.

```typescript
const minLength = (min: number): ComposableValidator<string> => {
  return (value, context) => {
    if (value.length < min) {
      return error(`Must be at least ${min} characters`);
    }
    return success();
  };
};
```

#### `maxLength`

Validates string maximum length.

### Array Validators

#### `arrayOf`

Validates all items in an array.

```typescript
const arrayOf = <T>(itemValidator: ComposableValidator<T>): ComposableValidator<T[]> => {
  return async (values, context) => {
    const results = await Promise.all(
      values.map((item, index) =>
        itemValidator(item, { ...context, index })
      )
    );
    return mergeResults(results);
  };
};
```

#### `arrayLength`

Validates array length constraints.

```typescript
const arrayLength = (min?: number, max?: number): ComposableValidator<unknown[]> => {
  return (values, context) => {
    // Implementation
  };
};
```

### Value Validators

#### `required`

Validates value is not null/undefined.

```typescript
const required = <T>(): ComposableValidator<T | null | undefined> => {
  return (value, context) => {
    if (value == null) {
      return error('Value is required');
    }
    return success();
  };
};
```

#### `oneOf`

Validates value is one of allowed values.

```typescript
const oneOf = <T>(allowed: T[]): ComposableValidator<T> => {
  return (value, context) => {
    if (!allowed.includes(value)) {
      return error(`Must be one of: ${allowed.join(', ')}`);
    }
    return success();
  };
};
```

## Composition Operators

### `compose`

Chains validators in sequence, stopping at first error.

```typescript
const compose = <T>(...validators: ComposableValidator<T>[]): ComposableValidator<T> => {
  return async (value, context) => {
    for (const validator of validators) {
      const result = await validator(value, context);
      if (!result.valid) {
        return result;
      }
    }
    return success();
  };
};

// Usage
const validateSkillName = compose(
  required(),
  minLength(3),
  maxLength(64),
  regex(/^[a-z0-9-]+$/, 'Must be lowercase with hyphens')
);
```

### `optional`

Makes a validator optional (skip if value is null/undefined).

```typescript
const optional = <T>(validator: ComposableValidator<T>): ComposableValidator<T | null | undefined> => {
  return async (value, context) => {
    if (value == null) {
      return success();
    }
    return validator(value, context);
  };
};

// Usage
const validateOptionalEmail = optional(
  regex(/^.+@.+\..+$/, 'Invalid email format')
);
```

### `conditional`

Conditionally applies validator based on predicate.

```typescript
const conditional = <T>(
  predicate: (value: T, context: ValidationContext) => boolean,
  validator: ComposableValidator<T>
): ComposableValidator<T> => {
  return async (value, context) => {
    if (predicate(value, context)) {
      return validator(value, context);
    }
    return success();
  };
};

// Usage
const validateIfProduction = conditional(
  (_, ctx) => ctx.options.config?.env === 'production',
  minLength(10)
);
```

### `all`

All validators must pass (accumulates all errors).

```typescript
const all = <T>(...validators: ComposableValidator<T>[]): ComposableValidator<T> => {
  return async (value, context) => {
    const results = await Promise.all(
      validators.map(v => v(value, context))
    );
    return mergeResults(results);
  };
};

// Usage
const validateConfig = all(
  hasRequiredFields(['name', 'version']),
  hasValidVersion,
  hasValidDependencies
);
```

### `any`

At least one validator must pass.

```typescript
const any = <T>(...validators: ComposableValidator<T>[]): ComposableValidator<T> => {
  return async (value, context) => {
    const results = await Promise.all(
      validators.map(v => v(value, context))
    );

    if (results.some(r => r.valid)) {
      return success();
    }

    return error('None of the validation rules passed');
  };
};

// Usage
const validatePathType = any(
  fileExists,
  directoryExists
);
```

## Practical Examples

### Example 1: SKILL.md Frontmatter Validation

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

### Example 2: Settings.json Validation

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

### Example 3: Conditional Validation

```typescript
const validateImportPath = conditional(
  (path) => path.startsWith('@'),
  compose(
    fileExists,
    hasValidMarkdown
  )
);
```

## Benefits

### 1. Reusability

Validators are pure functions that can be reused across different contexts.

### 2. Testability

Each validator is independently testable with simple inputs/outputs.

### 3. Composability

Complex validation logic is built from simple, understandable pieces.

### 4. Type Safety

Full TypeScript type inference through composition.

### 5. Maintainability

Changes to validation rules are localized to specific validators.

### 6. Reduced Duplication

Common validation patterns written once, used everywhere.

## Migration Path

### Before (Monolithic)

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
    // ... 50 more lines
  }
}
```

### After (Composable)

```typescript
const validateFrontmatter = objectValidator({
  name: compose(required(), minLength(3), maxLength(64)),
  description: compose(required(), minLength(20)),
  // Clear, declarative validation
});

class SkillsValidator extends BaseValidator {
  private async validateFrontmatter(fm: any, filePath: string) {
    const result = await validateFrontmatter(fm, {
      filePath,
      options: this.options
    });

    this.errors.push(...result.errors);
    this.warnings.push(...result.warnings);
  }
}
```

## Implementation Notes

### Phase 3 Tasks

1. **Task #11**: Design framework (this document)
2. **Task #12**: Refactor JSONConfigValidator to use composition
3. **Task #13**: Create plugin system using composable validators

### Performance Considerations

- Validators are async to support I/O operations
- Results can be cached for repeated validations
- Composition operators can short-circuit for efficiency

### Error Context

Validators automatically inherit context (file path, line number) from composition chain.

### Future Extensions

- Custom validators from plugins
- Validation middleware/hooks
- Parallel validation execution
- Validation result caching
- AI-powered validation suggestions

## References

- Functional Programming: [FP Validation Patterns](https://fsharpforfunandprofit.com/posts/recipe-part2/)
- Railway Oriented Programming: Error handling through composition
- Zod: Type-safe schema validation
- io-ts: Runtime type validation
