# Plugin System Removal & Custom Rules Implementation

**Project Status:** Planning
**Started:** 2026-01-30
**Target Completion:** TBD

## Executive Summary

Remove the third-party plugin system (PluginLoader) and replace it with a simpler custom rules directory approach. This aligns with ESLint's philosophy while reducing complexity and making it easier for developers to extend claudelint.

## Objectives

1. Delete unused third-party plugin infrastructure
2. Keep Claude Code plugin validation (different system)
3. Implement simple custom rules loading from `.claudelint/rules/`
4. Update all documentation
5. Maintain 100% test coverage

## Non-Goals

- We are NOT removing plugin.json validation (that's for Claude Code plugins)
- We are NOT removing the 12 plugin/* rules
- We are NOT removing the validate-plugin skill

## Architecture Decision

### Current System (Complex)
```typescript
// Plugin must implement ValidatorPlugin interface
const plugin: ValidatorPlugin = {
  name: 'claudelint-plugin-myplugin',
  version: '1.0.0',
  register: (registry) => {
    registry.register({ id: 'validator' }, () => new MyValidator());
  }
};
```

### New System (Simple)
```typescript
// User just writes a rule file
// .claudelint/rules/my-rule.ts
export const rule: Rule = {
  meta: { id: 'my-rule', ... },
  validate: async (context) => { ... }
};
```

## Project Phases

### Phase 1: Analysis & Documentation [x]
Track detailed analysis of what to delete and what to keep.

### Phase 2: Delete Plugin System Infrastructure
Remove all third-party plugin loading code.

### Phase 3: Implement Custom Rules Loading
Add simple custom rules directory support.

### Phase 4: Update Documentation
Fix all docs to reflect new architecture.

### Phase 5: Testing & Verification
Ensure everything works and tests pass.

### Phase 6: Cleanup & Polish
Final checks and project closure.

## Success Criteria

- [ ] All PluginLoader code deleted
- [ ] Plugin validation (for Claude Code) still works
- [ ] Custom rules can be loaded from `.claudelint/rules/`
- [ ] All tests pass with 100% coverage
- [ ] Documentation is accurate and complete
- [ ] No breaking changes to plugin.json validation
- [ ] Build and CLI work correctly

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Break plugin.json validation | High | Keep all plugin validator code, test thoroughly |
| Break existing configs | Medium | Test with real claudelint projects |
| Documentation confusion | Medium | Clear separation in docs between systems |
| Test coverage drops | Low | Write tests before deleting code |

## Rollback Plan

If issues arise:
1. Git revert the changes
2. All code is in version control
3. No npm packages depend on PluginLoader (not published API)

## Timeline Estimate

- Phase 1: 15 minutes (completed)
- Phase 2: 30 minutes
- Phase 3: 1 hour
- Phase 4: 45 minutes
- Phase 5: 30 minutes
- Phase 6: 15 minutes

**Total:** ~3 hours of work

## References

- ESLint Plugin Architecture: https://eslint.org/docs/latest/extend/plugins
- Current rule system: `src/rules/`
- Plugin validation: `src/validators/plugin.ts`
