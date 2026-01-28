# Documentation Rewrite Plan

## Approach: Manual Rewrite All 28 Docs

**Why Manual**: Too much variance in content, structure, and verbosity. Each doc needs thoughtful editing to:
- Identify core value vs redundant content
- Choose best 2 examples from 6+
- Consolidate scattered rationale
- Maintain rule-specific context

**Process**: Use new TEMPLATE.md + skill-deep-nesting-simplified.md as references for each rewrite.

## Rewrite Order (By Priority)

### Batch 1: Worst Offenders (500+ lines) - 6 docs

These need the most work, will have biggest impact on metrics.

| # | File | Current | Target | Reduction | Validator |
|---|------|---------|--------|-----------|-----------|
| 1 | mcp-invalid-env-var.md | 644 | ~180 | 72% | MCP |
| 2 | plugin-invalid-manifest.md | 630 | ~180 | 71% | Plugin |
| 3 | plugin-invalid-version.md | 605 | ~150 | 75% | Plugin |
| 4 | mcp-invalid-server.md | 591 | ~180 | 70% | MCP |
| 5 | mcp-invalid-transport.md | 585 | ~180 | 69% | MCP |
| 6 | plugin-missing-file.md | 574 | ~180 | 69% | Plugin |

**Estimated time**: 40-60 minutes per doc = **4-6 hours total**

### Batch 2: Very Verbose (400-500 lines) - 4 docs

| # | File | Current | Target | Reduction | Validator |
|---|------|---------|--------|-----------|-----------|
| 7 | hooks-invalid-config.md | 533 | ~200 | 62% | Hooks |
| 8 | hooks-invalid-event.md | 460 | ~180 | 61% | Hooks |
| 9 | settings-invalid-permission.md | 446 | ~180 | 60% | Settings |
| 10 | hooks-missing-script.md | 427 | ~180 | 58% | Hooks |

**Estimated time**: 30-40 minutes per doc = **2-3 hours total**

### Batch 3: Moderately Verbose (300-400 lines) - 4 docs

| # | File | Current | Target | Reduction | Validator |
|---|------|---------|--------|-----------|-----------|
| 11 | settings-invalid-env-var.md | 390 | ~180 | 54% | Settings |
| 12 | settings-invalid-schema.md | 365 | ~180 | 51% | Settings |
| 13 | skill-deep-nesting.md | 336 | ~120 | 64% | Skills |
| 14 | skill-path-traversal.md | 311 | ~120 | 61% | Skills |

**Estimated time**: 20-30 minutes per doc = **1.5-2 hours total**

**Note**: #13 already done (use -simplified version)

### Batch 4: Acceptable Length (200-300 lines) - 9 docs

| # | File | Current | Target | Reduction | Validator |
|---|------|---------|--------|-----------|-----------|
| 15 | skill-too-many-files.md | 279 | ~120 | 57% | Skills |
| 16 | skill-dangerous-command.md | 273 | ~120 | 56% | Skills |
| 17 | skill-naming-inconsistent.md | 275 | ~120 | 56% | Skills |
| 18 | skill-eval-usage.md | 287 | ~120 | 58% | Skills |
| 19 | skill-path-traversal.md | 311 | ~120 | 61% | Skills |
| 20 | skill-missing-comments.md | 238 | ~120 | 50% | Skills |
| 21 | skill-missing-changelog.md | 197 | ~120 | 39% | Skills |
| 22 | skill-missing-examples.md | 233 | ~120 | 48% | Skills |
| 23 | skill-missing-version.md | 230 | ~120 | 48% | Skills |

**Estimated time**: 15-25 minutes per doc = **2-4 hours total**

### Batch 5: Close to Target (<200 lines) - 5 docs

| # | File | Current | Target | Reduction | Validator |
|---|------|---------|--------|-----------|-----------|
| 24 | import-circular.md | 218 | ~120 | 45% | CLAUDE.md |
| 25 | import-missing.md | 206 | ~120 | 42% | CLAUDE.md |
| 26 | size-error.md | 191 | ~120 | 37% | CLAUDE.md |
| 27 | size-warning.md | 143 | ~120 | 16% | CLAUDE.md |
| 28 | skill-missing-shebang.md | 141 | ~120 | 15% | Skills |

