# Future Work

## Plugin System Modernization (Future Phase 6)

**Issue**: Plugin system was designed for pre-Phase 5 validator-centric architecture.

**Current State**:
- Plugins export validators with `register()` ceremony
- Validators create rules internally
- Complex indirection

**Desired State (ESLint-style)**:
- Plugins export rules directly
- Simple object structure: `{ meta, rules, configs }`
- Users configure: `pluginname/rule-id`

**References**:
- [ESLint Plugin Docs](https://eslint.org/docs/latest/extend/plugins)
- `src/utils/plugin-loader.ts` - Current implementation
- `docs/plugin-development.md` - Needs rewrite

**Action**: Defer until core documentation and rule implementation complete.

---

## Other Future Enhancements

### Rule Implementation
- 178 remaining rules planned in `docs/projects/rule-implementation/RULE-TRACKER.md`
- Focus on high-value rules first

### Documentation
- [DONE] `docs/plugin-development.md` - Rewritten for Phase 5 architecture
- [DONE] `docs/validator-development-guide.md` - Archived with redirect to `contributing-rules.md`
- Add architecture diagrams showing rule-based system

### Tooling
- Rule linting (validate rules follow standards)
- Auto-fix improvements
- Performance optimizations
