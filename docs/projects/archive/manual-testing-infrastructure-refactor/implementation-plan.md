# Implementation Plan

## Overview

Detailed technical plan for refactoring the manual testing infrastructure to use realistic fixture projects and proper npm package installation.

## Architecture

### Current State (Broken)

```text
scripts/test/manual/task-2-optimize-with-skill/
└── setup.sh
    ├── Creates /tmp/claudelint-test-2/
    ├── Copies bloated-realistic.md as CLAUDE.md
    └── NO No actual project
    └── NO No plugin installation
    └── NO No code for CLAUDE.md to reference
```

### Target State

```text
tests/fixtures/projects/
└── react-typescript-bloated/
    ├── README.md              # Documents what this tests
    ├── package.json           # Real React + TypeScript deps
    ├── tsconfig.json          # TypeScript config
    ├── src/
    │   ├── App.tsx            # Minimal React component
    │   └── index.tsx          # Entry point
    ├── CLAUDE.md              # Bloated with generic React advice
    └── .expected/             # Expected optimization results
        ├── CLAUDE.md          # Optimized version
        └── .claude/
            └── rules/
                ├── react-patterns.md
                ├── typescript-style.md
                └── testing.md

scripts/test/manual/task-2-optimize-with-skill/
└── setup.sh
    ├── Builds claudelint (npm run build)
    ├── Creates package (npm pack)
    ├── Copies fixture to /tmp/
    ├── Installs .tgz in test workspace
    ├── Generates plugin.json
    └── YES Ready for realistic testing
```

## Phase 1: Create Fixture Projects

### 1.1 Primary Fixture: react-typescript-bloated

**Location:** `tests/fixtures/projects/react-typescript-bloated/`

**Purpose:** Test optimize-cc-md skill with bloated React + TypeScript project

**Files to Create:**

#### package.json

```json
{
  "name": "react-typescript-bloated-fixture",
  "version": "1.0.0",
  "private": true,
  "description": "Test fixture for claudelint - bloated React TypeScript project",
  "scripts": {
    "dev": "echo 'Fixture project - no real dev server'",
    "build": "echo 'Fixture project - no real build'",
    "test": "echo 'Fixture project - no real tests'",
    "lint": "echo 'Fixture project - no real linter'"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.3.3"
  }
}
```

#### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src"]
}
```

#### src/App.tsx

```tsx
import React from 'react';

interface AppProps {
  title?: string;
}

export function App({ title = 'Hello World' }: AppProps) {
  return (
    <div className="app">
      <h1>{title}</h1>
      <p>This is a minimal React component for testing claudelint.</p>
    </div>
  );
}
```

#### src/index.tsx

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

#### CLAUDE.md

Copy and adapt from `tests/fixtures/manual/bloated-realistic.md` but ensure it:

- References React and TypeScript specifically
- Mentions the actual files (App.tsx, index.tsx)
- Includes generic React patterns that should be removed
- Includes TypeScript style rules that should be @imports
- Total size: ~12KB

#### .expected/CLAUDE.md

The optimized version:

- Size: ~3KB (75% reduction)
- Only project-specific content
- References to @import files
- Clear, focused instructions

#### .expected/.claude/rules/react-patterns.md

```markdown
# React Patterns

## Component Structure

- Use functional components with hooks
- Props interface defined above component
- Export component as named export

## State Management

- useState for local state
- useContext for shared state
- Avoid prop drilling
```

#### .expected/.claude/rules/typescript-style.md

```markdown
# TypeScript Style

## General

- Use strict mode
- Prefer interfaces over types for objects
- Use type for unions and primitives

## Naming

- Interfaces: PascalCase (UserProfile)
- Types: PascalCase (UserId)
- Props interfaces: ComponentNameProps
```

#### .expected/.claude/rules/testing.md

```markdown
# Testing Guidelines

## Test Structure

- One describe block per component
- Group related tests with nested describe
- Use test() for individual cases

## Conventions

- Mock external dependencies
- Test user-visible behavior, not implementation
- Keep tests deterministic
```

#### README.md

```markdown
# React TypeScript Bloated Fixture

## Purpose

Test the optimize-cc-md skill with a realistic React + TypeScript project
containing a bloated CLAUDE.md file.

## Project Structure

- React 18 with TypeScript
- Minimal but functional components
- Real dependencies in package.json
- TypeScript configuration

## Issues in CLAUDE.md

