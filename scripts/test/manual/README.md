# Manual Testing Scripts

Automated helper scripts for manual testing of claudelint skills.

## Directory Structure

```text
scripts/test/manual/
├── task-1-optimize-without-skill/  # Task 1: optimize-cc-md (Without Skill Loaded)
│   ├── setup.sh                    # Setup test workspace
│   ├── verify.sh                   # Verify test results
│   └── cleanup.sh                  # Clean up test workspace
├── task-2-optimize-with-skill/     # Task 2: optimize-cc-md (With Skill Loaded)
│   ├── setup.sh
│   ├── verify.sh
│   └── cleanup.sh
├── task-3-triggers/            # Task 3: Trigger Phrases for All 9 Skills
│   ├── setup.sh
│   ├── verify.sh
│   └── cleanup.sh
├── task-4-functional/          # Task 4: Functional Testing for Key Skills
│   ├── setup.sh
│   ├── verify.sh
│   └── cleanup.sh
├── task-5-quality/             # Task 5: Quality & UX Testing
│   ├── setup.sh
│   ├── verify.sh
│   └── cleanup.sh
├── task-6-install/             # Task 6: Plugin Installation & Integration
│   ├── setup.sh
│   ├── verify.sh
│   └── cleanup.sh
├── run-all.sh                  # Run all tasks sequentially
└── README.md                   # This file
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

## Documentation

See the full manual testing runbook:
`docs/testing/manual-testing-runbook.md`

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
cp docs/testing/manual-test-results-template.md \
   docs/testing/manual-test-results/$(date +%Y-%m-%d).md
```

Then fill in the template with your findings.
