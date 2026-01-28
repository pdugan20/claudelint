# Documentation Update: Summary & Next Steps

## What We've Built ✅

### 1. New Template (No Emojis)

**Location**: `docs/rules/TEMPLATE.md`

**Format**:
```markdown
# Rule: rule-id

**Severity**: Error | Warning
**Fixable**: Yes | No
**Validator**: Skills | ...
**Category**: Security | ...

Brief description.

## Rule Details
[2-3 sentences + 2 examples max]
```

**Guidelines Built-in**:
- Line targets: 80-120 (simple), 150-250 (complex)
- Max 2 incorrect, 2 correct examples
- No redundant sections
- Source code links required

### 2. Audit Script

**Command**: `npm run audit:rule-docs`

**What it checks**:
- Metadata badges at top (not bottom table)
- Line count compliance
- Example count limits (≤2 per type)
- Redundant sections
- Source code links

**Output**: Prioritized list of docs needing updates

### 3. Example Simplification

**File**: `docs/rules/skills/skill-deep-nesting-simplified.md`

**Results**:
- 336 lines → 124 lines (63% reduction)
- 38 code blocks → 6 code blocks
- 15 subsections → 2 subsections
- Passes all validations (except 5 lines over target)

### 4. Analysis Documents

Created comprehensive analysis:
- `ESLINT-COMPARISON.md` - How we compare to ESLint
- `VERBOSITY-ANALYSIS.md` - Why we're too verbose
- `SIMPLIFICATION-EXAMPLE.md` - Before/after comparison
- `DOC-UPDATE-STRATEGY.md` - Full update plan

## Current State 📊

**Audit Results** (28 docs total):
- **0 docs clean** (0%)
- **27 docs with errors** (96% - metadata format issues)
- **28 docs over line count targets** (100%)
- **Average: 357 lines** (target: 80-250)

**Worst Offenders**:
1. mcp-invalid-env-var.md - 644 lines (424% over target!)
2. plugin-invalid-manifest.md - 630 lines
3. plugin-invalid-version.md - 605 lines
4. mcp-invalid-server.md - 591 lines
5. mcp-invalid-transport.md - 585 lines

## Two Paths Forward

### Option A: Automated Metadata Migration + Manual Simplification

**Phase 1** (2-3 hours): Create automation script
```bash
# Create scripts/migrate-doc-metadata.ts
# Automatically:
# - Move metadata from bottom to top
# - Convert table format to badges
# - Add source code links
# - Run on all 27 docs
```

**Phase 2** (5-8 hours): Manual simplification
- Simplify 6 extremely verbose docs (3-4 hours)
- Simplify 4 very verbose docs (1.5-2 hours)
- Polish remaining docs (2-3 hours)

**Total Time**: 7-11 hours
**Pros**: Faster for structural changes
**Cons**: Still requires significant manual work

### Option B: Manual Update with Example

**Approach**: Use skill-deep-nesting-simplified.md as template
- Copy structure for each doc
- Follow new TEMPLATE.md guidelines
- Work through priority list

**Phase 1** (4-5 hours): Top 6 extremely verbose
**Phase 2** (2-3 hours): Next 4 very verbose
**Phase 3** (2-3 hours): Remaining 18 docs

**Total Time**: 8-11 hours
**Pros**: More control, learn the template
**Cons**: More tedious

### Recommendation: Hybrid Approach

1. **Create metadata migration script** (1-2 hours)
   - Automates the structural stuff
   - Gets all docs to consistent format

2. **Manually simplify top 10 worst** (4-5 hours)
   - Focus on docs >400 lines
   - Biggest impact on average line count

3. **Quick polish on remaining 18** (2-3 hours)
   - Already closer to target
   - Just trim examples/sections

**Total: 7-10 hours** across 1-2 weeks

## Immediate Next Steps

### Today (30 mins - 1 hour)

1. **Decision**: Automation vs Manual vs Hybrid?

