# Deadcode Cleanup Project

Comprehensive analysis and action plan for removing deadcode from the claudelint codebase.

## Quick Links

- **[TOOLS-AND-BEST-PRACTICES.md](TOOLS-AND-BEST-PRACTICES.md)** * - Industry tools & automation (start here!)
- **[FINDINGS.md](FINDINGS.md)** - Manual analysis results
- **[ACTION-CHECKLIST.md](ACTION-CHECKLIST.md)** - Step-by-step tasks with commands
- **[PROPOSAL.md](PROPOSAL.md)** - Full proposal with implementation plan

## Executive Summary

Analysis completed: 2026-01-30

**Result**: Codebase in excellent health with minimal deadcode

**Found**:
- 8 orphaned build artifacts (safe to remove immediately)
- 3 intentional stub files (keep for future phases)
- 2 utility scripts (need usage review)
- 2 deprecated code items (need investigation before removal)

**Recommendation**: Clean build artifacts now, investigate other items when time permits.

## Quick Start

### Option 0: Install Automated Tools (Recommended - 5 minutes)

**Best approach**: Use industry-standard automated detection tools:

```bash
# Install Knip (industry-leading deadcode detector)
npm install --save-dev knip

# Run comprehensive scan
npx knip

# Add to package.json
npm pkg set scripts.check:deadcode="knip"
```

See **[TOOLS-AND-BEST-PRACTICES.md](TOOLS-AND-BEST-PRACTICES.md)** for complete setup guide.

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

### TOOLS-AND-BEST-PRACTICES.md *

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
├── TOOLS-AND-BEST-PRACTICES.md *   # Industry tools & automation (NEW!)
├── FINDINGS.md                      # Manual analysis results
├── ACTION-CHECKLIST.md              # Step-by-step manual tasks
└── PROPOSAL.md                      # Full proposal (reference)
```

## Status

| Phase | Status | Priority | Estimated Time |
|-------|--------|----------|----------------|
| Remove build artifacts | [ ] Not started | HIGH | 10 minutes |
| Investigate deprecated code | [ ] Not started | MEDIUM | 30 minutes |
| Investigate utility scripts | [ ] Not started | MEDIUM | 30 minutes |
| Remove deprecated code | [ ] Not started | LOW | 30 minutes |
| Archive utility scripts | [ ] Not started | LOW | 20 minutes |
| Update documentation | [ ] Not started | LOW | 45 minutes |

**Total Estimated Time**: 2.5 - 3 hours (can be done incrementally)

## Key Findings

### 1. Orphaned Build Artifacts (HIGH Priority)

**8 files in dist/** left over from refactored code:
- cli-hooks.* (4 files)
- security-validators.* (4 files)

**Action**: Run `npm run clean && npm run build`

**Risk**: None

### 2. Intentional Stubs (Keep)

**3 scripts** for future phases:
- check-duplicate-fixtures.ts (Phase 4)
- check-duplicate-logic.ts (Phase 4)
- check-rule-coverage.ts (Phase 6)

**Action**: Document in roadmap

**Risk**: None

### 3. Utility Scripts (Investigate)

**2 scripts** not in package.json:
- fix-markdown.js (manual MD fixer)
- remove-emojis.js (batch emoji removal)

**Action**: Check usage, consider archiving

**Risk**: Low

### 4. Deprecated Code (Investigate)

**2 items** marked @deprecated:
- isRuleDisabled() method (wrapper)
- ValidatorOptions type (alias)

**Action**: Search for usage, remove if safe

**Risk**: Medium (might break external plugins)

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