1. **Generic React Advice** (Lines 50-120)
   - Basic component patterns Claude already knows
   - Generic hooks usage guidelines
   - Standard React best practices

2. **TypeScript Style Rules** (Lines 150-200)
   - Generic TS style guide
   - Should be extracted to @import

3. **Testing Guidelines** (Lines 250-300)
   - Generic testing advice
   - Not project-specific
   - Should be @import

4. **Duplicated Content** (Multiple sections)
   - Code style mentioned 3 times
   - Testing mentioned 2 times

## Expected Optimization

### Before
- Size: ~12KB (400+ lines)
- All content inline
- Lots of generic advice

### After
- Size: ~3KB (150 lines)
- 3 @import files created
- Only project-specific content remains

### Files Created
- .claude/rules/react-patterns.md
- .claude/rules/typescript-style.md
- .claude/rules/testing.md

## Testing

1. Copy fixture to /tmp/test-workspace
2. Install claudelint plugin
3. Trigger optimize-cc-md skill
4. Verify against .expected/
```

### 1.2 Secondary Fixture: node-express-api

**Location:** `tests/fixtures/projects/node-express-api/`

**Purpose:** Test with different project type (Node.js API, not React)

**Note:** Defer until after primary fixture is working

### 1.3 Edge Case Fixtures

**Location:** `tests/fixtures/projects/`

**Fixtures:**

- `already-optimized/` - CLAUDE.md already at 3KB, minimal changes
- `existing-imports/` - CLAUDE.md already has @import files
- `no-package-json/` - Edge case of non-npm project

**Note:** Defer until after primary fixture is working

## Phase 2: Update Setup Scripts

### 2.1 Create Shared Utilities

**Location:** `scripts/test/manual/lib/`

#### build-package.sh

```bash
#!/usr/bin/env bash
#
# Build and pack claudelint for testing
#
# Usage: source build-package.sh
# Sets: PACKAGE_TGZ environment variable

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"

echo "Building claudelint package..."
cd "$REPO_ROOT"

# Clean and build
npm run clean
npm run build

# Create package
PACKAGE_TGZ=$(npm pack --silent 2>&1 | tail -1)

# Get absolute path
PACKAGE_TGZ="$REPO_ROOT/$PACKAGE_TGZ"

echo "Package created: $PACKAGE_TGZ"
export PACKAGE_TGZ
```

#### install-in-workspace.sh

```bash
#!/usr/bin/env bash
#
# Install claudelint package in test workspace
#
# Usage: install-in-workspace.sh <workspace-path> <package-tgz>

set -e

WORKSPACE=$1
PACKAGE_TGZ=$2

if [ -z "$WORKSPACE" ] || [ -z "$PACKAGE_TGZ" ]; then
  echo "ERROR: Missing required arguments"
  echo "Usage: $0 <workspace-path> <package-tgz>"
  exit 1
fi

if [ ! -d "$WORKSPACE" ]; then
  echo "ERROR: Workspace not found: $WORKSPACE"
  exit 1
fi

if [ ! -f "$PACKAGE_TGZ" ]; then
  echo "ERROR: Package not found: $PACKAGE_TGZ"
  exit 1
fi

cd "$WORKSPACE"

# Install dependencies (if package.json has any)
if [ -f "package.json" ]; then
  echo "Installing fixture dependencies..."
  npm install --silent
fi

# Install claudelint from .tgz
echo "Installing claudelint from package..."
npm install --save-dev "$PACKAGE_TGZ" --silent

# Create plugin.json
echo "Creating plugin.json..."
cat > plugin.json <<EOF
{
  "name": "claudelint",
  "version": "1.0.0",
  "plugins": ["claude-code-lint"]
}
EOF

echo "Installation complete!"
```

#### verify-structure.sh

```bash
#!/usr/bin/env bash
#
# Common verification checks for optimized CLAUDE.md
#
# Usage: verify-structure.sh <workspace-path>

set -e

WORKSPACE=$1

if [ -z "$WORKSPACE" ]; then
  echo "ERROR: Missing workspace path"
  exit 1
fi

cd "$WORKSPACE"

# Check CLAUDE.md exists
if [ ! -f "CLAUDE.md" ]; then
  echo "✗ CLAUDE.md not found"
  exit 1
fi

echo "✓ CLAUDE.md exists"

