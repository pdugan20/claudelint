# Deadcode Cleanup Proposal

## Executive Summary

Analysis of the claudelint codebase reveals minimal deadcode with excellent overall health. The primary issues are orphaned build artifacts from refactored code and a few utility scripts that need usage verification. This proposal outlines a safe, systematic approach to removing deadcode and improving maintainability.

## Key Findings

- **True Deadcode**: 8 build artifact files (safe to delete)
- **Stub Implementations**: 3 intentional placeholders for future phases
- **Needs Investigation**: 2 utility scripts, 2 deprecated methods
- **Overall Health**: EXCELLENT - well-maintained codebase

## Detailed Analysis

### 1. Orphaned Build Artifacts (HIGH Priority - Safe to Remove)

#### Issue
Build artifacts exist for deleted source files, cluttering the dist/ directory:

**Files to Remove**:
- `dist/cli-hooks.js`
- `dist/cli-hooks.d.ts`
- `dist/cli-hooks.js.map`
- `dist/cli-hooks.d.ts.map`
- `dist/utils/validators/security-validators.js`
- `dist/utils/validators/security-validators.d.ts`
- `dist/utils/validators/security-validators.js.map`
- `dist/utils/validators/security-validators.d.ts.map`

**Evidence**:
- Source file `src/cli-hooks.ts` deleted in commit 7e67f78
- Source file `src/utils/validators/security-validators.ts` deleted in commit dca4dd4
- Functionality refactored into other modules

**Impact**: None (orphaned artifacts)

**Action**: Clean and rebuild

```bash
npm run clean
npm run build
```

### 2. Stub Implementations (LOW Priority - Keep with Documentation)

#### Issue
Three scripts exist as stubs for future implementation but are referenced in package.json.

**Files**:
- `scripts/check-duplicate-fixtures.ts` - Phase 4 planned feature
- `scripts/check-duplicate-logic.ts` - Phase 4 planned feature
- `scripts/check-rule-coverage.ts` - Phase 6 planned feature

**Evidence**:
- All marked with TODO comments
- Referenced in `package.json` scripts
- Placeholder implementations exist

**Impact**: Low - scripts are documented as future work

**Action**: Document in roadmap, keep stubs

### 3. Utility Scripts Needing Review (MEDIUM Priority - Investigate)

#### scripts/fix-markdown.js

**Purpose**: Manual markdown fixer for MD040/MD036 violations

**Current Status**:
- Not referenced in package.json
- Project uses `markdownlint-cli --fix` instead
- May be historical cleanup tool

**Questions**:
- Is this still used manually by developers?
- Has it been used in the last 2 months?
- Can markdownlint's --fix replace it entirely?

**Recommendation**: If unused for 2+ months, archive to `scripts/archive/`

#### scripts/remove-emojis.js

**Purpose**: Batch emoji removal from markdown files

**Current Status**:
- Not referenced in package.json
- Uses `emoji-regex` dependency (in devDependencies)
- Appears to be one-time cleanup tool
- Project has `check:emojis` script to prevent emoji introduction

**Questions**:
- Was this used for a one-time cleanup?
- Is it needed for ongoing maintenance?

**Recommendation**: Archive to `scripts/archive/` - useful for historical reference but not ongoing

### 4. Deprecated Code (MEDIUM Priority - Verify Before Removal)

#### src/validators/base.ts:285

```typescript
/**
 * @deprecated Internal method renamed to isRuleDisabledByComment for clarity
 */
protected isRuleDisabled(file?: string, line?: number, ruleId?: RuleId): boolean {
  return this.isRuleDisabledByComment(file, line, ruleId);
}
```

**Status**: Deprecated, wrapper to new method

**Questions**:
- Are there any remaining internal callers?
- Is this used by external code (plugins)?

**Recommendation**: Search codebase, remove if no callers

#### src/validators/base.ts:125

```typescript
/**
 * @deprecated Use BaseValidatorOptions or specific validator options instead
 */
export type ValidatorOptions = BaseValidatorOptions;
```

**Status**: Deprecated type alias

**Questions**:
- Is this used by external plugins?
- Should we keep for backward compatibility?

**Recommendation**: Mark for removal in next major version (v2.0.0)

## Implementation Plan

### Phase 1: Immediate Cleanup (Safe Actions)

**Timeline**: 1 day

**Tasks**:

1. Remove orphaned build artifacts
2. Verify clean rebuild works
3. Run full test suite
4. Commit changes

**Commands**:

```bash
# Clean build artifacts
npm run clean

# Rebuild
npm run build

# Verify tests pass
npm test

# Verify CLI works
npm run claudelint -- check-all

# Commit
git add dist/
git commit -m "chore: remove orphaned build artifacts"
```

**Risk**: None (these are generated files)

### Phase 2: Investigation (2-3 days)

**Tasks**:

1. **Search for deprecated method callers**

```bash
# Search for isRuleDisabled calls
grep -r "isRuleDisabled(" src/ tests/

# If none found, safe to remove
```

2. **Search for deprecated type usage**

```bash
# Search for ValidatorOptions usage
grep -r "ValidatorOptions" src/ tests/ examples/

# Check if plugins use it (search npm, GitHub)
```

3. **Review utility script usage**

```bash
# Check git history for fix-markdown.js usage
git log --all --full-history -- scripts/fix-markdown.js

# Check git history for remove-emojis.js usage
git log --all --full-history -- scripts/remove-emojis.js
```