**Estimated time**: 10-20 minutes per doc = **1-2 hours total**

**Note**: #26 and #28 recently fixed, may just need minor tweaks

## Total Effort Estimate

| Batch | Docs | Hours | Priority |
|-------|------|-------|----------|
| Batch 1 | 6 | 4-6 | High |
| Batch 2 | 4 | 2-3 | High |
| Batch 3 | 4 | 1.5-2 | Medium |
| Batch 4 | 9 | 2-4 | Medium |
| Batch 5 | 5 | 1-2 | Low |
| **Total** | **28** | **11-17 hours** | |

## Rewrite Process (Per Doc)

### Step 1: Read Current Doc (5 mins)
- Identify core rule purpose
- Note unique/valuable examples
- Spot redundant sections
- Check for special context

### Step 2: Draft New Version (15-40 mins)
Use this checklist:

**Title & Metadata** (1 min):
```markdown
# Rule: rule-id

**Severity**: Error | Warning
**Fixable**: Yes | No
**Validator**: [validator]
**Category**: [category]

[One-sentence description]
```

**Rule Details** (5-10 mins):
- 2-3 sentences explaining what and why
- Choose best 1-2 incorrect examples
- Choose best 1-2 correct examples
- Cut everything else

**How To Fix** (3-5 mins):
- 3-5 numbered steps
- Brief, actionable
- No verbose explanations

**Options** (2-5 mins):
- Only if rule has config options
- Brief description per option
- One config example

**Standard Sections** (2-3 mins):
- When Not To Use It (2-3 sentences)
- Related Rules (2-5 links)
- Resources (implementation + tests + docs)
- Version (Available since: v1.0.0)

### Step 3: Validate (2-3 mins)
```bash
npm run audit:rule-docs
# Check this specific file
```

### Step 4: Review (2-3 mins)
- Line count within target?
- Max 2 examples per type?
- No redundant sections?
- Source links present?

## Rewrite Guidelines

### What To Cut

**Always remove**:
- ❌ Separate "Benefits" sections
- ❌ Separate "Why It Matters" sections
- ❌ Multiple organization patterns (pick best 1)
- ❌ Excessive migration steps
- ❌ Examples beyond 2 per concept
- ❌ Redundant explanations
- ❌ "Good Directory Patterns" with 3+ patterns

**Sometimes remove**:
- ⚠️ Detailed "How To Fix" if simple (e.g., "add shebang")
- ⚠️ Multiple configuration examples (keep 1)
- ⚠️ Long background/context (move to Resources)

### What To Keep

**Always keep**:
- ✅ Core rule explanation (what triggers it)
- ✅ Why the rule matters (brief, in Rule Details)
- ✅ At least 1 incorrect example
- ✅ At least 1 correct example
- ✅ Actionable fix steps (if applicable)
- ✅ Configuration options (if they exist)

**Rule-specific items**:
- ✅ Security implications (for security rules)
- ✅ Platform differences (Windows vs Unix)
- ✅ Complex validation logic explanation
- ✅ Unique edge cases

### How To Simplify Examples

**Before** (verbose):
```markdown
### Pattern 1: Flat with logical grouping
[Full directory tree example]

### Pattern 2: Feature-based organization
[Full directory tree example]

### Pattern 3: Minimal nesting
[Full directory tree example]
```

**After** (concise):
```markdown
### Correct

Well-organized structure:

[One directory tree example - the best practice]
```

**Before** (too many):
```markdown
Incorrect example 1:
[code]

Incorrect example 2:
[code]

Incorrect example 3:
[code]

Incorrect example 4:
[code]

Incorrect example 5:
[code]

Incorrect example 6:
[code]
```

**After** (focused):
```markdown
### Incorrect

[Most common mistake]

[Second most common OR most severe mistake]
```

## Tracking Progress

Create a checklist file to track rewrites:

```markdown
# Documentation Rewrite Progress

## Batch 1 (High Priority - 500+ lines)
- [ ] mcp-invalid-env-var.md (644 → ~180)
- [ ] plugin-invalid-manifest.md (630 → ~180)
- [ ] plugin-invalid-version.md (605 → ~150)
- [ ] mcp-invalid-server.md (591 → ~180)
- [ ] mcp-invalid-transport.md (585 → ~180)
- [ ] plugin-missing-file.md (574 → ~180)

## Batch 2 (High Priority - 400-500 lines)
- [ ] hooks-invalid-config.md (533 → ~200)
- [ ] hooks-invalid-event.md (460 → ~180)
- [ ] settings-invalid-permission.md (446 → ~180)
- [ ] hooks-missing-script.md (427 → ~180)

## Batch 3 (Medium Priority - 300-400 lines)
- [ ] settings-invalid-env-var.md (390 → ~180)
- [ ] settings-invalid-schema.md (365 → ~180)
- [x] skill-deep-nesting.md (336 → 124) ✅
- [ ] skill-path-traversal.md (311 → ~120)

## Batch 4 (Medium Priority - 200-300 lines)
[List continues...]

## Batch 5 (Low Priority - <200 lines)
[List continues...]

## Validation
- [ ] All docs pass `npm run audit:rule-docs`
- [ ] All docs pass `npm run check:rule-docs`
- [ ] Average line count < 200
```

## Suggested Schedule

### Week 1: High Priority (Batches 1-2)
- **Day 1**: Batch 1 docs 1-3 (2-3 hours)
- **Day 2**: Batch 1 docs 4-6 (2-3 hours)
- **Day 3**: Batch 2 docs 7-8 (1-1.5 hours)
- **Day 4**: Batch 2 docs 9-10 (1-1.5 hours)
- **Day 5**: Review and validate Batches 1-2

**Deliverable**: 10 worst offenders rewritten (6-10 hours)

### Week 2: Medium Priority (Batches 3-4)
- **Day 1**: Batch 3 docs 11-14 (1.5-2 hours)
- **Day 2**: Batch 4 docs 15-19 (1.5-2 hours)
- **Day 3**: Batch 4 docs 20-23 (1-1.5 hours)
- **Day 4**: Review and validate Batches 3-4

**Deliverable**: 13 more docs rewritten (4-6 hours)

### Week 3: Low Priority + Enforcement (Batch 5)
- **Day 1**: Batch 5 docs 24-28 (1-2 hours)
- **Day 2**: Final validation, consistency review
- **Day 3-5**: Set up enforcement (see next section)

**Deliverable**: All 28 docs rewritten + enforcement in place

## Parallelization

This work can be split:
- **Person A**: Rewrites Batches 1-2 (MCP, Plugin, Hooks docs)
- **Person B**: Rewrites Batches 3-4 (Settings, Skills docs)
- **Person C**: Rewrites Batch 5 + sets up enforcement

Or one person can do a few per day over 2-3 weeks.

## Quality Checks

After each batch:

```bash
# Check the rewritten docs
npm run audit:rule-docs

# Specific checks
npm run check:rule-docs
npm run lint:md docs/rules/

# All checks
npm run check:all
```

## After All Rewrites Complete

Then move to enforcement setup (separate document):
1. Update check-rule-docs.ts with stricter checks
2. Add markdown lint rules for our patterns
3. Add pre-commit hooks
4. Add CI checks
5. Document the process

---

## Quick Start

To begin rewriting docs immediately:

1. **Pick a doc from Batch 1** (highest impact)

2. **Open three files side-by-side**:
   - Current doc (to rewrite)
   - `docs/rules/TEMPLATE.md` (structure)
   - `docs/rules/skills/skill-deep-nesting-simplified.md` (example)

3. **Follow the rewrite process** above

4. **Validate** with `npm run audit:rule-docs`

5. **Move to next doc**

## Success Criteria

**After all rewrites**:
- ✅ All 28 docs use new format (badges at top)
- ✅ All 28 docs within line count targets
- ✅ All 28 docs have max 2 examples per type
- ✅ All 28 docs have source code links
- ✅ 0 redundant sections across all docs
- ✅ Average line count: 120-180 (down from 357)
- ✅ `npm run audit:rule-docs` shows 0 errors, 0 warnings

Then we can focus on enforcement to maintain quality going forward.
