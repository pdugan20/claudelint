# Test Fixture Projects

This directory contains realistic project fixtures for manual testing of claudelint skills.

## Purpose

These fixtures provide complete, minimal projects with bloated CLAUDE.md files for testing the optimize-cc-md skill and other validation features in realistic scenarios.

## Structure

Each subdirectory is a complete, self-contained project with:

- **Real code** - Actual source files that CLAUDE.md references
- **Real dependencies** - Valid package.json with working npm install
- **Bloated CLAUDE.md** - Realistic bloat patterns to test optimization
- **Expected outputs** - The optimal result in `.expected/` directory
- **Documentation** - README.md explaining what the fixture tests

## Available Fixtures

### valid-complete

**Purpose:** False-positive detection. All 10 config file types present and valid.

Running `claudelint check-all` produces zero errors and zero warnings.

**Config files:** CLAUDE.md, settings.json, hooks.json, .mcp.json, lsp.json, SKILL.md, AGENT.md, output style .md, plugin.json (in .claude-plugin/), package.json.

**Tested by:** `tests/integration/fixture-projects.test.ts`

### invalid-all-categories

**Purpose:** Pipeline validation. Intentional errors in every validator category.

Running `claudelint check-all` produces errors from all 10 validators (CLAUDE.md, Skills, Agents, Output Styles, LSP, Settings, Hooks, MCP, Plugin, Commands).

**Tested by:** `tests/integration/fixture-projects.test.ts`

### react-typescript-bloated

**Purpose:** Primary test fixture for optimize-cc-md skill

**Project Type:** React 18 + TypeScript 5.3+

**Issues Present:**

- Generic React patterns (should be extracted)
- TypeScript style guide (should be extracted)
- Testing guidelines (should be extracted)
- Verbose explanations and duplication

**Size:**

- Before: 13,380 bytes (~400 lines)
- After: 2,856 bytes (~110 lines)
- Reduction: 78%

**Expected Outputs:**

- 3 @import files created in `.expected/.claude/rules/`
- CLAUDE.md reduced to project-specific content only

## Using Fixtures

Fixtures are designed to be copied to temporary test workspaces:

```bash
# Copy fixture to test workspace
cp -r tests/fixtures/projects/react-typescript-bloated /tmp/test-workspace

# Install dependencies
cd /tmp/test-workspace
npm install

# Install claudelint
npm install /path/to/claude-code-lint-*.tgz

# Create plugin.json
cat > plugin.json <<EOF
{
  "name": "claudelint",
  "plugins": ["claude-code-lint"]
}
EOF

# Ready for testing
```

This is automated by the setup scripts in `scripts/test/manual/`.

## Fixture Requirements

When creating new fixtures, follow these guidelines:

### 1. Complete But Minimal

- Include real code that CLAUDE.md references
- Keep codebase small (2-5 files typical)
- Use real dependencies (not mock)
- Ensure TypeScript/linting passes

### 2. Realistic Bloat

- Generic advice Claude already knows
- Content that should be @imports
- Duplication and verbose explanations
- Reference actual files in the project

### 3. Expected Outputs

- Create `.expected/CLAUDE.md` with optimized version
- Create `.expected/.claude/rules/` with @import files
- Document expected size reduction
- Show what issues were fixed

### 4. Documentation

- README.md explaining purpose
- List specific issues present
- Document expected optimization results
- Include testing instructions

## Validation

Each fixture should pass these checks:

```bash
cd tests/fixtures/projects/<fixture-name>

# Dependencies install successfully
npm install

# TypeScript compiles (if applicable)
npx tsc --noEmit

# Linters pass (if configured)
npm run lint

# Expected outputs exist
test -f .expected/CLAUDE.md
test -d .expected/.claude/rules
```

## Best Practices

Follow industry patterns from ESLint, TypeScript-ESLint, and similar tools:

- **One fixture per scenario** - Hyper-targeted, single test case
- **Checked into version control** - Part of the repo
- **Documented** - Clear README explaining what it tests
- **Versioned** - Update when tool behavior changes
- **Realistic** - Matches actual user projects

See `docs/projects/manual-testing-infrastructure-refactor/best-practices.md` for detailed guidelines.

## Forward-Compatibility Strategy

Integration tests pin exact error and warning counts for each fixture. This prevents "silent test pollution" when new rules are added to the codebase.

**How it works:**

1. `invalid-all-categories` pins `24 errors` and `35 warnings`
2. When a new rule is added and fires against the fixture, the count changes
3. The integration test fails, forcing an intentional decision:
   - Add the rule ID to the fixture's assertions, OR
   - Update the fixture to not trigger the new rule

**When adding a new rule:**

1. Run `npx jest tests/integration/fixture-projects.test.ts`
2. If counts change, update the pinned values in the test file
3. Add specific rule ID assertions for the new rule
4. If the new rule needs fixture data, add it to the appropriate fixture
5. If the new rule needs a dedicated fixture, create a new fixture project

## Adding New Fixtures

To add a new fixture:

1. Create directory: `tests/fixtures/projects/<fixture-name>/`
2. Build minimal but real project
3. Create bloated CLAUDE.md with realistic issues
4. Create `.expected/` with optimized outputs
5. Document in README.md
6. Add entry to this file
7. Update test scripts if needed

## Related Documentation

- **Testing Infrastructure Project:** `docs/projects/manual-testing-infrastructure-refactor/`
- **Manual Testing Runbook:** `docs/testing/manual-testing-runbook.md`
- **Test Scripts:** `scripts/test/manual/`
- **Best Practices:** `docs/projects/manual-testing-infrastructure-refactor/best-practices.md`

## Notes

- Fixtures are copied to `/tmp/` for testing (not modified in place)
- Each test run starts from clean fixture copy
- Expected outputs serve as "golden files" for comparison
- Size differences within ±500 bytes are acceptable