2. **If Automation**: Start metadata migration script
   ```typescript
   // scripts/migrate-doc-metadata.ts
   // Convert ## Metadata table → badges at top
   // Add source code links
   // Test on 2-3 docs first
   ```

3. **If Manual**: Start with worst offender
   ```bash
   # mcp-invalid-env-var.md (644 → ~180 lines)
   # Use skill-deep-nesting-simplified.md as template
   # Follow new TEMPLATE.md
   ```

### This Week

**Day 1-2**: Structural updates
- [ ] Run metadata migration (automated or manual)
- [ ] Verify all docs have badges at top
- [ ] Verify all docs have source links

**Day 3-5**: Simplify top 6 worst offenders
- [ ] mcp-invalid-env-var.md (644 → ~180)
- [ ] plugin-invalid-manifest.md (630 → ~180)
- [ ] plugin-invalid-version.md (605 → ~150)
- [ ] mcp-invalid-server.md (591 → ~180)
- [ ] mcp-invalid-transport.md (585 → ~180)
- [ ] plugin-missing-file.md (574 → ~180)

### Next Week

**Day 1-2**: Simplify next 4
- [ ] hooks-invalid-config.md (533 → ~200)
- [ ] hooks-invalid-event.md (460 → ~180)
- [ ] settings-invalid-permission.md (446 → ~180)
- [ ] hooks-missing-script.md (427 → ~180)

**Day 3-5**: Polish remaining 18 docs
- [ ] Quick review and trim
- [ ] Ensure consistency
- [ ] Run final audit

### Validation

After updates:
```bash
npm run audit:rule-docs  # Should be all clean
npm run check:rule-docs  # Should pass
npm run check:all        # All checks pass
```

## Success Criteria

**When complete**:
- ✅ All 28 docs have metadata badges at top
- ✅ All 28 docs have source code links
- ✅ All 28 docs within line count targets
- ✅ 0 docs with redundant sections
- ✅ Average lines: 120-180 (down from 357)
- ✅ `npm run audit:rule-docs` shows 0 errors

## Can This Wait?

**Short answer**: Partially.

**Must do now**:
- New docs MUST follow new template (prevent debt)
- Set up audit script in CI (prevent regressions)

**Can defer**:
- Updating existing 28 docs (but increases debt)
- Can update incrementally as we touch files

**Recommendation**: Do structural updates (metadata migration) now (automated), defer manual simplification to when we touch those files naturally.

## Integration with Other Work

This work is **independent** and can happen alongside:
- ✅ Task #3: Complete Phase 5 remaining tasks
- ✅ Creating docs for newly implemented rules
- ✅ Other Phase 6 tasks

We can parallelize:
1. One person updates existing docs
2. Another implements remaining Phase 5 rules
3. New rule docs follow new template immediately

## Tools Available

**Scripts**:
- `npm run audit:rule-docs` - Check template compliance
- `npm run check:rule-docs` - Check structure/content
- `npm run check:all` - Run all checks

**Templates**:
- `docs/rules/TEMPLATE.md` - New template with guidelines
- `docs/rules/skills/skill-deep-nesting-simplified.md` - Example

**Documentation**:
- `DOC-UPDATE-STRATEGY.md` - Full update plan
- `SIMPLIFICATION-EXAMPLE.md` - Before/after analysis
- `ESLINT-COMPARISON.md` - ESLint best practices

## What Do You Want To Do?

**Option 1**: Create metadata migration script now
- I can build it in 30-60 minutes
- Run on all docs automatically
- Then manually simplify worst offenders

**Option 2**: Manually update starting with worst offenders
- I can do 2-3 docs now as examples
- You see the process
- Decide if you want to continue or automate

**Option 3**: Defer to later, focus on Phase 5 tasks
- Set up audit in CI to prevent new debt
- Update docs incrementally as we touch them
- Focus on implementing remaining rules first

**Option 4**: Something else?

What's your preference?
