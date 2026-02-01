# Quick Reference Card

One-page summary of the validator refactoring changes.

## What Changed

| Before | After | Why |
|--------|-------|-----|
| `BaseValidator` | `FileValidator` | Clearer name - validates files |
| `JSONConfigValidator` | `SchemaValidator` | Clearer name - validates with schemas |
| `validateConfig()` | `validateSemantics()` | Clearer purpose - semantic validation |
| Composition framework (733 lines) | Deleted | Unused code removed |

## File Renames

```
src/validators/base.ts → src/validators/file-validator.ts
src/validators/json-config-base.ts → src/validators/schema-validator.ts
src/composition/ → DELETED
```

## Import Changes

```typescript
// OLD
import { BaseValidator } from './validators/base';
import { JSONConfigValidator } from './validators/json-config-base';

// NEW
import { FileValidator } from './validators/file-validator';
import { SchemaValidator } from './validators/schema-validator';
```

## When to Use Which Validator

```
Is the file JSON?
  └─ No → Use FileValidator
       Examples: CLAUDE.md, Skills, Agents
  └─ Yes → Does it have a Zod schema?
       └─ No → Use FileValidator
       └─ Yes → Use SchemaValidator
            Examples: MCP, Settings, Hooks, Plugin, LSP
```

## FileValidator Pattern

```typescript
class MyValidator extends FileValidator {
  async validate(): Promise<ValidationResult> {
    const files = await this.findFiles();

    for (const file of files) {
      const content = await fs.readFile(file, 'utf-8');
      this.setCurrentFile(file);

      // Auto-executes all rules for category
      await this.executeRulesForCategory('MyCategory', file, content);
    }

    return this.getResult();
  }
}
```

## SchemaValidator Pattern

```typescript
class MyValidator extends SchemaValidator<typeof MySchema> {
  protected getSchema() {
    return MySchema;
  }

  protected async findConfigFiles(basePath: string) {
    return glob('**/*.config.json', { cwd: basePath });
  }

  protected async validateSemantics(filePath: string, config: MyConfig) {
    // Custom validation beyond schema
    // config is already parsed and validated
  }
}
```

## Testing Commands

```bash
# Run all tests
npm test

# Build
npm run build

# Lint
npm run lint

# Type check
npm run type-check

# Test on claudelint itself
npm run claudelint .
```

## Common Gotchas

1. **Don't forget to update imports** - TypeScript will catch this
2. **Rename validateConfig → validateSemantics** in SchemaValidator subclasses
3. **executeRulesForCategory auto-discovers rules** - don't import them manually
4. **SchemaValidator already parses JSON** - don't parse again in validateSemantics

## Quick Migration Checklist

For plugin developers with custom validators:

- [ ] Update imports (BaseValidator → FileValidator)
- [ ] Update imports (JSONConfigValidator → SchemaValidator)
- [ ] Update extends clause
- [ ] Rename validateConfig → validateSemantics (SchemaValidator only)
- [ ] Test your validator
- [ ] Update any documentation

## File Locations

| Document | Purpose |
|----------|---------|
| [README.md](./README.md) | Project overview |
| [TRACKER.md](./TRACKER.md) | Task tracking (update as you go!) |
| [IMPLEMENTATION-GUIDE.md](./IMPLEMENTATION-GUIDE.md) | Detailed implementation steps |
| [ARCHITECTURE-CHANGES.md](./ARCHITECTURE-CHANGES.md) | Before/after comparison |
| [MIGRATION-NOTES.md](./MIGRATION-NOTES.md) | Track deviations and decisions |
| [TESTING-PLAN.md](./TESTING-PLAN.md) | Testing strategy |
| [QUICK-REFERENCE.md](./QUICK-REFERENCE.md) | This document |

## Key Metrics

- **Lines removed:** ~733 (composition framework)
- **Files deleted:** 6 (composition framework)
- **Files renamed:** 2 (validators)
- **Validators updated:** 10
- **Tests affected:** All validator tests
- **Breaking changes:** Internal API only (plugin developers)
- **User impact:** None (internal refactoring)

## Success Criteria

[x] All 38 tasks in TRACKER.md complete
[x] 733+ lines removed
[x] All tests passing
[x] Documentation complete
[x] No breaking changes for end users

## Quick Start

1. Read [README.md](./README.md)
2. Review [TRACKER.md](./TRACKER.md)
3. Follow [IMPLEMENTATION-GUIDE.md](./IMPLEMENTATION-GUIDE.md)
4. Mark tasks complete in TRACKER.md
5. Document deviations in MIGRATION-NOTES.md
6. Test using [TESTING-PLAN.md](./TESTING-PLAN.md)
7. Celebrate! 
