# Documentation Update Strategy

## Current State (Audit Results)

**Total**: 28 rule documentation files
**Status**: 0 clean, 28 need updates (100%)

### Critical Statistics

- **96% using old metadata format** (table at bottom instead of badges at top)
- **96% missing source code links**
- **100% exceed line count targets**
- **Average: 357 lines** (target: 80-250)
- **18% have redundant sections** (Benefits, Why It Matters, etc.)

### Severity Breakdown

**Extremely Verbose (>500 lines):**
1. mcp-invalid-env-var.md - 644 lines ❌
2. plugin-invalid-manifest.md - 630 lines ❌
3. plugin-invalid-version.md - 605 lines ❌
4. mcp-invalid-server.md - 591 lines ❌
5. mcp-invalid-transport.md - 585 lines ❌
6. plugin-missing-file.md - 574 lines ❌

**Very Verbose (400-500 lines):**
7. hooks-invalid-config.md - 533 lines
8. hooks-invalid-event.md - 460 lines
9. settings-invalid-permission.md - 446 lines
10. hooks-missing-script.md - 427 lines

**Moderately Verbose (300-400 lines):**
11. skill-deep-nesting.md - 336 lines
12. settings-invalid-env-var.md - 390 lines
13. settings-invalid-schema.md - 365 lines
14. skill-path-traversal.md - 311 lines

**Acceptable Length (<300 lines):**
15-28. Various skills, claude-md, and other rules

## Update Strategy

### Phase 1: Create Automation Tools ✅

- [x] Create `scripts/audit-rule-docs.ts` - Audit all docs
- [x] Add `npm run audit:rule-docs` command
- [ ] Create doc simplification helper script
- [ ] Add to CI/pre-commit hooks

### Phase 2: Update Template Compliance (Priority 1)

**Goal**: Fix structural issues in all 27 docs with errors

**Tasks** (can be automated):
1. Move metadata from bottom table to top badges
2. Add source code links
3. Remove "## Metadata" table section

**Approach**: Create script to automate these changes

```typescript
// Pseudo-code for automation
function updateMetadata(content: string): string {
  // 1. Extract metadata from bottom table
  const metadata = extractMetadataTable(content);

  // 2. Generate badges
  const badges = generateBadges(metadata);

  // 3. Remove old metadata section
  content = removeMetadataSection(content);

  // 4. Insert badges after title
  content = insertBadgesAfterTitle(content, badges);

  // 5. Add source code links
  content = addSourceLinks(content, metadata.validator);

  return content;
}
```

**Estimated Time**: 1-2 hours (with automation)

### Phase 3: Simplify Extremely Verbose Docs (Priority 2)

**Goal**: Reduce 6 docs from 574-644 lines to ≤250 lines

**Files**:
1. mcp-invalid-env-var.md (644 → ~180 lines)
2. plugin-invalid-manifest.md (630 → ~180 lines)
3. plugin-invalid-version.md (605 → ~150 lines)
4. mcp-invalid-server.md (591 → ~180 lines)
5. mcp-invalid-transport.md (585 → ~180 lines)
6. plugin-missing-file.md (574 → ~180 lines)

**Approach**: Manual simplification following skill-deep-nesting example

**Actions per file**:
- Cut excessive examples (6+ → 2 max per concept)
- Remove redundant sections
- Consolidate "How To Fix" (detailed → 3-5 steps)
- Remove multiple organization patterns

**Estimated Time**: 30-40 minutes per file = 3-4 hours total

### Phase 4: Simplify Very Verbose Docs (Priority 3)

**Goal**: Reduce 4 docs from 427-533 lines to ≤250 lines

**Files**:
7. hooks-invalid-config.md (533 → ~200 lines)
8. hooks-invalid-event.md (460 → ~180 lines)
9. settings-invalid-permission.md (446 → ~180 lines)
10. hooks-missing-script.md (427 → ~180 lines)

**Estimated Time**: 20-30 minutes per file = 1.5-2 hours total

### Phase 5: Simplify Moderately Verbose Docs (Priority 4)

**Goal**: Reduce docs from 300-400 lines to targets

**Files**:
11. skill-deep-nesting.md (336 → 120 lines) - already have simplified version!
12. settings-invalid-env-var.md (390 → ~180 lines)
13. settings-invalid-schema.md (365 → ~180 lines)
14. skill-path-traversal.md (311 → ~120 lines)

**Estimated Time**: 15-20 minutes per file = 1-1.5 hours total

### Phase 6: Polish Remaining Docs (Priority 5)

**Goal**: Fine-tune remaining docs to meet targets

**Files**: 14 docs that are already <300 lines

**Actions**:
- Reduce example counts where needed
- Tighten prose
- Ensure consistency

**Estimated Time**: 10 minutes per file = 2-3 hours total

## Automation Plan

### Script 1: Metadata Migration (High Priority)

