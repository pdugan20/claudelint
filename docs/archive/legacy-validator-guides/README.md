# Legacy Validator Guides (ARCHIVED)

**Status:** ARCHIVED - These documents are outdated and preserved for historical reference only.

## Why These Are Archived

These documents teach the **old validator-centric architecture** from before Phase 5 (January 2026). claudelint has since migrated to an **ESLint-style rule-based architecture**.

### What Changed in Phase 5

**Before (Validator-Centric):**
- Contributors extended `BaseValidator` classes
- Validators were the primary extension mechanism
- Heavy composition patterns required
- Plugin system exported validators

**After (Rule-Based):**
- Contributors write individual rules in `src/rules/{category}/{rule-id}.ts`
- Rules are simple, focused validation checks
- Validators are internal orchestrators (implementation detail)
- Plugin system exports rules (ESLint-style)

## For Current Contributors

**DO NOT** follow the patterns in these archived documents. Instead, see:

- **[contributing-rules.md](../../contributing-rules.md)** - How to write validation rules (PRIMARY GUIDE)
- **[architecture.md](../../architecture.md)** - Current system architecture
- **[plugin-development.md](../../plugin-development.md)** - Modern plugin development

## Archived Documents

- **validator-development-guide.md** - How to write validators (old architecture)
- **composition-framework.md** - Validator composition patterns (old architecture)

These documents are preserved for:
- Historical context
- Understanding the Phase 5 migration
- Reference when maintaining legacy code

## Migration Resources

See [docs/archive/rule-architecture-refactor/](../rule-architecture-refactor/) for Phase 5 migration documentation.
