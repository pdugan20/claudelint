# Migration Guide: Old to New Testing Infrastructure

## Overview

This guide documents the changes from the old manual testing approach to the new fixture-based approach.

## What's Changing

### Old Approach (Broken)

**Setup:**

```bash
# Old: scripts/test/manual/task-2-optimize-with-skill/setup.sh
cp tests/fixtures/manual/bloated-realistic.md /tmp/claudelint-test-2/CLAUDE.md
# No actual project, no plugin installation
```

**Test Workspace:**

```text
/tmp/claudelint-test-2/
└── CLAUDE.md              # Just a file, no context
```

**Problems:**

- No actual project code for CLAUDE.md to reference
- CLAUDE.md mentions "React + TypeScript" but no React code exists
- No way to install or test the plugin
- Unrealistic and meaningless testing

### New Approach (Correct)

**Setup:**

```bash
# New: scripts/test/manual/task-2-optimize-with-skill/setup.sh
npm run build && npm pack                                    # Build package
cp -r tests/fixtures/projects/react-typescript-bloated /tmp/test-2
cd /tmp/test-2
npm install /path/to/claude-code-lint-*.tgz                 # Real install
# Creates plugin.json
```

**Test Workspace:**

```text
/tmp/claudelint-test-2/
├── package.json           # Real React + TypeScript deps
├── tsconfig.json          # Real TypeScript config
├── src/
│   ├── App.tsx            # Actual React component
│   └── index.tsx          # Actual React entry point
├── CLAUDE.md              # References the real files above
├── plugin.json            # Plugin configuration
└── node_modules/
    └── claude-code-lint/  # Actually installed package
```

**Benefits:**

- Real project that CLAUDE.md references
- Actual plugin installation to test
- Realistic testing environment
- Meaningful results

## File-by-File Changes

### Created Files

| File | Purpose |
|------|---------|
| `tests/fixtures/projects/react-typescript-bloated/` | Realistic React + TS project fixture |
| `tests/fixtures/projects/react-typescript-bloated/.expected/` | Expected optimization outputs |
| `scripts/test/manual/lib/build-package.sh` | Build and pack claudelint |
| `scripts/test/manual/lib/install-in-workspace.sh` | Install package in test workspace |
| `scripts/test/manual/lib/verify-structure.sh` | Common verification checks |
| `tests/fixtures/projects/README.md` | Fixture documentation |

### Modified Files

#### scripts/test/manual/task-2-optimize-with-skill/setup.sh

**Before:**

```bash
#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../../../" && pwd)"
TEST_DIR="/tmp/claudelint-test-2"

echo "Setting up Task 2..."

# Clean up
if [ -d "$TEST_DIR" ]; then
  rm -rf "$TEST_DIR"
fi

# Create directory and copy file
mkdir -p "$TEST_DIR"
cp "$REPO_ROOT/tests/fixtures/manual/bloated-realistic.md" "$TEST_DIR/CLAUDE.md"

echo "Setup complete!"
echo "cd $TEST_DIR"
```

**After:**

```bash
#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../../../" && pwd)"
LIB_DIR="$SCRIPT_DIR/../lib"
TEST_DIR="/tmp/claudelint-test-2"

echo "Setting up Task 2: optimize-cc-md (With Skill Loaded)"

# Build and pack claudelint
source "$LIB_DIR/build-package.sh"

# Clean up
if [ -d "$TEST_DIR" ]; then
  rm -rf "$TEST_DIR"
fi

# Copy fixture (entire project)
echo "Copying react-typescript-bloated fixture..."
cp -r "$REPO_ROOT/tests/fixtures/projects/react-typescript-bloated" "$TEST_DIR"

# Install claudelint in test workspace
"$LIB_DIR/install-in-workspace.sh" "$TEST_DIR" "$PACKAGE_TGZ"

echo "Setup complete!"
echo "Test workspace: $TEST_DIR"
echo
echo "Next steps:"
echo "1. Open Claude in: $TEST_DIR"
echo "2. Trigger: 'optimize my CLAUDE.md'"
```

