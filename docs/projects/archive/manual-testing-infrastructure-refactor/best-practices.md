# Best Practices for Testing Linter Tools

## Overview

This document consolidates industry best practices from established linting and validation tools (ESLint, TypeScript-ESLint, Prettier, markdownlint) that should guide our testing infrastructure.

## 1. Fixture Project Organization

### Pattern: Hyper-Targeted Fixtures

**Principle:** One fixture per specific test case

**Structure:**

```text
tests/fixtures/projects/
├── <scenario-name>/          # Kebab-case, descriptive
│   ├── README.md             # Documents what this tests
│   ├── package.json          # Real dependencies
│   ├── src/                  # Minimal but real code
│   │   └── ...
│   ├── CLAUDE.md             # The bloated config
│   └── .expected/            # Expected outputs
│       ├── CLAUDE.md         # Optimized version
│       └── .claude/          # Expected @import files
│           └── rules/
└── ...
```

**Benefits:**

- Easy to debug when tests fail
- Clear what each fixture is testing
- Can add new scenarios without affecting others
- Version controlled test cases

### Pattern: Complete But Minimal

**Principle:** Include everything needed, nothing more

**What to Include:**

- package.json with actual dependencies (not empty)
- Real source files that CLAUDE.md references
- Configuration files (.eslintrc, tsconfig.json, etc.)
- Minimal but functional code

**What to Exclude:**

- node_modules/ (never committed)
- Build artifacts
- Unnecessary dependencies
- Complex business logic

**Example:** React TypeScript fixture

```json
{
  "name": "react-typescript-bloated-fixture",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "typescript": "^5.0.0"
  }
}
```

```tsx
// src/App.tsx - Minimal but real
import React from 'react';

export function App() {
  return <div>Hello World</div>;
}
```

### Pattern: Document Expected Behavior

**Principle:** Each fixture includes documentation

**README.md Template:**

```markdown
# Fixture Name

## Purpose
Brief description of what this fixture tests.

## Issues Present
- Issue 1: Generic React advice (lines 50-100)
- Issue 2: Duplicated testing guidelines (lines 120-150)
- Issue 3: Code style that should be @import (lines 200-250)

## Expected Optimization
- File size: 12KB -> 3KB (75% reduction)
- @imports created: 3 files
- Sections removed: 5 generic sections

## Testing
1. Copy to test workspace
2. Install claudelint
3. Run optimize-cc-md skill
4. Verify against .expected/
```

## 2. Package Installation Testing

### Pattern: Test Real Installation (npm pack)

**Principle:** Test what users actually install

**Workflow:**

```bash
# 1. Build the package
npm run build

# 2. Create distributable package
npm pack
# Output: claude-code-lint-0.2.0-beta.1.tgz

# 3. Install in test project
cd /tmp/test-workspace
npm install /path/to/claude-code-lint-0.2.0-beta.1.tgz

# 4. Verify installation
npm list claude-code-lint
```

**Why NOT npm link:**

- Symlinks break build tools
- Doesn't respect `files` property
- Skips install hooks
- Creates false positives

**Why npm pack:**

- Identical to published package
- Tests actual user experience
- Runs all hooks
- Respects package.json configuration

### Pattern: Fresh Installation Each Test

**Principle:** Avoid state contamination

**Setup Script Responsibilities:**

```bash
#!/usr/bin/env bash
# 1. Clean up previous test workspace
rm -rf /tmp/test-workspace

# 2. Copy fixture to test workspace
cp -r tests/fixtures/projects/react-typescript-bloated /tmp/test-workspace

# 3. Install dependencies
cd /tmp/test-workspace
npm install

# 4. Install claudelint from .tgz
npm install /path/to/claude-code-lint-*.tgz

# 5. Generate plugin.json
cat > plugin.json <<EOF
{
  "name": "claudelint",
  "plugins": ["claude-code-lint"]
}
EOF

# 6. Ready for testing
echo "Open Claude in: /tmp/test-workspace"
```

## 3. Hybrid Testing Approach

### Pattern: Automate What Machines Do Well

**Automated:**

- Setup (copy fixtures, install packages)
- Verification (file sizes, structure checks)
- Teardown (cleanup test workspaces)
- Regression checks (compare outputs)

**Manual:**

- UX evaluation (is conversation helpful?)
- Edge case discovery (what breaks?)
- Quality assessment (are explanations clear?)
- Workflow validation (does it feel natural?)

### Pattern: Document Manual Steps

**Principle:** Manual tests should be repeatable

**Runbook Structure:**

```markdown
## Test N: Description

### Setup (Automated)
Run: `./scripts/test/manual/task-N/setup.sh`

### Manual Testing
1. Open Claude in: /tmp/test-workspace
2. Trigger skill with: "optimize my CLAUDE.md"
3. Observe and note:
   - Did it analyze before acting?
   - Were explanations clear?
   - Was the workflow intuitive?

### Verification (Automated)
Run: `./scripts/test/manual/task-N/verify.sh`

Expected:
- File size reduced by >70%
- @imports created in .claude/rules/
- CLAUDE.md validates successfully

### Cleanup (Automated)
Run: `./scripts/test/manual/task-N/cleanup.sh`
```