# Check file size
FILE_SIZE=$(wc -c < "CLAUDE.md")
echo "  Size: $FILE_SIZE bytes"

# Check .claude/rules/ directory
if [ -d ".claude/rules" ]; then
  echo "✓ .claude/rules/ directory exists"
  IMPORT_COUNT=$(find .claude/rules -name "*.md" | wc -l)
  echo "  Import files: $IMPORT_COUNT"
else
  echo "  (No .claude/rules/ directory)"
fi

# Validate CLAUDE.md syntax (basic check for @import)
if grep -q "@import" CLAUDE.md; then
  echo "✓ CLAUDE.md contains @import directives"
else
  echo "  (No @import directives found)"
fi
```

### 2.2 Update Task 2 Setup Script

**Location:** `scripts/test/manual/task-2-optimize-with-skill/setup.sh`

```bash
#!/usr/bin/env bash
#
# Setup for Task 2: optimize-cc-md (With Skill Loaded)
#
# Creates test workspace with realistic React project and
# installs claudelint plugin for testing.
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"
LIB_DIR="$SCRIPT_DIR/../lib"
TEST_DIR="/tmp/claudelint-test-2"

echo "Setting up Task 2: optimize-cc-md (With Skill Loaded)"
echo

# Step 1: Build and pack claudelint
source "$LIB_DIR/build-package.sh"

# Step 2: Clean up any existing test directory
if [ -d "$TEST_DIR" ]; then
  echo "Removing existing test directory..."
  rm -rf "$TEST_DIR"
fi

# Step 3: Copy fixture to test directory
echo "Copying react-typescript-bloated fixture..."
cp -r "$REPO_ROOT/tests/fixtures/projects/react-typescript-bloated" "$TEST_DIR"

# Step 4: Install claudelint in test workspace
"$LIB_DIR/install-in-workspace.sh" "$TEST_DIR" "$PACKAGE_TGZ"

# Step 5: Verify setup
echo
echo "Setup complete!"
echo
echo "Test workspace: $TEST_DIR"
echo "CLAUDE.md size: $(wc -c < "$TEST_DIR/CLAUDE.md") bytes"
echo
echo "Next steps:"
echo "1. Open a NEW Claude Code session"
echo "2. cd $TEST_DIR"
echo "3. Trigger the optimize-cc-md skill:"
echo "   - 'optimize my CLAUDE.md'"
echo "   - 'can you help me improve my CLAUDE.md file?'"
echo "4. Compare workflow to Task 1"
echo "5. Run: ./scripts/test/manual/task-2-optimize-with-skill/verify.sh"
echo
```

### 2.3 Update Task 2 Verify Script

**Location:** `scripts/test/manual/task-2-optimize-with-skill/verify.sh`

```bash
#!/usr/bin/env bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"
LIB_DIR="$SCRIPT_DIR/../lib"
TEST_DIR="/tmp/claudelint-test-2"
FIXTURE_DIR="$REPO_ROOT/tests/fixtures/projects/react-typescript-bloated"

echo "Verifying Task 2 results..."
echo

# Use common verification
"$LIB_DIR/verify-structure.sh" "$TEST_DIR"

# Task 2 specific checks
echo
echo "Task 2 Specific Checks:"

# Compare against expected
if [ -d "$FIXTURE_DIR/.expected" ]; then
  echo "  Comparing against expected output..."

  # Size comparison
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
echo "Verification complete!"
echo
echo "Manual verification checklist:"
echo "- [ ] @import files created in .claude/rules/"
echo "- [ ] Generic React advice removed"
echo "- [ ] TypeScript style rules extracted"
echo "- [ ] Testing guidelines extracted"
echo "- [ ] CLAUDE.md focuses on project-specific content"
echo "- [ ] Workflow felt natural and intuitive"
echo
```

## Phase 3: Update Verification Scripts

All Task 2 verification completed in Phase 2.2.

Defer updating Task 1 verification until Task 2 is proven to work.

## Phase 4: Update Documentation

### 4.1 Update Manual Testing Runbook

**File:** `docs/testing/manual-testing-runbook.md`

**Changes:**

1. Update Task 1 section to mention it tests baseline (no fixture project needed)
2. Completely rewrite Task 2 section:
   - Explain fixture project approach
   - Document npm pack installation
   - Update expected outcomes
3. Add new section: "Understanding Fixture Projects"
4. Add troubleshooting for npm installation issues

### 4.2 Update Test Scripts README

**File:** `scripts/test/manual/README.md`

**Changes:**

1. Add section on fixture projects
2. Document shared utilities in lib/
3. Explain npm pack workflow
4. Update directory structure diagram

### 4.3 Create Fixture Documentation

**File:** `tests/fixtures/projects/README.md`

```markdown
# Test Fixture Projects