**Key Changes:**

- Sources build-package.sh to create .tgz
- Copies entire fixture project, not just CLAUDE.md
- Uses install-in-workspace.sh for proper installation
- Creates plugin.json for plugin loading

#### scripts/test/manual/task-2-optimize-with-skill/verify.sh

**Before:**

```bash
#!/usr/bin/env bash
set -e

TEST_DIR="/tmp/claudelint-test-2"

echo "Verifying Task 2 results..."

ORIGINAL_SIZE=12679
CURRENT_SIZE=$(wc -c < "$TEST_DIR/CLAUDE.md")
REDUCTION=$((ORIGINAL_SIZE - CURRENT_SIZE))
PERCENT=$((REDUCTION * 100 / ORIGINAL_SIZE))

echo "Original size: $ORIGINAL_SIZE bytes"
echo "Current size:  $CURRENT_SIZE bytes"
echo "Reduction:     $REDUCTION bytes ($PERCENT%)"

if [ $PERCENT -gt 50 ]; then
  echo "✓ Good reduction (>50%)"
else
  echo "✗ Low reduction (<50%)"
fi
```

**After:**

```bash
#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../../../" && pwd)"
LIB_DIR="$SCRIPT_DIR/../lib"
TEST_DIR="/tmp/claudelint-test-2"
FIXTURE_DIR="$REPO_ROOT/tests/fixtures/projects/react-typescript-bloated"

echo "Verifying Task 2 results..."

# Use common verification
"$LIB_DIR/verify-structure.sh" "$TEST_DIR"

# Task 2 specific checks
echo
echo "Task 2 Specific Checks:"

# Compare against expected
if [ -d "$FIXTURE_DIR/.expected" ]; then
  ACTUAL_SIZE=$(wc -c < "$TEST_DIR/CLAUDE.md")
  EXPECTED_SIZE=$(wc -c < "$FIXTURE_DIR/.expected/CLAUDE.md")
  SIZE_DIFF=$((ACTUAL_SIZE - EXPECTED_SIZE))

  echo "  Actual size: $ACTUAL_SIZE bytes"
  echo "  Expected size: $EXPECTED_SIZE bytes"
  echo "  Difference: $SIZE_DIFF bytes"

  if [ ${SIZE_DIFF#-} -lt 500 ]; then
    echo "  ✓ Size within acceptable range"
  else
    echo "  WARNING Size differs significantly from expected"
  fi
fi

echo
echo "Manual verification checklist:"
echo "- [ ] @import files created in .claude/rules/"
echo "- [ ] Generic React advice removed"
echo "- [ ] TypeScript style rules extracted"
echo
```

**Key Changes:**

- Uses verify-structure.sh for common checks
- Compares against .expected/ directory
- More detailed verification
- Manual checklist for human verification

#### docs/testing/manual-testing-runbook.md

**Changes:**

- Add new section: "Understanding Fixture Projects"
- Update Task 2 section completely
- Document npm pack installation workflow
- Update expected outcomes to mention @imports
- Add troubleshooting for npm installation issues

#### scripts/test/manual/README.md

**Changes:**

- Document fixture projects in `tests/fixtures/projects/`
- Explain shared utilities in `lib/`
- Document npm pack workflow
- Update directory structure diagram

### Deprecated Files

| File | Status |
|------|--------|
| `tests/fixtures/manual/bloated-realistic.md` | Deprecated - Add notice |
| `tests/fixtures/manual/bloated-realistic-expected.md` | Deprecated - Add notice |
| `tests/fixtures/manual/README.md` | Deprecated - Point to new location |

**Deprecation Notice to Add:**

