# Phase 2.7: Skill Quality Improvements - Summary

**Created**: 2026-02-03
**Status**: Ready for Review
**Next Action**: Review plan, then execute

## What Changed

After analyzing Anthropic's "Complete Guide to Building Skills for Claude" (Jan 2026), we've identified critical improvements needed for our existing skills.

### Key Finding: Keep Current Structure

**DECISION**: Do NOT combine validate-* skills into one mega-skill.

**Rationale**:

- Anthropic emphasizes **composability**, not consolidation (p5)
- validate-all already serves as the orchestrator (matches their Pattern 2: Workflow Automation, p9)
- Individual skills serve legitimate targeted use cases
- Current naming already follows their recommendations (specific, not generic)

### What We're Adding: Phase 2.7

New phase inserted between Phase 2.6 (deprecation system) and Phase 3 (optimize-cc-md skill).

**Duration**: 1-2 days
**Goal**: Bring all 8 existing skills up to Anthropic quality standards BEFORE creating optimize-cc-md

## The 5 Improvements

### 1. Update Skill Descriptions (HIGH Priority)

**Problem**: Our descriptions are too technical, don't include trigger phrases.

**Current** (validate-cc-md):

```yaml
description: Validate CLAUDE.md files for size, imports, and structure
```

**Improved**:

```yaml
description: Validate CLAUDE.md files for size, imports, and structure. Use when you want to "check my CLAUDE.md", "audit my config", "why is my CLAUDE.md too long", or "validate imports". Checks file size limits (30KB warning, 50KB error), @import directives, frontmatter in .claude/rules/, and section organization.
```

**Pattern**: `[What] + [When] + [Trigger phrases] + [Key capabilities]`

**Applies to**: All 8 skills
**Source**: Anthropic p11 - "MUST include BOTH: What the skill does + When to use it"

### 2. Add Troubleshooting Sections (HIGH Priority)

**Problem**: Users get confused by validation errors, don't know how to fix them.

**Solution**: Add skill-specific troubleshooting (NOT generic boilerplate).

**Applies to**: Top 3 skills only

- validate-all (installation, when to use specific validators)
- validate-cc-md (file size, imports, circular dependencies)
- validate-skills (name mismatches, invalid tools, dangerous commands)

**Format** (from Anthropic p13):

```markdown
## Common Issues

### Error: "File exceeds 50KB"
**Cause**: CLAUDE.md file is too large
**Solution**: Split content into .claude/rules/ files
**Example**: Move testing to .claude/rules/testing.md
```

**Why only 3 skills?**

- Other 5 skills are simpler, errors are self-explanatory
- Anthropic only shows troubleshooting for MCP-enhanced skills (p13)
- We don't want noise, we want relevant help

**Source**: Anthropic p13, p26-27

### 3. Add Scenario-Based Examples (MEDIUM Priority)

**Problem**: Examples show usage but not workflows.

**Solution**: Add "User says → Actions → Result" examples.

**Applies to**: Top 3 skills only (validate-all, validate-cc-md, validate-skills)

**Format** (from Anthropic p12):

```markdown
## Examples

### Example 1: Fix size warnings
**User says**: "My CLAUDE.md is too long"
**What happens**:
1. Run validate-cc-md
2. Show size violations
3. Suggest moving content to @imports
**Result**: User knows which sections to split out
```

**Source**: Anthropic p12

### 4. Add Standard Fields (LOW Priority)

**Problem**: Skills lack categorization and dependency documentation.

**IMPORTANT DISCOVERY**: Official skill schema does NOT support custom `metadata` object - it has `"additionalProperties": false"`. Must use standard fields only.

**Solution**: Add standard fields to all 8 skills.

```yaml
---
name: skill-name
description: [description]
version: 1.0.0  # Already present in all skills
tags: [validation, claude-code, linting]  # NEW - for categorization
dependencies: ["npm:claude-code-lint"]  # NEW - document npm dependency
allowed-tools:  # Already present
  - Bash
  - Read
---
```

**Source**: Anthropic p11, schemas/skill-frontmatter.schema.json (line 157)

### 5. Check Progressive Disclosure (LOW Priority)

**Problem**: If SKILL.md exceeds 5000 words, it can cause context issues.

**Solution**: Check word count, move detailed content to references/ if needed.

**Current Assessment**: All skills appear under 5000 words, likely no changes needed.

**Source**: Anthropic p5, p13, p27

## Supporting Documentation Created

### skill-improvement-guidelines.md

Comprehensive reference document with:

- Anthropic principles explained
- Skill-by-skill improvement plans
- Complete examples for all improvements
- Testing checklist for Phase 5

**Location**: `docs/projects/plugin-and-md-management/skill-improvement-guidelines.md`

**Purpose**: Reference during Phase 2.7 execution

