# Contributing to claudelint

Thank you for your interest in contributing to claudelint! This document provides guidelines for contributing to the project.

## Quick Start for Contributors

**Want to add a validation rule?** See the [Rule Development Guide](https://claudelint.com/development/custom-rules) - this is our detailed technical guide for writing rules.

**Want to contribute in other ways?** Keep reading this document for general contribution guidelines (git workflow, testing, code style, etc.).

## Code of Conduct

This project adheres to a Code of Conduct that all contributors are expected to follow. Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before contributing.

## Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn
- Git

### Setup Development Environment

1. Fork the repository on GitHub
2. Clone your fork locally:

   ```bash
   git clone https://github.com/YOUR_USERNAME/claudelint.git
   cd claudelint
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Build the project:

   ```bash
   npm run build
   ```

5. Run tests to verify setup:

   ```bash
   npm test
   ```

6. Set up git hooks (runs automatically on install):

   ```bash
   npm run setup:hooks
   ```

## Development Workflow

### Making Changes

1. Create a new branch for your feature or fix:

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes following the code style guidelines below

3. Add or update tests for your changes

4. Run the full test suite:

   ```bash
   npm test
   ```

5. Run linting and formatting:

   ```bash
   npm run lint
   npm run format:check
   ```

6. Run validation on the project itself (dogfooding):

   ```bash
   npm run validate
   ```

**See the [CLI Reference](https://claudelint.com/guide/cli-reference) for complete command reference.**

### Code Style Guidelines

- Follow TypeScript best practices
- Use `unknown` instead of `any` for unknown types
- Add JSDoc comments to all public APIs
- Keep functions small and focused
- Write descriptive variable and function names
- Use proper type guards when narrowing types

### Diagnostic Collection Guidelines

**IMPORTANT**: Library code MUST NOT use `console` directly.

See the [Internals Guide](https://claudelint.com/development/internals#diagnostic-collection) for full details.

**Use DiagnosticCollector instead**:

```typescript
import { DiagnosticCollector } from '../utils/diagnostics';

// In functions
export function myFunction(
  param: string,
  diagnostics?: DiagnosticCollector
): Result {
  if (invalid) {
    diagnostics?.warn(
      'Invalid param',
      'MyFunction',
      'MY_001'
    );
  }
}

// In classes
export class MyClass {
  constructor(private diagnostics?: DiagnosticCollector) {}

  myMethod() {
    this.diagnostics?.error(
      'Operation failed',
      'MyClass',
      'MY_002'
    );
  }
}
```

**Why**:

- Makes library testable (no console spam during tests)
- Allows programmatic usage (consumers control output)
- Provides structured diagnostics with source tracking
- Follows industry standards (ESLint, TypeScript, Webpack)

**Where console IS allowed**:

- CLI layer only: `src/cli/utils/logger.ts`
- Output formatting: `src/utils/reporting/`
- Script utilities: `scripts/util/logger.ts`

**Enforcement**:

Library code is checked in CI and pre-commit hooks:

```bash
npm run check:logger-usage
```

### Testing Guidelines

- Write unit tests for all new validators
- Add integration tests for CLI commands
- Aim for 80%+ code coverage
- Test error conditions and edge cases
- Use descriptive test names

### Verifying Constants (Maintainers Only)

Constants like `ToolNames` and `ModelNames` must stay synchronized with Claude Code. We verify these by querying the Claude Code CLI.

**Requirements:**

- Claude Code CLI installed (`brew install claude-code` or from <https://code.claude.com/>)
- `ANTHROPIC_API_KEY` configured

**When to verify:**

- **Before releases** (required)
- After Claude Code updates
- Every 90 days (recommended)
- When users report validation issues

**How to verify:**

```bash
# Verify all constants
npm run check:constants

# Or individually
npm run check:tool-names
npm run check:model-names
```

**If drift detected:**

1. Review the output to see missing/extra values
2. Cross-check with official docs:
   - Tools: <https://code.claude.com/docs/en/settings#tools-available-to-claude>
   - Models: <https://code.claude.com/docs/en/sub-agents#supported-frontmatter-fields>
3. Update `src/schemas/constants.ts` if needed
4. Run tests: `npm test`
5. Re-verify: `npm run check:constants`
6. Re-verify: `npm run check:constants`

**Note:** Regular contributors don't need Claude CLI installed. This is only for maintainers doing releases.

### Commit Message Guidelines

Follow conventional commit format:

```text
type(scope): subject

body (optional)

footer (optional)
```

Types:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `test`: Test changes
- `refactor`: Code refactoring
- `chore`: Build/tooling changes
- `perf`: Performance improvements

Examples:

- `feat(validators): add MCP server validator`
- `fix(cli): handle missing config file gracefully`
- `docs(readme): update installation instructions`

## Project Structure

```text
claudelint/
├── src/
│   ├── validators/      # Validator implementations
│   ├── utils/           # Utility functions
│   └── cli.ts           # CLI entry point
├── tests/
│   ├── validators/      # Validator tests
│   ├── utils/           # Utility tests
│   └── integration/     # Integration tests
├── docs/projects/       # Internal project tracking
├── website/             # Documentation site (claudelint.com)
├── .claude/             # Claude Code plugin files
│   ├── skills/          # Plugin skills
│   └── hooks/           # Plugin hooks
└── scripts/             # Build and automation scripts
```

## Adding Validation Rules

claudelint uses a rule-based architecture (similar to ESLint). Contributors write individual validation rules, not validators.

**See the comprehensive [Rule Development Guide](https://claudelint.com/development/custom-rules) for:**

- Understanding rules and architecture
- Writing custom rules (external developers)
- Contributing built-in rules (contributors)
- Rule structure and metadata
- Validation logic patterns
- Testing strategies
- Auto-fix capabilities
- Best practices

**Quick checklist:**

1. ✓ Create rule file in `src/rules/{category}/{rule-id}.ts`
2. ✓ Define rule metadata (id, name, description, category, severity)
3. ✓ Implement `validate()` function
4. ✓ Add rule to category index in `src/rules/{category}/index.ts`
5. ✓ Write unit tests in `tests/rules/{category}/{rule-id}.test.ts`
6. ✓ Run `npm run docs:generate` to generate rule documentation
7. ✓ Test the rule with `npm test`
8. ✓ Run validation on project: `npm run validate`

## Contributing Skills

Skills are interactive capabilities that allow Claude to help users validate, optimize, and fix their Claude Code projects through natural conversation.

### Skill Quality Standards

All skills must follow Anthropic's best practices for skill development.

**Required for all skills:**

1. **Description with trigger phrases** - Must include what, when, triggers, and capabilities
2. **Proper naming** - No single-word verbs, use suffixes like `-all`, `-cc`, `-cc-md`
3. **Automated validation** - Must pass `claudelint validate-skills`
4. **Manual testing** - Trigger phrases tested, functionality verified

**Required for complex skills:**

1. **Examples section** - Scenario-based examples (User says → Actions → Result)
2. **Troubleshooting section** - For skills with >3 scripts or that edit files

**Recommended:**

1. **Progressive disclosure** - For skills with >3,000 words, use references/ directory

### Submitting a New Skill

Before submitting a PR:

1. **Validate structure**:

   ```bash
   claudelint validate-skills .claude/skills/your-skill
   ```

2. **Test trigger phrases**:
   - Start fresh Claude session
   - Test phrases from description field
   - Verify 90%+ trigger success rate

3. **Test functionality**:
   - Valid inputs work correctly
   - Invalid inputs detected properly
   - Edge cases handled

4. **Update documentation**:
   - Add to README.md skills list
   - Add to .claude-plugin/README.md
   - Include in PR description

### Skill PR checklist

When submitting a skill PR, include the following in your PR description (the PR template will guide you):

- Skill name and one-line description
- Trigger phrases (list at least 3)
- Confirmation that `claudelint validate-skills` passes
- Trigger phrase test results (90%+ success rate)

**Review criteria:**

- Follows naming conventions (no generic names like "format", "validate")
- Description includes trigger phrases
- Progressive disclosure used (if >3,000 words)
- Examples follow scenario format
- Troubleshooting addresses skill usage issues (not issues skill fixes)

See the [Contributing Guide](https://claudelint.com/development/contributing) for detailed requirements.

## Rule Deprecation Policy

When a rule needs to be changed or removed, follow this deprecation policy to give users time to migrate their configurations.

### When to Deprecate Rules

Deprecate a rule when:

- The rule validates a field that no longer exists in the official spec
- The rule's behavior is being merged into another rule
- The rule's validation logic is fundamentally flawed and needs a complete rewrite
- The rule is being split into multiple focused rules

**Do not deprecate** for minor fixes, bug fixes, or improved error messages - these should be updated in place.

### How to Mark a Rule as Deprecated

Add a `deprecated` field to the rule's metadata. Use boolean for simple cases, or `DeprecationInfo` object for full metadata:

```typescript
// Simple deprecation (boolean)
export const rule: Rule = {
  meta: {
    id: 'old-rule-name',
    name: 'Old Rule Name',
    description: 'Description',
    category: 'Category',
    severity: 'warn',
    fixable: false,
    deprecated: true,  // Simple boolean
    since: '0.1.0',
  },
  validate: async (context) => {
    // Rule still executes but shows deprecation warning
  },
};

// Full deprecation metadata (recommended)
export const rule: Rule = {
  meta: {
    id: 'old-rule-name',
    name: 'Old Rule Name',
    description: 'Description',
    category: 'Category',
    severity: 'warn',
    fixable: false,
    deprecated: {
      reason: 'This rule validates a field that was removed from the spec',
      replacedBy: 'new-rule-name',        // Single replacement
      // OR: replacedBy: ['rule-1', 'rule-2'],  // Multiple replacements
      deprecatedSince: '0.3.0',
      removeInVersion: '1.0.0',           // When it will be removed
      // OR: removeInVersion: null,       // Retained indefinitely
      url: 'https://github.com/pdugan20/claudelint/blob/main/docs/migrations/old-to-new.md',
    },
    since: '0.1.0',
  },
  validate: async (context) => {
    // Rule still executes but shows deprecation warning
  },
};
```

### Deprecation Lifecycle

Follow this timeline for deprecating rules:

1. **Deprecate (Minor Version)**
   - Add `deprecated` metadata to the rule
   - Rule still executes normally but shows warnings
   - Document in CHANGELOG.md under "Deprecated" section
   - Add migration guide (if replacedBy exists)

2. **Warn (2+ Minor Versions)**
   - Keep the rule for at least 2 minor versions after deprecation
   - Users see warnings when they use deprecated rules
   - `claudelint check-deprecated` shows all deprecated rules in config
   - `claudelint migrate` can auto-update configs (1:1 replacements only)

3. **Remove (Next Major Version)**
   - Remove the rule implementation in next major version (e.g., 1.0.0)
   - Document in CHANGELOG.md under "Breaking Changes"
   - Add to migration guide for major version

**Exception:** Rules deprecated before 1.0.0 may be removed in 1.0.0 if they validate non-existent fields.

### Replacement Scenarios

#### 1:1 Replacement (Single Rule)

```typescript
deprecated: {
  reason: 'Field was renamed in official spec',
  replacedBy: 'new-rule-name',
}
```

Users: Run `claudelint migrate` to auto-update configs.

#### 1:Many Replacement (Multiple Rules)

```typescript
deprecated: {
  reason: 'Rule was split into multiple focused rules',
  replacedBy: ['rule-1', 'rule-2', 'rule-3'],
}
```

Users: Must manually update configs. `claudelint migrate` will warn about this.

#### No Replacement (Removal)

```typescript
deprecated: {
  reason: 'Field no longer exists in official spec',
  // No replacedBy field
}
```

Users: Remove rule from config. `claudelint migrate` will suggest removal.

#### Retained Indefinitely

```typescript
deprecated: {
  reason: 'Deprecated but kept for backward compatibility',
  removeInVersion: null,  // Will never be removed
}
```

Users: Can keep using but should migrate to new approach when possible.

### User-Facing Commands

Users can manage deprecated rules with these commands:

- `claudelint check-deprecated` - List all deprecated rules in config
- `claudelint check-all --no-deprecated-warnings` - Suppress deprecation warnings
- `claudelint check-all --error-on-deprecated` - Treat deprecated rules as errors (CI mode)
- `claudelint migrate` - Auto-update config files (1:1 replacements)
- `claudelint migrate --dry-run` - Preview changes without writing

### Testing Deprecated Rules

Continue testing deprecated rules until removal:

```typescript
describe('old-rule-name (deprecated)', () => {
  it('should still validate correctly', async () => {
    // Test the rule's core functionality
  });

  it('should be marked as deprecated', () => {
    const rule = RuleRegistry.getRule('old-rule-name');
    expect(isRuleDeprecated(rule)).toBe(true);
  });

  it('should have replacement info', () => {
    const rule = RuleRegistry.getRule('old-rule-name');
    const info = getDeprecationInfo(rule);
    expect(info?.replacedBy).toBeDefined();
  });
});
```

## Submitting Pull Requests

1. Push your changes to your fork:

   ```bash
   git push origin feature/your-feature-name
   ```

2. Open a pull request on GitHub

3. Fill out the PR template (summary, type of change, test plan, checklist)

4. Ensure your PR title follows [Conventional Commits](https://www.conventionalcommits.org/) format (e.g., `feat: add new rule`) — this is enforced by CI

5. Wait for CI checks to pass

6. Address any review feedback

7. Once approved, a maintainer will merge your PR

## Reporting Issues

### Bug Reports

Include:

- claudelint version (`claudelint --version`)
- Node.js version (`node --version`)
- Operating system
- Steps to reproduce
- Expected vs actual behavior
- Error messages or logs

### Feature Requests

Include:

- Use case description
- Proposed solution
- Alternative solutions considered
- Impact on existing functionality

## Public API Changes

If your PR changes the public API (adds/removes/modifies exports from `src/index.ts` or types in `src/api/`):

1. **Update the API report:**

   ```bash
   npm run check:api-report:update
   ```

   This regenerates `etc/claude-code-lint.api.md`. Commit the updated report alongside your code changes.

2. **Update the snapshot test** — run `npm test -- -u --testPathPatterns=api-surface` if you intentionally added or removed exports.

3. **Add JSDoc comments** to any new public exports (enforced by ESLint).

4. **Update type assertions** in `src/index.test-d.ts` if you changed function signatures.

5. **Update documentation pages** in `website/api/` to reflect the change.

CI will fail if the API report is stale, the export snapshot doesn't match, or public exports lack JSDoc.

## Documentation

- Update README.md for user-facing changes
- All documentation lives at [claudelint.com](https://claudelint.com) (source in `website/`)
- Add JSDoc comments for API changes
- Include code examples where helpful

### Key Documentation

**For contributing code:**

- **[Custom Rules](https://claudelint.com/development/custom-rules)** - How to write validation rules (START HERE)
- **[Architecture](https://claudelint.com/development/architecture)** - System architecture and design decisions
- **[Contributing](https://claudelint.com/development/contributing)** - Contribution guidelines

**For users:**

- **[Getting Started](https://claudelint.com/guide/getting-started)** - Installation and first steps
- **[Rules Overview](https://claudelint.com/guide/rules-overview)** - Understanding validation categories
- **[Configuration](https://claudelint.com/guide/configuration)** - Configuring claudelint
- **[Troubleshooting](https://claudelint.com/guide/troubleshooting)** - Common issues and solutions

## Release Process

(For maintainers only)

**Pre-release checklist:**

1. **Verify constants are current:**

   ```bash
   npm run check:constants
   ```

   If drift detected, fix it before proceeding. See [Verifying Constants](#verifying-constants-maintainers-only) section.

2. **Run full validation:**

   ```bash
   npm run validate:all
   ```

3. **Choose release type:**

   ```bash
   # Patch (bug fixes): 0.2.0 -> 0.2.1
   npm run release:patch

   # Minor (new features): 0.2.0 -> 0.3.0
   npm run release:minor

   # Major (breaking changes): 0.2.0 -> 1.0.0
   npm run release:major

   # Or interactive (prompts for version):
   npm run release
   ```

4. **What `npm run release` does:**
   - Runs lint, test, and build
   - Analyzes commits since last release
   - Auto-generates CHANGELOG section
   - Bumps version in package.json
   - Syncs skill versions
   - Creates git commit and tag
   - Pushes to GitHub
   - Creates GitHub release
   - Publishes to npm

**Note:** The `npm run release` command uses [release-it](https://github.com/release-it/release-it) and handles all steps automatically. Manual version/changelog updates are not needed.

## CI Integration (Optional)

### Constants Verification in CI

You can optionally run constants verification in CI, but be aware of trade-offs:

**Trade-offs:**

- Pro: Catches drift automatically on every PR
- Con: Costs tokens (~$0.01 per run, adds up)
- Con: Requires `ANTHROPIC_API_KEY` in CI secrets
- Con: Adds ~30 seconds to CI runs

**Example GitHub Actions workflow:**

```yaml
# .github/workflows/verify-constants.yml (optional)
name: Verify Constants

on:
  pull_request:
  schedule:
    # Run weekly on Mondays at 9am UTC
    - cron: '0 9 * * 1'

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with:
          node-version: '20'
      - run: npm ci

      # Install Claude CLI (example for Linux)
      - name: Install Claude CLI
        run: |
          curl -fsSL https://code.claude.com/install.sh | sh
          echo "$HOME/.local/bin" >> $GITHUB_PATH

      - name: Verify Constants
        run: npm run check:constants
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
```

**Recommendation:** Don't enable this initially. Manual verification before releases is sufficient for most projects.

## Getting Help

- Read the [documentation](https://claudelint.com)
- Search [existing issues](https://github.com/pdugan20/claudelint/issues)
- Ask in [discussions](https://github.com/pdugan20/claudelint/discussions)
- Open a new issue if needed

## License

By contributing to claudelint, you agree that your contributions will be licensed under the MIT License.