4. **Document findings**

Create investigation report with recommendations

### Phase 3: Removal (1-2 days)

**Based on Phase 2 findings**:

**If deprecated code is unused**:

```bash
# Remove deprecated method from BaseValidator
# Update any tests that reference it
# Run test suite
# Commit
git commit -m "refactor: remove deprecated isRuleDisabled method"
```

**If utility scripts are unused**:

```bash
# Create archive directory
mkdir -p scripts/archive

# Move scripts
git mv scripts/fix-markdown.js scripts/archive/
git mv scripts/remove-emojis.js scripts/archive/

# Update README or add ARCHIVE.md explaining why
# Commit
git commit -m "chore: archive unused utility scripts"
```

### Phase 4: Documentation (1 day)

**Tasks**:

1. Document future phase stubs in roadmap
2. Update CONTRIBUTING.md with cleanup guidelines
3. Add section about maintaining clean codebase
4. Document when to use scripts/archive/

**Deliverables**:

- Updated docs/todo.md with Phase 4/6 stub details
- New section in CONTRIBUTING.md about deadcode prevention
- ARCHIVE.md explaining archived scripts

## Deadcode Prevention Guidelines

### For Future Development

1. **Delete Source Before Committing**
   - Always `git rm` unused source files
   - Run `npm run clean && npm run build` after refactors
   - Don't leave orphaned build artifacts

2. **Mark Deprecated Code Clearly**
   - Use @deprecated JSDoc tag
   - Provide replacement in comment
   - Set removal timeline (e.g., "Remove in v2.0.0")

3. **Review Unused Exports Periodically**
   - Run `ts-prune` or similar tools quarterly
   - Check for exports not imported anywhere
   - Consider internal vs external API separation

4. **Archive Don't Delete**
   - Move one-time scripts to `scripts/archive/`
   - Document why archived (date, purpose, replacement)
   - Keeps git history intact

5. **Stub Implementation Pattern**
   - Mark clearly with TODO and phase number
   - Reference in package.json if relevant
   - Document in roadmap/todo.md

### Recommended Tools

**For TypeScript Deadcode Detection**:

```bash
# Install ts-prune
npm install --save-dev ts-prune

# Add to package.json
"scripts": {
  "check:deadcode": "ts-prune"
}

# Run quarterly
npm run check:deadcode
```

**For Unused Dependencies**:

```bash
# Install depcheck
npm install -g depcheck

# Run
depcheck

# Or use npm-check
npm install -g npm-check
npm-check
```

## Success Metrics

### Immediate (Phase 1)
- [ ] 8 orphaned build artifacts removed
- [ ] Clean build produces no extra files
- [ ] All tests pass
- [ ] CLI commands work correctly

### Investigation (Phase 2)
- [ ] Deprecated method usage documented
- [ ] Utility script usage verified
- [ ] Decision made on each item

### Cleanup (Phase 3)
- [ ] Deprecated code removed (if unused)
- [ ] Utility scripts archived (if unused)
- [ ] All tests still pass
- [ ] No regressions in functionality

### Documentation (Phase 4)
- [ ] Future stubs documented in roadmap
- [ ] Prevention guidelines added to CONTRIBUTING.md
- [ ] Archive directory documented

## Risks and Mitigations

### Risk 1: Breaking External Plugins

**Risk**: Removing deprecated code breaks plugins

**Mitigation**:
- Search GitHub for plugins using deprecated APIs
- Check npm for dependent packages
- Follow semantic versioning (breaking changes = major version)
- Provide migration guide

### Risk 2: Accidentally Removing Needed Code

**Risk**: Utility scripts are actually used but not documented

**Mitigation**:
- Check git history for usage
- Ask team if anyone uses scripts
- Archive instead of delete (easy to restore)
- Keep for one release cycle before final removal

### Risk 3: Build Issues

**Risk**: Removing build artifacts causes problems

**Mitigation**:
- Test clean build thoroughly
- Run full test suite
- Verify CLI commands work
- Can easily regenerate if issues arise

## Open Questions

1. **Deprecation Timeline**
   - Should deprecated code be removed in v1.1.0 or wait for v2.0.0?
   - Do we need a deprecation policy?

2. **Plugin Ecosystem**
   - Are there external plugins using our APIs?
   - Should we maintain backward compatibility?

3. **Script Usage**
   - Does anyone on the team use fix-markdown.js manually?
   - Should we survey contributors about utility script usage?

4. **Automation**
   - Should we add ts-prune to CI to prevent future deadcode?
   - Should clean builds be enforced in pre-commit hooks?

## Recommendation

**Proceed with Phase 1 immediately** (safe, no risk):
- Remove orphaned build artifacts
- Clean rebuild
- Commit

**Phase 2 investigation** can happen in parallel with other work:
- Low time investment (few hours)
- Gathers data for informed decisions

**Phases 3-4** can be scheduled based on findings and priority:
- Not blocking current development
- Nice-to-have improvements

## Conclusion

The claudelint codebase is in excellent health with minimal deadcode. The primary issue is orphaned build artifacts that can be safely removed immediately. Other items require minimal investigation before making informed decisions. This cleanup will:

- Reduce repository size slightly
- Improve build cleanliness
- Clarify what code is active vs archived
- Establish patterns for future maintenance

Estimated total effort: 2-3 days over 1-2 weeks (non-blocking work).