## Impact on Other Phases

### Phase 3 (optimize-cc-md) - Updated

**NEW Task 3.1**: Design progressive disclosure BEFORE building

- SKILL.md (<3000 words target)
- references/ for detailed strategies
- examples/ for before/after

**Rationale**: Anthropic warns about large context issues (p27). Design structure upfront, not retrofit later.

### Phase 4 (Documentation) - Expanded

**NEW Task 4.1**: Create plugin-specific README

- `.claude-plugin/README.md` for GitHub plugin users
- Different from npm README
- Focus on outcomes, not features (Anthropic p20)

**Updated Task 4.3**: Document skill quality standards

- Create skill development guide
- Include Phase 2.7 patterns
- Reference for future skill development

**Updated Task 4.4**: Update CONTRIBUTING.md

- Add skill quality requirements
- Require trigger phrases in PRs
- Require troubleshooting for complex skills

### Phase 5 (Testing) - Completely Rewritten

Based on Anthropic Chapter 3 (p14-17), now includes:

1. **Triggering Tests** (p15)
   - Should trigger: obvious + paraphrased queries
   - Should NOT trigger: unrelated queries
   - Test suite for all 9 skills

2. **Functional Tests** (p16)
   - Correct command execution
   - Tool usage verification
   - Error message clarity
   - Test fixtures for known issues

3. **Performance Comparison** (p16)
   - With/without skill metrics
   - Token consumption
   - User effort reduction
   - Use for release notes

**New Duration**: 2-3 days (was 1 day)

## Timeline Impact

### Original Timeline

```text
Phase 2: 3-4 days
Phase 3: 1-2 days
Phase 4: 1 day
Total: 5-7 days
```

### Updated Timeline

```text
Phase 2.6: 0.5 days (finish documentation)
Phase 2.7: 1-2 days (NEW - skill improvements)
Phase 3: 3-4 days (expanded with progressive disclosure)
Phase 4: 2-3 days (expanded with plugin README + standards)
Phase 5: 2-3 days (comprehensive testing)
Total: 9-13 days
```

**Additional Time**: 4-6 days
**Justification**: Quality over speed - better to do it right

## Questions for Review

### 1. Should we do Phase 2.7 now or skip to Phase 3?

**Recommendation**: Do 2.7 first.

- Establishes quality standards
- Makes optimize-cc-md better (we'll follow our own guidelines)
- All skills benefit, not just one
- Only 1-2 days

### 2. Is the 3-skill limit for troubleshooting correct?

**Recommendation**: Yes, start with 3.

- validate-plugin, validate-mcp, validate-settings, validate-hooks are straightforward
- Can add later if users report confusion
- Avoid documentation bloat

### 3. Should standard fields (tags, dependencies) be required or optional?

**Recommendation**: Optional for Phase 2.7, required for Phase 3 (optimize-cc-md).

- Standard fields are nice-to-have, not critical
- Don't block on it
- But new skills should include them from day 1
- All skills already have `version: 1.0.0` (discovered in audit)

### 4. Is 2-3 days for Phase 5 testing realistic?

**Recommendation**: Yes, if we create test suites properly.

- Task 5.1 (create suites): 1 day
- Task 5.2 (execute tests): 1 day
- Task 5.3-5.5 (integration + release): 0.5 day
- Testing is important, don't rush

## Next Steps

1. **Review this summary** - Discuss questions above
2. **Review updated tracker** - Ensure plan makes sense
3. **Review skill-improvement-guidelines.md** - Check examples are accurate
4. **Decide on Phase 2.7** - Do now or defer?
5. **Execute** - Start with Phase 2.6.6 (finish deprecation docs), then 2.7

## Files Modified

1. **tracker.md** - Added Phase 2.7, updated Phases 3-5
2. **skill-improvement-guidelines.md** - Created (new)
3. **phase-2-7-summary.md** - This file (new)

## Success Criteria

After Phase 2.7:

- [ ] All 8 skills have trigger phrases in descriptions
- [ ] Top 3 skills have troubleshooting sections
- [ ] Top 3 skills have scenario examples
- [ ] All 8 skills have standard fields: tags, dependencies (optional, nice-to-have)
- [ ] All 8 skills have required fields: name, description (verified in audit - all present)
- [ ] No skill exceeds 5000 words
- [ ] Quality standards documented for future development

## Risk Assessment

### Low Risk

- Adding trigger phrases (just text)
- Adding standard fields: tags, dependencies (just YAML)
- Checking word counts (quick)
- Required fields audit (already complete - all skills have name + description)

### Medium Risk

- Writing good troubleshooting (requires understanding common errors)
- Writing good examples (requires testing workflows)

### Mitigation

- Use skill-improvement-guidelines.md as reference
- Test examples manually before committing
- Ask for feedback on troubleshooting accuracy
