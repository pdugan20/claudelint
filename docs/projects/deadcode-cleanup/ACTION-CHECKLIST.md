# Deadcode Cleanup Action Checklist

## Immediate Actions (Safe to Do Now)

### 1. Remove Orphaned Build Artifacts

```bash
# Clean and rebuild
npm run clean
npm run build

# The following files will be automatically removed:
# - dist/cli-hooks.* (4 files)
# - dist/utils/validators/security-validators.* (4 files)

# Verify everything works
npm test
npm run claudelint -- check-all

# Commit
git add dist/
git commit -m "chore: remove orphaned build artifacts"
```

**Time**: 10 minutes
**Risk**: None (regenerated files)
**Impact**: Cleaner dist/ directory

---

## Investigation Tasks (Needs Research)

### 2. Check Deprecated Method Usage

```bash
# Search for isRuleDisabled calls (deprecated method)
grep -rn "\.isRuleDisabled(" src/ tests/

# Expected: Only the deprecated method itself (wrapper)
# If other calls found, they need updating to isRuleDisabledByComment
```

**Questions**:
- [ ] Any internal callers found?
- [ ] Any external plugin usage?
- [ ] Safe to remove in next version?

### 3. Check Deprecated Type Usage

```bash
# Search for ValidatorOptions usage (deprecated type)
grep -rn "ValidatorOptions" src/ tests/ examples/

# Check what's using it
# Check if external plugins might use it
```

**Questions**:
- [ ] Used internally?
- [ ] Used by external plugins?
- [ ] Remove now or wait for v2.0.0?

### 4. Review Utility Script Usage

```bash
# Check git history for fix-markdown.js
git log --oneline --all -- scripts/fix-markdown.js | head -20

# Check git history for remove-emojis.js
git log --oneline --all -- scripts/remove-emojis.js | head -20

# Check when they were last executed
ls -la scripts/*.js
```

**Questions**:
- [ ] Used in last 2 months?
- [ ] Anyone on team using manually?
- [ ] Can markdownlint --fix replace fix-markdown.js?
- [ ] Was remove-emojis.js a one-time cleanup?

---

## Conditional Actions (Based on Investigation)

### 5. Remove Deprecated Method (If No Callers Found)

Edit `src/validators/base.ts`:

```typescript
// REMOVE THIS METHOD (lines ~285-289):
/**
 * @deprecated Internal method renamed to isRuleDisabledByComment for clarity
 */
protected isRuleDisabled(file?: string, line?: number, ruleId?: RuleId): boolean {
  return this.isRuleDisabledByComment(file, line, ruleId);
}
```

**Commands**:

```bash
# After editing
npm test
git commit -m "refactor: remove deprecated isRuleDisabled method"
```

### 6. Archive Unused Utility Scripts (If Confirmed Unused)

```bash
# Create archive directory
mkdir -p scripts/archive

# Move scripts
git mv scripts/fix-markdown.js scripts/archive/
git mv scripts/remove-emojis.js scripts/archive/

# Create ARCHIVE.md
cat > scripts/archive/ARCHIVE.md << 'EOF'
# Archived Scripts

## fix-markdown.js
**Date Archived**: 2026-01-30
**Reason**: Replaced by markdownlint-cli --fix
**Usage**: Manual fixer for MD040/MD036 violations
**Replacement**: npm run lint:md:fix

## remove-emojis.js
**Date Archived**: 2026-01-30
**Reason**: One-time cleanup tool, no longer needed
**Usage**: Batch emoji removal
**Prevention**: npm run check:emojis (prevents introduction)
EOF

# Commit
git add scripts/archive/
git commit -m "chore: archive unused utility scripts"
```

### 7. Mark Deprecated Type for Removal

If keeping for backward compatibility, update comment:

```typescript
// In src/validators/base.ts:125
/**
 * @deprecated Use BaseValidatorOptions or specific validator options instead
 * Will be removed in v2.0.0
 */
export type ValidatorOptions = BaseValidatorOptions;
```

---

## Documentation Updates

### 8. Document Future Phase Stubs

Edit `docs/todo.md`:

```markdown
## Phase 4: Advanced Features

### Duplicate Detection
- [ ] Implement check-duplicate-fixtures.ts (stub exists)
- [ ] Implement check-duplicate-logic.ts (stub exists)

## Phase 6: Quality Assurance

### Rule Coverage
- [ ] Implement check-rule-coverage.ts (stub exists)
```

### 9. Add Prevention Guidelines

Edit `CONTRIBUTING.md`:

```markdown
## Maintaining Clean Code

### Preventing Deadcode

1. **After Refactoring**
   - Delete source files with `git rm`
   - Run `npm run clean && npm run build`
   - Commit both source and dist/ changes

2. **Deprecating Code**
   - Use @deprecated JSDoc tag
   - Provide replacement in comment
   - Set removal version (e.g., "Remove in v2.0.0")

3. **One-Time Scripts**
   - Archive to scripts/archive/ when no longer needed
   - Document in scripts/archive/ARCHIVE.md

4. **Quarterly Cleanup**
   - Run `npx ts-prune` to find unused exports
   - Review archived scripts for final removal
   - Update deprecated code timeline
```

---

## Testing Checklist

After any changes:

```bash
# Run full test suite
npm test

# Run linting
npm run lint

# Test CLI commands
npm run claudelint -- check-all
npm run claudelint -- list-rules
npm run claudelint -- validate-skills

# Build for production
npm run build

# Verify package
npm pack
tar -tzf *.tgz | head -20
rm *.tgz
```

---

## Summary

| Task | Priority | Time | Risk | Status |
|------|----------|------|------|--------|
| Remove orphaned build artifacts | HIGH | 10 min | None | [ ] |
| Check deprecated method usage | MEDIUM | 15 min | Low | [ ] |
| Check deprecated type usage | MEDIUM | 15 min | Low | [ ] |
| Review utility script usage | MEDIUM | 30 min | Low | [ ] |
| Remove deprecated method | LOW | 15 min | Medium | [ ] |
| Archive unused scripts | LOW | 20 min | Low | [ ] |
| Update deprecation comment | LOW | 5 min | None | [ ] |
| Document future stubs | LOW | 15 min | None | [ ] |
| Add prevention guidelines | LOW | 30 min | None | [ ] |

**Total Estimated Time**: 2.5 - 3 hours