```markdown
# DEPRECATED

This fixture approach has been replaced by complete project fixtures.

New location: `tests/fixtures/projects/`

See: `docs/projects/manual-testing-infrastructure-refactor/README.md`
```

## Script Behavior Changes

### Setup Scripts

**Old Behavior:**

1. Create empty directory
2. Copy single CLAUDE.md file
3. Done

**New Behavior:**

1. Build claudelint package (`npm run build && npm pack`)
2. Create test workspace directory
3. Copy entire fixture project (code + CLAUDE.md)
4. Run `npm install` for fixture dependencies
5. Install claudelint package from .tgz
6. Generate plugin.json
7. Done

### Verify Scripts

**Old Behavior:**

1. Check file size reduction
2. Basic pass/fail

**New Behavior:**

1. Check file size reduction
2. Verify .claude/rules/ directory created
3. Count @import files
4. Verify @import syntax in CLAUDE.md
5. Compare against .expected/ outputs
6. Provide manual checklist

## Testing Workflow Changes

### Old Workflow

```bash
# 1. Run setup
./scripts/test/manual/task-2-optimize-with-skill/setup.sh

# 2. Open Claude... somewhere? With plugin... somehow?
# (This part was never defined)

# 3. Ask Claude to optimize
# (But Claude has no context, just a file)

# 4. Run verify
./scripts/test/manual/task-2-optimize-with-skill/verify.sh
```

### New Workflow

```bash
# 1. Run setup (builds package, creates workspace, installs plugin)
./scripts/test/manual/task-2-optimize-with-skill/setup.sh

# 2. Open Claude in test workspace
cd /tmp/claudelint-test-2
# Open new Claude Code session here

# 3. Trigger skill (plugin is loaded via plugin.json)
# User: "optimize my CLAUDE.md"
# Claude: Analyzes actual project, creates @imports

# 4. Run verify (checks against expected outputs)
./scripts/test/manual/task-2-optimize-with-skill/verify.sh

# 5. Cleanup
./scripts/test/manual/task-2-optimize-with-skill/cleanup.sh
```

## Migration Steps

### For Developers

1. **Review new structure**
   - Read `docs/projects/manual-testing-infrastructure-refactor/README.md`
   - Understand fixture project approach

2. **Update local workflow**
   - Stop using old fixtures in `tests/fixtures/manual/`
   - Use new fixtures in `tests/fixtures/projects/`

3. **Test the new approach**
   - Run Task 2 with new scripts
   - Verify it works correctly

### For CI/CD

No changes needed (manual testing is not automated)

### For Documentation

1. Update any references to old fixture location
2. Update manual testing instructions
3. Add deprecation notices to old files

## Rollback Plan

If new approach fails:

1. Old fixtures still exist in `tests/fixtures/manual/`
2. Can revert script changes via git
3. Old runbook sections preserved in git history

**Note:** Rollback should only be temporary while fixing issues

## FAQ

**Q: Why can't we just use `npm link`?**

A: npm link creates symlinks that:

- Break many build tools
- Don't respect package.json `files` property
- Skip install hooks
- Create unrealistic test scenarios

**Q: Do we need to rebuild the package for each test?**

A: Yes, if you've made changes. But setup script handles this automatically.

**Q: Can we reuse the same fixture for multiple tests?**

A: Yes! The react-typescript-bloated fixture can be copied to different /tmp directories for different tests.

**Q: What if I need a different type of project?**

A: Create a new fixture in `tests/fixtures/projects/`. See best-practices.md for guidelines.

**Q: Why do we need .expected/ directories?**

A: To have "golden files" for comparison. Helps detect regressions when optimization logic changes.

## Support

Questions about migration? See:

- `docs/projects/manual-testing-infrastructure-refactor/README.md` - Project overview
- `docs/projects/manual-testing-infrastructure-refactor/best-practices.md` - Guidelines
- `docs/projects/manual-testing-infrastructure-refactor/TRACKER.md` - Implementation status