## 4. Test Organization

### Pattern: Co-locate Related Tests

**Directory Structure:**

```text
scripts/test/manual/
├── lib/                         # Shared utilities
│   ├── build-package.sh         # npm run build + npm pack
│   ├── install-in-workspace.sh  # Install .tgz in test dir
│   └── verify-structure.sh      # Common verification checks
├── task-1-optimize-without-skill/
│   ├── setup.sh
│   ├── verify.sh
│   └── cleanup.sh
├── task-2-optimize-with-skill/
│   ├── setup.sh                 # Uses lib/build-package.sh
│   ├── verify.sh                # Uses lib/verify-structure.sh
│   └── cleanup.sh
└── ...
```

**Benefits:**

- DRY principle (shared utilities in lib/)
- Consistent patterns across all tasks
- Easy to update common functionality
- Clear what each task does

### Pattern: Fail Fast, Fail Clear

**Principle:** Tests should fail obviously with clear messages

**Example:**

```bash
# Bad - Silent failure
cp fixture.md /tmp/test/CLAUDE.md

# Good - Explicit error handling
if ! cp fixture.md /tmp/test/CLAUDE.md; then
  echo "ERROR: Failed to copy fixture to test workspace"
  echo "  Source: fixture.md"
  echo "  Destination: /tmp/test/CLAUDE.md"
  exit 1
fi
```

## 5. Fixture Maintenance

### Pattern: Fixtures are Code

**Principle:** Treat fixtures with same care as production code

**Best Practices:**

- YES Check fixtures into version control
- YES Review fixture changes in PRs
- YES Update fixtures when tool behavior changes
- YES Document why each fixture exists
- NO Don't commit node_modules/
- NO Don't hardcode absolute paths
- NO Don't include secrets or credentials

### Pattern: Version with Tool

**Principle:** Fixtures should match tool capabilities

**When to Update:**

- Tool adds new detection capabilities
- Tool changes optimization strategies
- New edge cases discovered
- Bug fixes change expected behavior

**Version Control:**

```bash
# Fixture README.md
## Version
Created for: claudelint v0.2.0
Last updated: 2026-02-04
Reason: Added @import detection
```

## 6. Verification Patterns

### Pattern: Graduated Checks

**Principle:** Check multiple levels of success

#### Level 1: Structural (Automated)

```bash
# Did basic structure change?
- File size reduced?
- Expected files created?
- Syntax still valid?
```

#### Level 2: Content (Automated)

```bash
# Did content change correctly?
- Generic sections removed?
- @imports have correct content?
- CLAUDE.md references @imports?
```

#### Level 3: Quality (Manual)

```bash
# Is the result actually better?
- More focused on project specifics?
- Still readable and clear?
- Preserves important context?
```

### Pattern: Snapshot Testing

**Principle:** Detect unexpected changes

**Implementation:**

```bash
# After optimizing, save result
cp /tmp/test/CLAUDE.md tests/fixtures/projects/react-typescript-bloated/.expected/CLAUDE.md

# In CI, compare against snapshot
diff tests/fixtures/projects/react-typescript-bloated/.expected/CLAUDE.md \
     /tmp/test/CLAUDE.md
```

**When to Update Snapshots:**

- Intentional behavior change
- Improved optimization algorithm
- Bug fix changes output

## 7. Documentation

### Pattern: Self-Documenting Tests

**Principle:** Tests should explain themselves

**Elements:**

- Descriptive names (task-2-optimize-with-skill, not task-2)
- README in each fixture explaining purpose
- Comments in scripts explaining WHY, not WHAT
- Runbook connects all pieces together

### Pattern: Record Decisions

**Principle:** Document why things are done this way

**Architecture Decision Records (ADRs):**

```markdown
## Decision: Use npm pack instead of npm link

### Context
Need to test claudelint installation before publishing to npm.

### Options
1. npm link (symlink)
2. npm pack (create .tgz)
3. yalc (specialized tool)

### Decision
Use npm pack

### Rationale
- Tests actual installation experience
- Respects package.json files property
- Runs install hooks
- No symlink issues

### Consequences
- Must rebuild and repack for each test
- Slower than npm link
- More realistic results
```

## Summary

**Core Principles:**

1. Fixtures are complete, minimal, realistic projects
2. Test real installation with npm pack
3. Automate setup/verification, manual UX testing
4. One fixture per scenario
5. Document everything
6. Version fixtures with tool
7. Fail fast with clear errors

**These patterns ensure:**

- Repeatable tests
- Realistic validation
- Easy debugging
- Maintainable test suite
- Confidence in releases
