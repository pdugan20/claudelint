# Manual Testing Scripts

Automated helper scripts for manual testing of claudelint skills.

## Directory Structure

```text
scripts/test/manual/
├── lib/                             # Shared utilities
│   ├── build-package.sh             # Build and pack claudelint
│   ├── install-in-workspace.sh      # Install .tgz in test workspace
│   └── verify-structure.sh          # Common verification checks
├── task-1-optimize-without-skill/   # Task 1: optimize-cc-md (Without Skill Loaded)
│   ├── setup.sh                     # Setup test workspace
│   ├── verify.sh                    # Verify test results
│   └── cleanup.sh                   # Clean up test workspace
├── task-2-optimize-with-skill/      # Task 2: optimize-cc-md (With Skill Loaded)
│   ├── setup.sh                     # Uses lib/ utilities
│   ├── verify.sh                    # Uses lib/ utilities
│   └── cleanup.sh
├── task-3-triggers/                 # Task 3: Trigger Phrases for All 9 Skills
│   ├── setup.sh
│   ├── verify.sh
│   └── cleanup.sh
├── task-4-functional/               # Task 4: Functional Testing for Key Skills
│   ├── setup.sh
│   ├── verify.sh
│   └── cleanup.sh
├── task-5-quality/                  # Task 5: Quality & UX Testing
│   ├── setup.sh
│   ├── verify.sh
│   └── cleanup.sh
├── task-6-install/                  # Task 6: Plugin Installation & Integration
│   ├── setup.sh
│   ├── verify.sh
│   └── cleanup.sh
├── run-all.sh                       # Run all tasks sequentially
└── README.md                        # This file
```

## Usage

### Run All Tests

```bash
./scripts/test/manual/run-all.sh
```

This runs all 6 tasks in sequence with prompts between each step.

### Run Individual Tasks

```bash
# Task 1
./scripts/test/manual/task-1-optimize-without-skill/setup.sh
# ... perform manual testing ...
./scripts/test/manual/task-1-optimize-without-skill/verify.sh
./scripts/test/manual/task-1-optimize-without-skill/cleanup.sh

# Task 2
./scripts/test/manual/task-2-optimize-with-skill/setup.sh
# ... perform manual testing ...
./scripts/test/manual/task-2-optimize-with-skill/verify.sh
./scripts/test/manual/task-2-optimize-with-skill/cleanup.sh

# ... etc for tasks 3-6
```

## What Each Task Tests

**Task 1 (optimize-without-skill):**
Test optimize-cc-md workflow WITHOUT the skill loaded. Discover the natural approach through iteration.

**Task 2 (optimize-with-skill):**
Test optimize-cc-md WITH the skill loaded. Verify it matches the winning approach from Task 1.

**Task 3 (triggers):**
Test trigger phrases for all 9 skills. Verify 90%+ success rate with no false positives.

**Task 4 (functional):**
Test actual execution with fixtures for validate-all, validate-cc-md, and optimize-cc-md.

**Task 5 (quality):**
Test conversational quality (plain language, WHY explanations, actionable steps, error handling).

**Task 6 (install):**
Test plugin installation, skill registration, dependency detection, and package contents.

## Fixture Projects

Task 2 (and potentially others) use realistic fixture projects from `tests/fixtures/projects/`:

### react-typescript-bloated

- **Type:** React 18 + TypeScript 5.3+ project
- **Purpose:** Test optimize-cc-md skill with realistic bloat
- **Size:** 13,380 bytes → 2,856 bytes (78% reduction)
- **Issues:** Generic React patterns, TypeScript style guide, testing guidelines
- **Expected:** 3 @import files created in `.claude/rules/`

### Why Fixture Projects?

The optimize-cc-md skill needs a real project to analyze:

- CLAUDE.md references actual code files (App.tsx, index.tsx)
- Claude can read the codebase to determine what's generic vs specific
- Plugin installation can be tested realistically
- Results are meaningful and representative of actual usage

See `tests/fixtures/projects/README.md` for details.

## Shared Utilities

The `lib/` directory contains reusable scripts:

### build-package.sh

Builds and packs claudelint for testing:

```bash
source lib/build-package.sh
# Sets PACKAGE_TGZ environment variable
```

- Runs `npm run clean && npm run build`
- Creates `.tgz` file with `npm pack`
- Exports path as `PACKAGE_TGZ`

### install-in-workspace.sh

Installs claudelint in test workspace:

```bash
lib/install-in-workspace.sh <workspace-path> <package-tgz>
```

- Installs fixture dependencies (`npm install`)
- Installs claudelint from .tgz
- Creates `plugin.json` for plugin loading
- Verifies installation succeeded

### verify-structure.sh

Common verification checks:

```bash
lib/verify-structure.sh <workspace-path>
```

- Checks CLAUDE.md exists
- Reports file size
- Checks for `.claude/rules/` directory
- Counts @import files
- Validates @import syntax

## npm pack Workflow

Task 2 uses `npm pack` (not `npm link`) for realistic testing:

### Why npm pack?

- Tests the actual .tgz package users would install
- Respects package.json `files` property
- Runs install hooks (preinstall, postinstall)
- No symlink issues with build tools

### Why NOT npm link?

- Creates symlinks that break many tools
- Doesn't respect `files` property
- Skips install hooks
- Unrealistic test scenario

### How It Works

```bash
# 1. Build and pack
npm run build
npm pack  # Creates claude-code-lint-0.2.0-beta.1.tgz

# 2. Install in test workspace
cd /tmp/test-workspace
npm install /path/to/claude-code-lint-*.tgz

# 3. Plugin loads from node_modules
```

This is exactly how users would install the package.

## Documentation

See the full manual testing runbook:
`scripts/test/manual/manual-testing-runbook.md`

## Test Workspaces

All tests use isolated temporary directories:

- Task 1: `/tmp/claudelint-test-1/`
- Task 2: `/tmp/claudelint-test-2/`
- Task 3: `/tmp/claudelint-test-3/`
- Task 4: `/tmp/claudelint-test-4/`
- Task 5: `/tmp/claudelint-test-5/`
- Task 6: No temp directory (tests in repo root)

Cleanup scripts remove these directories when done.

## Hybrid Testing Approach

These scripts implement a hybrid testing approach:

- **Automated Setup:** Scripts create test workspaces and copy fixtures
- **Manual Testing:** You perform the actual skill testing
- **Automated Verification:** Scripts check for expected changes (file size, tool usage, etc.)
- **Manual Verification:** You verify conversational quality, UX, and subjective aspects

This combines the repeatability of automation with the subjective judgment needed for UX testing.

## Results Documentation

After testing, document results using:

```bash
mkdir -p scripts/test/manual/manual-test-results
cp scripts/test/manual/manual-test-results-template.md \
   scripts/test/manual/manual-test-results/$(date +%Y-%m-%d).md
```

Then fill in the template with your findings.
