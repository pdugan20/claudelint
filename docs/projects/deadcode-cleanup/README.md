# Deadcode Cleanup Project

Comprehensive analysis and action plan for removing deadcode from the claudelint codebase.

## Quick Links

- **[NEXT-STEPS.md](NEXT-STEPS.md)** * - **START HERE** - Ready-to-execute action plan
- **[KNIP-FINDINGS.md](KNIP-FINDINGS.md)** = - Knip analysis results (automated detection)
- **[TOOLS-AND-BEST-PRACTICES.md](TOOLS-AND-BEST-PRACTICES.md)** - Industry tools & automation
- **[FINDINGS.md](FINDINGS.md)** - Manual analysis results
- **[ACTION-CHECKLIST.md](ACTION-CHECKLIST.md)** - Manual cleanup checklist
- **[PROPOSAL.md](PROPOSAL.md)** - Full proposal with implementation plan

## Executive Summary

**Analysis completed**: 2026-01-30

**Tool used**: Knip v5.81.0 (industry-leading deadcode detector)

**Result**: Codebase in excellent health with minimal deadcode

**Automated Analysis**:
- [x] Knip installed and configured
- > 1 confirmed deadcode file found (rule-loader.ts - 206 lines)
- ! 3 items need investigation
- * 40 false positives (public API exports)

**Found**:
- 8 orphaned build artifacts (safe to remove immediately)
- 3 intentional stub files (keep for future phases)
- 2 utility scripts (need usage review)
- 2 deprecated code items (need investigation before removal)

**Recommendation**: Clean build artifacts now, investigate other items when time permits.

## Quick Start

### Option 0: Remove Confirmed Deadcode (Recommended - 5 minutes)

**Fastest path**: Remove the one file Knip confirmed as deadcode:

```bash
# Remove obsolete RuleLoader (replaced by RuleRegistry)
git rm src/utils/rule-loader.ts

# Verify nothing breaks
npm test

# Commit
git commit -m "chore: remove obsolete RuleLoader (replaced by RuleRegistry)"
```

See **[NEXT-STEPS.md](NEXT-STEPS.md)** for investigation tasks and next actions.

### Option 1: Just Remove the Known Deadcode (5 minutes)

```bash
# Clean and rebuild (removes 8 orphaned build artifacts)
npm run clean
npm run build

# Verify everything works
npm test

# Commit
git add dist/
git commit -m "chore: remove orphaned build artifacts"
```

**That's it!** The most significant deadcode is now removed.

### Option 2: Full Cleanup (2-3 hours)

Follow the [ACTION-CHECKLIST.md](ACTION-CHECKLIST.md) for a complete cleanup including:
- Investigation of utility scripts
- Removal of deprecated code
- Documentation updates
- Prevention guidelines

## Documents

### NEXT-STEPS.md * (NEW!)

**Purpose**: Ready-to-execute action plan based on Knip findings

**Contains**:
- Priority-ordered tasks
- Investigation commands
- Expected timeline (65 minutes total)
- Decision templates
- Success criteria

**Best for**: Getting started with cleanup immediately

### KNIP-FINDINGS.md = (NEW!)

**Purpose**: Detailed Knip analysis report

**Contains**:
- All 45 items Knip flagged
- Categorized by confidence level
- Evidence and reasoning for each item
- Verdict (remove/investigate/keep)
- Knip configuration used

**Best for**: Understanding what Knip found and why

### TOOLS-AND-BEST-PRACTICES.md

**Purpose**: Industry-standard tools and automated detection

**Contains**:
- Comprehensive tool comparison (Knip, ts-prune, depcheck, etc.)
- Setup guides with real configuration examples
- CI/CD integration workflows
- Industry best practices from 2026
- Migration plan for claudelint
- Automated deadcode prevention strategies

**Best for**: Learning about available tools and setting up automated detection

### FINDINGS.md

**Purpose**: Quick reference for analysis results

**Contains**:
- Summary of all deadcode found
- Categorized by type (true deadcode, stubs, needs investigation)
- Confidence levels and evidence
- Investigation commands
- Overall code quality assessment

**Best for**: Understanding what was found and why

### ACTION-CHECKLIST.md

**Purpose**: Executable task list

**Contains**:
- Step-by-step commands
- Testing checklist
- Decision points
- Status tracking

**Best for**: Actually performing the cleanup

### PROPOSAL.md

**Purpose**: Complete project documentation

