# Complete Next Steps Plan - Rule Implementation Project

**Date**: 2026-01-28
**Current Phase**: Phase 5 (88% complete) → Phase 6 (34% complete)
**Overall Progress**: 198/239 tasks (83% complete)

## Current Situation Analysis

### What's Working 

1. **Rule Implementation**: 96/219 rules implemented (44%)
2. **Phase 5**: Nearly complete - 23/26 tasks done (88%)
3. **Enforcement Scripts**: 5/7 automation scripts working
4. **Documentation**: 27 rule docs exist (but some have issues)

### Critical Issues 

1. **Broken Documentation** (6 files)
   - Agent damage from previous session
   - Code fence bugs, missing sections, wrong structure
   - Blocks validation checks

2. **False "Orphaned" Rule IDs**
   - 41 rules flagged as "orphaned"
   - Actually in-progress implementations (Phase 5/6)
   - Validation script doesn't understand project status

3. **Example Detection Too Strict**
   - 42 warnings about "missing examples"
   - Most are false positives
   - Script pattern matching too rigid

## Priority-Ordered Next Steps

---

## Priority 1: Fix Critical Documentation Issues (IMMEDIATE)

**Goal**: Get validation checks passing
**Time**: 1-2 hours
**Blocks**: Phase 6 completion, pre-commit hooks

### Task 1.1: Fix Completely Broken Files

**Files to fix:**

1. **docs/rules/claude-md/size-error.md** - Complete rewrite
   - Currently only has Metadata section
   - Use TEMPLATE.md as guide
   - Copy structure from size-warning.md (which is correct)
   - Add examples, all required sections

### Task 1.2: Fix Code Fence Issues

**Files to fix:**

2. **docs/rules/skills/skill-deep-nesting.md** - Multiple issues
   - Change line 1: `# Deep Nesting` → `# Rule: skill-deep-nesting`
   - Replace all closing ` ```text` with ` ``` ` (31 instances)
   - Remove lines 19-22 (misplaced metadata)
   - Add proper ## Metadata section at end

3. **docs/rules/skills/skill-eval-usage.md** - Code fence issues
   - Replace closing ` ```text` with ` ``` ` (19 instances)

4. **docs/rules/skills/skill-missing-examples.md** - Code fence issues
   - Replace closing ` ```text` with ` ``` ` (30 instances)

### Task 1.3: Fix Section Ordering

**Files to fix:**