**Purpose**: Automate Phase 2 structural changes

**File**: `scripts/migrate-doc-metadata.ts`

**What it does**:
1. Reads each rule doc
2. Extracts metadata from `## Metadata` table
3. Generates badge format
4. Removes old metadata section
5. Inserts badges after title
6. Adds source code links template
7. Writes updated file

**Can be fully automated**: Yes

**Run on**: All 27 docs with old format

### Script 2: Example Counter

**Purpose**: Help identify docs with too many examples

**File**: `scripts/count-examples.ts`

**What it does**:
1. Counts code blocks by section
2. Reports which docs have >2 incorrect or >2 correct examples
3. Provides list for manual review

**Can be fully automated**: Reporting only (simplification is manual)

### Script 3: Redundant Section Detector

**Purpose**: Flag docs with redundant sections

**File**: Already in `audit-rule-docs.ts`

**What it detects**:
- "Benefits of..." sections
- "Why It Matters" sections
- "Good Directory Patterns" sections
- "Migration Steps" sections (outside "How To Fix")

**Can be fully automated**: Detection only (removal is manual)

## Implementation Schedule

### Week 1: Automation + High Priority

**Day 1-2**: Create automation scripts
- [ ] `migrate-doc-metadata.ts` script
- [ ] Test on 2-3 docs
- [ ] Run on all 27 docs
- [ ] Verify with audit script

**Day 3-5**: Simplify extremely verbose docs (Priority 2)
- [ ] mcp-invalid-env-var.md
- [ ] plugin-invalid-manifest.md
- [ ] plugin-invalid-version.md
- [ ] mcp-invalid-server.md
- [ ] mcp-invalid-transport.md
- [ ] plugin-missing-file.md

### Week 2: Medium Priority

**Day 1-2**: Simplify very verbose docs (Priority 3)
- [ ] hooks-invalid-config.md
- [ ] hooks-invalid-event.md
- [ ] settings-invalid-permission.md
- [ ] hooks-missing-script.md

**Day 3-4**: Simplify moderately verbose docs (Priority 4)
- [ ] Replace skill-deep-nesting.md with simplified version
- [ ] settings-invalid-env-var.md
- [ ] settings-invalid-schema.md
- [ ] skill-path-traversal.md

**Day 5**: Polish remaining docs (Priority 5)
- [ ] Review and tighten 14 remaining docs

### Week 3: Validation & Enforcement

**Day 1**: Run validation
- [ ] `npm run audit:rule-docs` - all docs should be clean
- [ ] `npm run check:all` - all checks pass
- [ ] Manual review of updated docs

**Day 2**: Update enforcement
- [ ] Add `audit:rule-docs` to pre-commit hooks
- [ ] Add to CI pipeline
- [ ] Update CONTRIBUTING.md with template guidelines

**Day 3**: Documentation
- [ ] Update docs/rule-development-enforcement.md
- [ ] Add examples of good vs bad docs
- [ ] Document the new process

## Success Metrics

**Target State**:
- ✅ 0% docs using old metadata format (currently 96%)
- ✅ 100% docs with source code links (currently 4%)
- ✅ 100% docs within line count targets (currently 0%)
- ✅ 0% docs with redundant sections (currently 18%)
- ✅ Average lines: 120-180 (currently 357)

**Quality Checks**:
- All docs pass `npm run audit:rule-docs`
- All docs pass `npm run check:rule-docs`
- All docs follow new template
- Consistent style across all docs

## Parallel Work

While updating docs, we can also:
1. Complete Phase 5 remaining tasks (3 custom logic rules)
2. Document newly implemented rules
3. Set up CI/CD enforcement

This documentation update work is independent and can be done alongside code implementation.

## Quick Start

To begin updating docs immediately:

1. **Run audit** to see current state:
   ```bash
   npm run audit:rule-docs
   ```

2. **Create metadata migration script** (if you want automation):
   ```bash
   # Create scripts/migrate-doc-metadata.ts
   # Test on 1 doc first
   # Run on all docs
   ```

3. **Or manually update** using this template:
   - Copy skill-deep-nesting-simplified.md as example
   - Follow new TEMPLATE.md
   - Focus on most verbose docs first

4. **Validate updates**:
   ```bash
   npm run audit:rule-docs
   npm run check:rule-docs
   ```

## Next Actions

**Option A (Automated):**
1. Create `migrate-doc-metadata.ts` script (1-2 hours)
2. Run on all 27 docs (5 minutes)
3. Manually simplify 6 extremely verbose docs (3-4 hours)
4. Done!

**Option B (Manual):**
1. Start with worst offenders (mcp-invalid-env-var.md at 644 lines)
2. Use skill-deep-nesting-simplified.md as template
3. Work through list in priority order
4. Takes longer but more control

**Recommended**: Option A (automation first, then manual simplification of worst cases)
