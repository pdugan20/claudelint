# Rule Implementation Project

Complete implementation of 197 validation rules using a schema-first approach with Zod.

## Current Status

**Status**: 22/219 rules complete (10%)
**Current Phase**: Fixing immediate blockers (ghost rules + broken documentation)

## Quick Stats

- **Fully Implemented**: 22 rules (10%)
- **Partial Implementation (Ghost Rules)**: 20 rules (9%)
- **Not Started**: 177 rules (81%)

## Project Documents

###  [STATUS-REPORT.md](./STATUS-REPORT.md) - Read This First

Comprehensive assessment of the project comparing documentation claims vs actual codebase implementation. Includes:
- Reality check: What's actually implemented
- Ghost rules problem: 20 rules with logic but no rule IDs
- Documentation accuracy analysis
- Immediate blockers and fixes needed

###  [IMPLEMENTATION-CHECKLIST.md](./IMPLEMENTATION-CHECKLIST.md) - Single Source of Truth

Complete checklist of all outstanding work organized by priority:
- Immediate priorities (blockers)
- Short-term work (1-2 weeks)
- Long-term work (4-8 weeks)
- All 177 unimplemented rules listed by validator


###  Reference Documents

- [IMPLEMENTATION-TRACKER.md](./IMPLEMENTATION-TRACKER.md) - Detailed phase-by-phase tracking (needs update)
- [RULE-TRACKER.md](./RULE-TRACKER.md) - Complete catalog of all 219 rules
- [NEXT-STEPS-PLAN.md](./NEXT-STEPS-PLAN.md) - Detailed action plan (comprehensive but verbose)
- [REVIEW-2026-01-28.md](./REVIEW-2026-01-28.md) - Analysis of current issues
- [archive/](./archive/) - Historical planning and analysis documents

## Immediate Next Steps

1. **Fix Ghost Rules** (2-4 hours) - Add rule IDs to 20 partial implementations ← HIGHEST PRIORITY
2. **Document 15 Implemented Rules** (1-2 hours) - Create missing documentation
3. **Review Git Changes** (30-60 min) - Commit or revert uncommitted validator changes

## Project Approach

### Schema-First Validation

Instead of manual validation logic, we define Zod schemas that declaratively describe valid data structures:

**Before (Manual):**
```typescript
if (!frontmatter.name) {
  this.reportError('Missing name');
}
if (frontmatter.name.length > 64) {
  this.reportError('Name too long');
}
// ... repeat for every field
```

**After (Schema):**
```typescript
const SkillFrontmatterSchema = z.object({
  name: z.string().max(64),
  description: z.string().min(20).max(1024),
  model: z.enum(['sonnet', 'opus', 'haiku']).optional()
});

const result = SkillFrontmatterSchema.safeParse(frontmatter);
```

### Benefits

- **Code Reduction**: 78% fewer lines through schema reuse
- **Better Reliability**: Schema-driven validation is more consistent
- **Easier Testing**: Schemas are straightforward to test
- **Self-Documenting**: Schemas describe valid data structures
- **Auto-Generated Registry**: Rule metadata extracted from schemas

## Implementation Types

Rules are categorized by implementation approach:

- **Schema** (140 rules, 64%): Defined in Zod schema - 1 line each
- **Refinement** (45 rules, 21%): Custom Zod refinement - 5-10 lines each
- **Logic** (34 rules, 15%): Custom validation logic - 20-50 lines each

## Ghost Rules Problem

Twenty rules have validation logic implemented but don't pass rule IDs to `reportError()` or `reportWarning()` calls. This means users cannot configure these rules (enable/disable, change severity) and they don't appear properly in lint output.

**Impact by Validator:**
- Skills: 6 ghost rules
- Settings: 3 ghost rules
- Hooks: 3 ghost rules
- MCP: 3 ghost rules
- Plugin: 2 ghost rules
- Agents: 1 ghost rule
- CLAUDE.md: 1 ghost rule

**Fix**: Add rule ID parameter to each reportError/reportWarning call. See IMPLEMENTATION-CHECKLIST.md for details.

## Progress Tracking

- See [IMPLEMENTATION-CHECKLIST.md](./IMPLEMENTATION-CHECKLIST.md) for complete task list
- Update checklist as tasks are completed
- Current milestone: Fix immediate blockers
- Next milestone: 25% complete (55/219 rules)

## Related Documents

- [Architecture](../../architecture.md) - Overall claudelint architecture
- [Validator Development Guide](../../validator-development-guide.md) - How to write validators
- [Composition Framework](../../composition-framework.md) - Validation composition patterns