This directory contains realistic project fixtures for manual testing of
claudelint skills.

## Structure

Each subdirectory is a complete, minimal project with:
- Real code and dependencies
- Bloated CLAUDE.md file
- Expected optimization results in `.expected/`
- Documentation of what it tests

## Available Fixtures

- **react-typescript-bloated** - Primary test case for optimize-cc-md skill
- More fixtures coming soon...

## Usage

Fixtures are copied to /tmp/ by setup scripts and used for manual testing.
See `docs/testing/manual-testing-runbook.md` for complete workflow.

## Adding New Fixtures

See `docs/projects/manual-testing-infrastructure-refactor/best-practices.md`
for guidelines on creating new fixture projects.
```

## Phase 5: Testing and Validation

### 5.1 Validate Fixture Project

1. Manually create `tests/fixtures/projects/react-typescript-bloated/`
2. Verify TypeScript compiles: `cd fixture && npx tsc --noEmit`
3. Verify package.json is valid: `cd fixture && npm install`
4. Review CLAUDE.md for realistic bloat

### 5.2 Test Setup Script

1. Run `./scripts/test/manual/task-2-optimize-with-skill/setup.sh`
2. Verify package builds and packs successfully
3. Verify fixture copied to /tmp/
4. Verify claudelint installed in test workspace
5. Verify plugin.json created

### 5.3 Manual Test Execution

1. Open Claude in /tmp/claudelint-test-2
2. Trigger optimize-cc-md skill
3. Verify skill recognizes the project type
4. Verify skill creates @import files
5. Verify conversation quality

### 5.4 Test Verification Script

1. Run `./scripts/test/manual/task-2-optimize-with-skill/verify.sh`
2. Verify all checks pass
3. Compare results against expected

### 5.5 Iteration

1. Document any issues found
2. Refine fixture or scripts as needed
3. Repeat until Task 2 works reliably

## Dependencies

**Phase 1** must complete before Phase 2 (can't setup without fixtures)
**Phase 2** must complete before Phase 3 (verification depends on setup)
**Phase 2** must complete before Phase 4 (can't document what doesn't exist)
**All phases** must complete before Phase 5 (testing validates everything)

## Rollout Strategy

### Minimal Viable Product (MVP)

1. Create react-typescript-bloated fixture only
2. Update Task 2 scripts only
3. Test Task 2 manually
4. Update runbook for Task 2

**Rationale:** Prove the approach works before expanding to all tasks

### Full Rollout

After MVP validated:

1. Create additional fixtures (node-express-api, edge cases)
2. Update remaining task scripts (Tasks 3-6)
3. Update all runbook sections
4. Create comprehensive fixture suite

## Success Metrics

**MVP Success:**

- [ ] Task 2 setup script runs without errors
- [ ] Test workspace has real project with claudelint installed
- [ ] Manual testing produces meaningful results
- [ ] Verification script validates outputs
- [ ] Results are repeatable

**Full Rollout Success:**

- [ ] All 6 manual tests use realistic fixtures
- [ ] All setup scripts use npm pack
- [ ] All verification scripts work correctly
- [ ] Runbook updated for all tasks
- [ ] Can complete full manual test suite start-to-finish

## Timeline Estimate

**Phase 1 (Fixtures):** 2-3 hours

- Create react-typescript-bloated: 1.5 hours
- Create expected outputs: 1 hour
- Create README: 0.5 hours

**Phase 2 (Scripts):** 1 hour

- Shared utilities: 0.5 hours
- Update Task 2 scripts: 0.5 hours

**Phase 3 (Verification):** Included in Phase 2

**Phase 4 (Documentation):** 1 hour

- Update runbook: 0.5 hours
- Update READMEs: 0.5 hours

**Phase 5 (Testing):** 1-2 hours

- Test and iterate: 1-2 hours

**Total MVP:** 5-7 hours

## Next Steps

1. Review this implementation plan
2. Confirm approach with project owner
3. Begin Phase 1: Create react-typescript-bloated fixture
4. Proceed through phases sequentially