5. **docs/rules/skills/skill-missing-shebang.md** - Version section ordering
   - Move "Available since: v1.0.0" from line 140 to line 131 (under ## Version)

6. **docs/rules/claude-md/size-warning.md** - Version section ordering
   - Move "Available since: v1.0.0" from line 142 to line 133 (under ## Version)

### Validation

After fixing each file:

```bash
npm run check:rule-docs
npm run lint:md docs/rules/
```

**Expected outcome**:
- Violations drop from 11 → 0
- Warnings drop from 42 → ~16 (after next priority)

---

## Priority 2: Update Validation Scripts (IMMEDIATE)

**Goal**: Fix false positives in validation
**Time**: 30 minutes

### Task 2.1: Update Example Detection Logic

**File**: `scripts/check-rule-docs.ts`

**Current code (lines 153-157):**
```typescript
if (line.includes('incorrect') || line.includes('correct')) {
  if (line.toLowerCase().includes('example')) {
    hasExamples = true;
  }
}
```

**Updated code:**
```typescript
// Check for examples with flexible wording
const hasIncorrectExample =
  line.includes('incorrect') ||
  line.toLowerCase().includes('violation');
const hasCorrectExample = line.includes('correct');
const hasExampleKeyword = line.toLowerCase().includes('example');

if (hasExampleKeyword && (hasIncorrectExample || hasCorrectExample)) {
  hasExamples = true;
}
```

**Expected outcome**: Warnings drop from 42 → ~2-3 real issues

### Task 2.2: Update "Orphaned Rule" Detection

**File**: `scripts/check-rule-ids.ts`

Add context-aware detection:

```typescript
// Don't report orphaned rules if we're in active development
const isInDevelopment = process.env.SKIP_ORPHANED_CHECK === 'true';

if (!isInDevelopment && orphanedRuleIds.length > 0) {
  // Report as warnings, not errors
  // Note that these may be in-progress implementations
}
```

**Add to README note:**
During active development, orphaned rule IDs are expected as new rules are being implemented.

---

## Priority 3: Complete Phase 5 (SHORT-TERM)

**Goal**: Finish remaining custom logic rules
**Time**: 2-4 hours
**Current**: 23/26 tasks (88%)

### Remaining Tasks

1. **Hooks: JSON output schema validation** (Complex)
   - 12 event-specific output schemas
   - Parse JSON output and validate structure
   - File: `src/validators/hooks.ts`
   - Estimated: 2 hours

2. **MCP: Tool search syntax parsing** (Moderate)
   - Parse "auto:N" syntax for toolSearch field
   - Validate N is a valid threshold
   - File: `src/validators/mcp.ts`
   - Estimated: 30 minutes

3. **Plugin: Dependency resolution** (Complex)
   - plugin-dependency-not-found rule
   - Resolve dependencies from plugin registry/marketplace
   - File: `src/validators/plugin.ts`
   - Estimated: 1.5 hours

**Order**: Do #2 first (quick win), then #1, then #3

---

## Priority 4: Phase 6 Documentation Sprint (MEDIUM-TERM)

**Goal**: Document all implemented rules
**Time**: 6-8 hours
**Current**: 27/96 implemented rules have docs (28%)

### Task 4.1: Create Documentation for Remaining Rules

**Rules needing docs**: 69 rules

Break down by validator:

1. **CLAUDE.md** (2 remaining): import-invalid-home-path, frontmatter-unknown-field
2. **Skills** (0 remaining): All documented 
3. **Settings** (1 remaining): settings-permission-invalid-rule
4. **Hooks** (0 remaining): All documented 
5. **MCP** (0 remaining): All documented 
6. **Plugin** (2 remaining): plugin-dependency-not-found, plugin-manifest-not-in-subdir
7. **Agents** (0 remaining): All documented 
8. **LSP** (18 remaining): Most LSP rules
9. **Output Styles** (10 remaining): Most output style rules

### Documentation Template Workflow

For each rule:

1. Copy TEMPLATE.md → docs/rules/{validator}/{rule-id}.md
2. Fill in sections:
   - Title: `# Rule: {rule-id}`
   - Description: What does it check?
   - Rule Details: Why does it exist?
   - Examples: 2+ incorrect, 2+ correct (with code blocks)
   - Options: Configuration or "None"
   - When Not To Use It: Guidance
   - Related Rules: Links
   - Version: "Available since: v1.0.0"
   - Metadata: Category, Severity, Fixable, Validator
3. Run validation: `npm run check:rule-docs`
4. Fix any issues immediately

**Strategy**: Batch by validator (easier to stay in context)

**Priority order:**
1. LSP rules (18) - Newest validator, needs docs
2. Output Styles rules (10) - Newest validator, needs docs
3. Plugin rules (2) - Almost done
4. CLAUDE.md rules (2) - Complete the set
5. Settings rule (1) - Complete the set

---

## Priority 5: Finish Enforcement Automation (MEDIUM-TERM)

**Goal**: Complete remaining automation scripts
**Time**: 3-4 hours
**Current**: 5/7 scripts complete

### Remaining Scripts

1. **check-examples.ts** - Validate code examples
   - Extract code blocks from rule docs
   - Validate JSON/YAML syntax
   - Count incorrect/correct examples
   - Estimated: 2 hours

2. **check-coverage.ts** - Coverage reporting
   - List rules without docs
   - List rules without tests
   - Calculate coverage percentages
   - Generate quality scores
   - Estimated: 1.5 hours

**Optional** (nice to have):
3. **generate-quality-report.ts** - HTML dashboard
   - Visual metrics dashboard
   - Coverage trends
   - Rule quality scores
   - Estimated: 3 hours (defer to post-v1.0)

---

## Priority 6: Configure Enforcement Hooks (MEDIUM-TERM)

**Goal**: Prevent future documentation issues
**Time**: 1 hour

### Task 6.1: Configure Pre-commit Hooks

Create `.husky/pre-commit`:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Fast checks (run on every commit)
npm run check:file-naming || exit 1
npm run check:rule-ids || exit 1
npm run check:rule-docs || exit 1
npm run check:consistency || exit 1

# Lint
npm run lint || exit 1
npm run lint:md || exit 1

echo " Pre-commit checks passed"
```

### Task 6.2: Configure CI Checks

Add to `.github/workflows/validate.yml`:

```yaml
- name: Run validation checks
  run: npm run check:all

- name: Check rule coverage
  run: npm run check:coverage

- name: Run tests
  run: npm test
```

---

## Priority 7: Test Suite Verification (LONG-TERM)

**Goal**: Ensure all rules are tested
**Time**: 4-6 hours
**Status**: Deferred from Phase 4

### Tasks

1. **Verify test coverage** for all 96 implemented rules
2. **Convert tests to builder pattern** (optional optimization)
3. **Run full test suite** and fix any failures
4. **Performance benchmarking**

---

## Priority 8: Complete Phase 5 Remaining Rules (LONG-TERM)

**Goal**: Implement final 123 rules
**Time**: 2-3 weeks (post-documentation)

This is the bulk of remaining work. Most are Schema/Refinement rules which are quick to implement.

**Strategy**: Batch by type
1. Schema rules (easiest): 1-2 hours per 10 rules
2. Refinement rules (moderate): 2-3 hours per 10 rules
3. Logic rules (complex): 3-5 hours per 5 rules

---

## Milestone Schedule

### Week 1 (Current - Immediate)

**Goal**: Fix all critical issues

- [ ] Fix 6 broken documentation files (Priority 1)
- [ ] Update validation scripts (Priority 2)
- [ ] Complete Phase 5 remaining tasks (Priority 3)
- [ ] Run full validation suite (should pass)

**Deliverable**: Clean validation, Phase 5 complete (100%)

### Week 2-3 (Documentation Sprint)

**Goal**: Document all implemented rules

- [ ] Create docs for 69 remaining implemented rules (Priority 4)
- [ ] LSP rules (18 docs)
- [ ] Output Styles rules (10 docs)
- [ ] Other remaining rules (41 docs)

**Deliverable**: 96/96 implemented rules documented (100%)

### Week 3 (Enforcement)

**Goal**: Automation and enforcement complete

- [ ] Implement check-examples.ts (Priority 5)
- [ ] Implement check-coverage.ts (Priority 5)
- [ ] Configure pre-commit hooks (Priority 6)
- [ ] Configure CI checks (Priority 6)
- [ ] Test enforcement pipeline

**Deliverable**: Full enforcement automation working

### Week 4+ (Implementation)

**Goal**: Complete remaining 123 rules

- [ ] Implement Schema rules (~85 remaining)
- [ ] Implement Refinement rules (~28 remaining)
- [ ] Implement Logic rules (~10 remaining)
- [ ] Document as you go
- [ ] Test as you go

**Deliverable**: All 219 rules implemented and documented

---

## Success Criteria

### Phase 6 Complete (v1.0.0 Ready)

- [ ] All documentation violations fixed (0 errors)
- [ ] All implemented rules documented (96/96)
- [ ] All enforcement scripts working (7/7)
- [ ] Pre-commit hooks configured and tested
- [ ] CI checks configured and passing
- [ ] No false positive warnings in validation
- [ ] Test suite passing (100%)

### Project Complete

- [ ] All 219 rules implemented
- [ ] All 219 rules documented
- [ ] All 219 rules tested
- [ ] Enforcement automation complete
- [ ] Performance benchmarks met
- [ ] Ready for v1.0.0 release

---

## Quick Start (What to Do Right Now)

### Session 1 (1-2 hours): Fix Broken Docs

```bash
# 1. Fix size-error.md (rewrite)
# 2. Fix skill-deep-nesting.md (title, fences, metadata)
# 3. Fix skill-eval-usage.md (fences)
# 4. Fix skill-missing-examples.md (fences)
# 5. Fix skill-missing-shebang.md (version section)
# 6. Fix size-warning.md (version section)

# Validate
npm run check:rule-docs
npm run lint:md docs/rules/
```

### Session 2 (30 mins): Update Validation

```bash
# 1. Update check-rule-docs.ts (example detection)
# 2. Update check-rule-ids.ts (orphaned rule context)
# 3. Test validation

npm run check:all
```

### Session 3 (2-4 hours): Complete Phase 5

```bash
# 1. Implement MCP tool search parsing (quick)
# 2. Implement Hooks JSON output schemas (complex)
# 3. Implement Plugin dependency resolution (complex)

npm test
npm run check:all
```

### Session 4+ (Ongoing): Documentation Sprint

Document remaining 69 implemented rules, prioritizing LSP and Output Styles validators.

---

## Notes

1. **Don't remove orphaned rule IDs** - They're in-progress implementations
2. **Document as you implement** - Don't let docs lag behind
3. **Run validation frequently** - Catch issues early
4. **Batch similar work** - Stay in context
5. **Celebrate milestones** - Track progress visibly

## Questions?

- **Why fix docs first?** Blocks pre-commit hooks and CI
- **Why update validation scripts?** 42 false warnings create noise
- **Can we skip enforcement?** No - prevents future agent damage
- **When is v1.0.0?** After all 96 implemented rules are documented + enforcement complete
- **When is project complete?** After all 219 rules implemented, documented, tested

## Related Documents

- [AGENT-DAMAGE-REPORT.md](./AGENT-DAMAGE-REPORT.md) - Details of what went wrong
- [IMPLEMENTATION-TRACKER.md](./IMPLEMENTATION-TRACKER.md) - Phase-by-phase progress
- [RULE-TRACKER.md](./RULE-TRACKER.md) - Complete rule catalog
