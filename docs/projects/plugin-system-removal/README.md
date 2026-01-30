# Plugin System Removal Project

**Status:** Planning Complete, Ready for Implementation
**Created:** 2026-01-30
**Owner:** Pat Dugan

## Quick Links

- [Project Plan](./PROJECT_PLAN.md) - Executive summary and phases
- [Task Tracker](./TASK_TRACKER.md) - Detailed task list (0/39 complete)
- [Architecture](./ARCHITECTURE.md) - Technical design and decisions
- [Files Inventory](./FILES_INVENTORY.md) - What to delete, keep, modify, create

## What This Project Does

Removes the unused third-party plugin system (PluginLoader) and replaces it with a simpler custom rules directory approach.

### Before (Complex)
```typescript
// Must create npm package: claudelint-plugin-myplugin
const plugin: ValidatorPlugin = {
  name: 'claudelint-plugin-myplugin',
  version: '1.0.0',
  register: (registry) => {
    registry.register({ id: 'validator' }, () => new MyValidator());
  }
};
```

### After (Simple)
```typescript
// Just create file: .claudelint/rules/my-rule.ts
export const rule: Rule = {
  meta: { id: 'my-rule', ... },
  validate: async (context) => { ... }
};
```

## Why We're Doing This

1. **Current plugin system is unused** - No third-party plugins exist
2. **Documentation is wrong** - Docs describe non-existent interface
3. **Too complex** - Requires understanding validators, not just rules
4. **ESLint does it better** - Simple rule-based plugins
5. **Custom rules are simpler** - Local files, no npm packaging

## What We're NOT Doing

- [x] Removing plugin.json validation (that's for Claude Code plugins)
- [x] Removing the 12 plugin/* rules
- [x] Removing validate-plugin skill
- [x] Breaking existing configs

## Project Phases

1. **Phase 1: Analysis & Documentation** (5 tasks)
   - Document current state
   - Design new architecture

2. **Phase 2: Delete Plugin System** (8 tasks)
   - Remove PluginLoader code
   - Remove tests and docs
   - Clean up references

3. **Phase 3: Implement Custom Rules** (9 tasks)
   - Create custom rule loader
   - Add tests
   - Integrate with CLI

4. **Phase 4: Update Documentation** (7 tasks)
   - Create custom-rules.md
   - Update README.md
   - Fix broken links

5. **Phase 5: Testing & Verification** (6 tasks)
   - Run all tests
   - Manual testing
   - Verify builds

6. **Phase 6: Cleanup & Polish** (4 tasks)
   - Final review
   - Lint and format
   - Project sign-off

**Total:** 39 discrete tasks

## How to Use This Project

### As the Implementer

1. Start with [TASK_TRACKER.md](./TASK_TRACKER.md)
2. Work through tasks in order
3. Check off tasks as you complete them
4. Update progress percentages
5. Document decisions in Notes section

### As a Reviewer

1. Check [PROJECT_PLAN.md](./PROJECT_PLAN.md) for overview
2. Review [ARCHITECTURE.md](./ARCHITECTURE.md) for design
3. Check [FILES_INVENTORY.md](./FILES_INVENTORY.md) for changes
4. Verify tasks in [TASK_TRACKER.md](./TASK_TRACKER.md)

## Success Criteria

- [ ] All 39 tasks completed
- [ ] All tests pass (100% coverage)
- [ ] Build succeeds
- [ ] Custom rules can be loaded
- [ ] Plugin validation still works
- [ ] Documentation is accurate

## Timeline

- **Estimated effort:** ~3 hours
- **Start date:** 2026-01-30
- **Target completion:** TBD

## Key Decisions

1. **Keep plugin.json validation** - Different system, still needed
2. **Use `.claudelint/rules/` directory** - Clear, conventional
3. **Auto-discover rule files** - Simplest for users
4. **Same Rule interface** - Consistent with built-in rules

## Questions or Issues

Add questions or blockers to [TASK_TRACKER.md](./TASK_TRACKER.md) in the Notes section.

## Project Structure

```
plugin-system-removal/
├── README.md                 # This file (project overview)
├── PROJECT_PLAN.md           # Executive summary and phases
├── TASK_TRACKER.md           # Detailed task list with checkboxes
├── ARCHITECTURE.md           # Technical design and decisions
└── FILES_INVENTORY.md        # Complete file change inventory
```

## Next Steps

1. Review all project documents
2. Ask clarifying questions
3. Start Phase 1, Task 1.1 in TASK_TRACKER.md
4. Update tracker as you progress

## Related Issues

- Original conversation analysis (2026-01-30)
- No GitHub issues (internal project)

## References

- ESLint Plugin Docs: https://eslint.org/docs/latest/extend/plugins
- Current rule system: `/src/rules/`
- Plugin validation: `/src/validators/plugin.ts`
