# Research Findings: Testing Infrastructure Best Practices

## Summary

Research conducted on 2026-02-04 into industry best practices for testing CLI tools, linters, and npm packages. This document consolidates findings from ESLint, TypeScript-ESLint, Prettier, and npm ecosystem best practices.

## Key Findings

### 1. Fixture Projects Should Live In-Repo (Monorepo Pattern)

**Source:** [Monorepo Testing Benefits - CircleCI](https://circleci.com/blog/monorepo-dev-practices/)

**Finding:**

- Keep test fixtures in the same repository as the tool being tested
- Standard location: `tests/fixtures/` or `tests/fixtures/projects/`
- ESLint, TypeScript-ESLint, Prettier all follow this pattern

**Benefits:**

- Simplifies CI/CD (everything in one place)
- Easier to keep fixtures in sync with code changes
- Version control for test cases
- No external dependencies for testing

**Implementation:**

- Create `tests/fixtures/projects/` directory
- Each subdirectory is a complete, minimal project
- Check fixtures into version control

### 2. Use `npm pack` for Local Testing (Not `npm link`)

**Sources:**

- [Use npm pack to test your packages locally - DEV Community](https://dev.to/scooperdev/use-npm-pack-to-test-your-packages-locally-486e)
- [Testing npm packages before publishing - Medium](https://medium.com/@vcarl/problems-with-npm-link-and-an-alternative-4dbdd3e66811)

**Finding:**
`npm link` has significant problems:

- Creates symlinks that break many build tools
- Doesn't respect the `files` property in package.json
- Doesn't run preinstall/postinstall hooks
- Common source of "works on my machine" issues

**Recommended Alternative: `npm pack`**

- Creates `.tgz` file exactly as it would be published to npm
- Tests the ACTUAL package that users would install
- Respects all package.json properties
- Runs all installation hooks

**Workflow:**

```bash
# In the package being tested
npm run build
npm pack
# Creates: claude-code-lint-0.2.0-beta.1.tgz

# In the test project
npm install /path/to/claude-code-lint-0.2.0-beta.1.tgz
```

**Quote from research:**
> "For testing a package before publishing, npm pack seems like a much better alternative because npm link does not care about the files property."

### 3. Fixture Organization Patterns

**Sources:**

- [TypeScript-ESLint Rule Tester](https://typescript-eslint.io/packages/rule-tester/)
- [TypeScript-ESLint Fixture Migration Issue](https://github.com/typescript-eslint/typescript-eslint/issues/6065)

**Finding:**
Each fixture should be **hyper-targeted** to test one specific scenario:

- Use kebab-case naming for fixture directories
- Each fixture is a complete but minimal project
- Include only what's necessary to reproduce the test case
- Document what each fixture is testing

**Example Structure:**

```text
tests/fixtures/projects/
├── react-typescript-bloated/    # Tests bloated React project CLAUDE.md
├── node-express-minimal/        # Tests minimal Node.js API
├── already-optimized/           # Tests edge case of optimal CLAUDE.md
└── existing-imports/            # Tests CLAUDE.md with existing @imports
```

**Key Principle:**
> "Each fixture should only cover one hyper-targeted, specific case to keep things easy to debug and review."

### 4. Testing CLI Tools - Best Practices

**Source:** [4 Techniques for Testing Python Command-Line (CLI) Apps – Real Python](https://realpython.com/python-cli-testing/)

**Finding:**
Hybrid approach combining automated and manual testing:

- **Automated Setup:** Scripts create reproducible test environments
- **Manual Execution:** Human tests the actual UX and conversational quality
- **Automated Verification:** Scripts check expected outcomes
- **Documentation:** Runbooks guide manual testers through process

**Benefits:**

- Combines repeatability of automation with human judgment
- Tests both technical correctness and user experience
- Scalable across multiple test scenarios
- Documents expected behavior

### 5. Realistic Test Environments

**Source:** [End-to-end Testing - Tools and Frameworks Guide for 2026](https://bugbug.io/blog/test-automation/end-to-end-testing/)

**Finding:**
E2E tests must run in **realistic environments** with:

- Real project structure (not just isolated files)
- Actual dependencies installed
- Proper configuration files
- Real or realistic data

**Quote from research:**
> "Unlike unit tests, E2E tests provide broader coverage by running in a realistic test environment that ensures test environment availability and allows the use of realistic data or sanitized production data for testing purposes."

**Application to claudelint:**

- Test workspaces need real package.json, src/, tests/, etc.
- CLAUDE.md should reference actual files that exist
- Plugin installation should match real user workflow

### 6. Monorepo Testing Considerations

**Sources:**

- [Benefits and challenges of monorepo development practices - CircleCI](https://circleci.com/blog/monorepo-dev-practices/)
- [A Guide to Monorepos for Front-end Code - Toptal](https://www.toptal.com/front-end/guide-to-monorepos)

**Finding:**
For testing within monorepos:

- Tests for single package should live in that package
- E2E tests can be in their own package or with the app
- Shared test utilities can be extracted

**Benefits:**

- "Comprehensive testing becomes easier, as you can run tests across all projects simultaneously"
- "If you update a shared library to introduce a feature, you can find out much faster if it breaks other services"

**Challenges:**

- "Testing and deployment could sometimes get harder and more time-consuming"
- Initial setup is more complex

**Application:**
Keep fixtures in `tests/fixtures/projects/` within the claudelint repo itself.

## Recommendations for Claudelint

Based on research findings:

### 1. Create Fixture Projects

**Location:** `tests/fixtures/projects/`

**Required Fixtures:**

- `react-typescript-bloated/` - Primary test case, matches current bloated-realistic.md
- `node-express-api/` - Alternative project type
- `already-optimized/` - Edge case testing
- `existing-imports/` - Tests handling of existing @import files

**Each fixture includes:**

- Complete package.json with real dependencies
- Real source code (minimal but functional)
- Bloated CLAUDE.md that references the actual code
- README.md documenting what issues it contains
- Expected optimized output

### 2. Update Test Scripts

**Setup scripts should:**

1. Run `npm run build` in claudelint repo
2. Run `npm pack` to create .tgz
3. Copy fixture to /tmp/claudelint-test-N/
4. Run `npm install` in test workspace to install .tgz
5. Generate plugin.json in test workspace
6. Display instructions for user

**Verification scripts should:**

1. Check file size reduction
2. Verify @import files created
3. Check .claude/rules/ structure exists
4. Validate CLAUDE.md syntax
5. Compare against expected output

### 3. Update Documentation

**Manual testing runbook needs:**

- Updated workflow reflecting fixture projects
- Instructions for building and packing claudelint
- Clear steps for each test case
- Expected outcomes for each fixture

### 4. Maintain Repeatability

**Key principles:**

- Fixtures are checked into version control
- Scripts automate setup and teardown
- Each test run starts from clean state (copy from fixtures)
- Results should be identical across runs

## Implementation Priorities

1. **High Priority:**
   - Create react-typescript-bloated fixture (primary test case)
   - Update Task 2 scripts to use npm pack
   - Update runbook with new workflow

2. **Medium Priority:**
   - Create node-express-api fixture (alternative scenario)
   - Create already-optimized fixture (edge case)
   - Update remaining task scripts

3. **Low Priority:**
   - Create existing-imports fixture (advanced edge case)
   - Create Python fixture (language diversity)
   - Additional edge cases as discovered

## References

All links and sources are embedded throughout this document. Key resources:

- ESLint Testing Documentation
- TypeScript-ESLint patterns
- npm pack best practices
- Monorepo testing strategies
- CLI testing techniques
