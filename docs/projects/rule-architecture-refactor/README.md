# Rule Architecture Refactor Project

**Status**: Planning
**Priority**: HIGH (Blocks 177 remaining rule implementations)
**Estimated Duration**: 2-3 days
**Owner**: Architecture Team

## Problem Statement

The current rule registration system doesn't scale:

- **Manual registration required**: Every rule needs manual entries in `rule-ids.ts` and `rules/index.ts`
- **Metadata duplication**: Rule metadata exists in 3 places (type definitions, registry, docs)
- **Can't scale to 300+ rules**: We have 248 remaining rules - manual registration will create 3000+ line files
- **Hard to contribute**: Contributors must update multiple files in perfect sync
- **No auto-discovery**: Can't load rules dynamically from filesystem

## Current Architecture

```
src/
  rules/
    rule-ids.ts          # Manual type definitions (42 rules = 150 lines)
    index.ts             # Manual RuleRegistry.register() calls (42 rules = 300 lines)
  validators/
    claude-md.ts         # Rule logic lives in validator methods
    skills.ts
    ...
```

**With 300 rules, this becomes:**
- `rule-ids.ts`: ~1000 lines
- `rules/index.ts`: ~2500 lines
- Completely unmaintainable

## Target Architecture

```
src/
  rules/
    claude-md/
      size-error.ts      # Rule metadata + validation logic
      size-warning.ts
      import-circular.ts
      ...
    skills/
      missing-shebang.ts
      dangerous-command.ts
      ...
  utils/
    rule-loader.ts       # Auto-discovers rules from filesystem
```

**Benefits:**
- **Single source of truth**: Each rule file contains metadata + logic
- **Auto-discovery**: Scan filesystem, build registry automatically
- **Easy to contribute**: Add one file, everything just works
- **Better testing**: Import one rule, test it in isolation
- **Plugin-friendly**: Plugins can drop in rule files
- **Type-safe**: Generate `RuleId` type from discovered rules

## Project Goals

1. **Eliminate manual registration** - Auto-discover rules from filesystem
2. **Reduce duplication** - One file per rule with all metadata
3. **Maintain compatibility** - Existing tests/validators keep working
4. **Enable scaling** - Support 300+ rules without maintenance burden
5. **Improve DX** - Contributors add one file, done

## Scope

### In Scope

- Design new rule file format
- Implement rule loader/auto-discovery
- Migrate 42 existing rules to new format
- Update validator base class to use new system
- Update all tests
- Generate `RuleId` type at build time

### Out of Scope

- Implementing new rules (happens after refactor)
- Changing validation logic (only moving code)
- Configuration system changes (already being done)
- Documentation format changes (keep markdown docs)

## Success Criteria

- [ ] Zero manual registration required for new rules
- [ ] `rule-ids.ts` and `rules/index.ts` deleted or auto-generated
- [ ] All 42 existing rules migrated to new format
- [ ] All tests pass without changes
- [ ] Contributors can add rules with one file
- [ ] Build time < 5s for rule discovery
- [ ] Documentation updated

## Timeline

**Week 1:**
- Days 1-2: Finish Config Integration (current work)
- Days 3-5: Rule Architecture Refactor (this project)

**Week 2+:**
- Implement 177 remaining rules using new architecture

## Documents

- **PROPOSAL.md** - Detailed design comparison (current vs ESLint vs hybrid)
- **IMPLEMENTATION-PLAN.md** - Phases, tasks, and tracker
- **MIGRATION-GUIDE.md** - How to migrate existing rules and add new ones

## Related Work

- **Config Integration**: `docs/projects/rule-implementation/IMPLEMENTATION-CHECKLIST.md` (Task #4)
- **Rule Implementation**: `docs/projects/rule-implementation/` (blocked by this refactor)

## References

- ESLint rule architecture: https://eslint.org/docs/latest/extend/custom-rules
- Our architecture doc: `docs/architecture.md`
- Rule registry: `src/utils/rule-registry.ts`