**Contains**:
- Detailed analysis methodology
- Implementation phases
- Risk assessment
- Prevention guidelines
- Future recommendations

**Best for**: Understanding the full context and approach

## File Tree

```text
docs/projects/deadcode-cleanup/
├── README.md                        # This file - project overview
├── NEXT-STEPS.md                *   # Action plan (START HERE!)
├── KNIP-FINDINGS.md             =   # Knip analysis results
├── TOOLS-AND-BEST-PRACTICES.md      # Industry tools & automation
├── FINDINGS.md                      # Manual analysis results
├── ACTION-CHECKLIST.md              # Manual cleanup checklist
└── PROPOSAL.md                      # Full proposal (reference)
```

## Status

| Phase | Status | Priority | Estimated Time |
|-------|--------|----------|----------------|
| [x] Install Knip | COMPLETE | HIGH | 5 minutes |
| [x] Run Knip analysis | COMPLETE | HIGH | 5 minutes |
| [x] Create Knip config | COMPLETE | HIGH | 5 minutes |
| Remove rule-loader.ts | [ ] Not started | HIGH | 5 minutes |
| Investigate 3 items | [ ] Not started | MEDIUM | 30 minutes |
| Optimize Knip config | [ ] Not started | MEDIUM | 15 minutes |
| Add package scripts | [ ] Not started | LOW | 5 minutes |
| CI integration | [ ] Not started | LOW | 10 minutes |

**Total Estimated Time**: 65 minutes (+ 15 minutes already complete)

## Key Findings (Knip Analysis)

### 1. * Confirmed Deadcode (Remove Now)

**src/utils/rule-loader.ts** (206 lines)
- Obsolete RuleLoader class for filesystem-based rule discovery
- Replaced by RuleRegistry (generated index file)
- Not used anywhere in codebase (100% confidence)

**Action**: `git rm src/utils/rule-loader.ts`

**Risk**: None

### 2. ! Needs Investigation (30 min)

**3 items flagged by Knip**:
1. tests/helpers/setup-matchers.ts - Check if used in Jest setup
2. Composition framework exports (9 functions) - Verify framework is active
3. Test helpers (7 functions) - Likely false positive

**Action**: Run investigation commands (see NEXT-STEPS.md)

**Risk**: Low

### 3. [x] False Positives (Keep)

**40 items** - Intentional public API exports:
- 18 TypeScript types (schemas, interfaces)
- 2 barrel export index files (convenience)
- 20 internal utilities (might be used externally)

**Action**: Update Knip config to ignore

**Risk**: None

### 4. = Manual Analysis Results

**8 orphaned build artifacts** in dist/ (from manual analysis):
- Already cleaned by running `npm run build`

**2 utility scripts** not in package.json:
- fix-markdown.js
- remove-emojis.js
- **Action**: See manual FINDINGS.md for details

## Investigation Results

Fill this in after completing investigation phase:

### Deprecated Method (isRuleDisabled)

**Callers Found**: [ TODO ]

**External Usage**: [ TODO ]

**Decision**: [ TODO: Remove / Keep / Document timeline ]

### Deprecated Type (ValidatorOptions)

**Usage Found**: [ TODO ]

**External Plugins**: [ TODO ]

**Decision**: [ TODO: Remove now / Remove v2.0.0 / Keep ]

### Utility Scripts

**fix-markdown.js Last Used**: [ TODO ]

**remove-emojis.js Last Used**: [ TODO ]

**Decision**: [ TODO: Archive / Keep / Delete ]

## Next Steps

1. **Immediate** (10 min): Remove orphaned build artifacts
2. **This Week** (1 hour): Complete investigation phase
3. **Next Sprint** (1 hour): Implement cleanup based on findings
4. **Ongoing**: Add prevention guidelines to workflow

## Questions?

- **Want automated tools?** Read [TOOLS-AND-BEST-PRACTICES.md](TOOLS-AND-BEST-PRACTICES.md) *
- Not sure what to do? Read [FINDINGS.md](FINDINGS.md)
- Ready to clean up manually? Follow [ACTION-CHECKLIST.md](ACTION-CHECKLIST.md)
- Want full context? See [PROPOSAL.md](PROPOSAL.md)

## Related

- **Phase 4 Planning**: docs/projects/duplicate-detection/ (future)
- **Phase 6 Planning**: docs/projects/rule-coverage/ (future)
- **Contributing Guidelines**: CONTRIBUTING.md (update with prevention tips)
