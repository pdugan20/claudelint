# Contributing to claudelint

Thank you for your interest in contributing to claudelint! This document provides guidelines for contributing to the project.

## Quick Start for Contributors

**Want to add a validation rule?** See [docs/contributing-rules.md](docs/contributing-rules.md) - this is our detailed technical guide for writing rules.

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

### Code Style Guidelines

- Follow TypeScript best practices
- Use `unknown` instead of `any` for unknown types
- Add JSDoc comments to all public APIs
- Keep functions small and focused
- Write descriptive variable and function names
- Use proper type guards when narrowing types

### Testing Guidelines

- Write unit tests for all new validators
- Add integration tests for CLI commands
- Aim for 80%+ code coverage
- Test error conditions and edge cases
- Use descriptive test names

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
├── docs/                # Documentation
├── .claude/             # Claude Code plugin files
│   ├── skills/          # Plugin skills
│   └── hooks/           # Plugin hooks
└── scripts/             # Build and automation scripts
```

## Adding Validation Rules

claudelint uses a rule-based architecture (similar to ESLint). Contributors write individual validation rules, not validators.

**See the comprehensive [Rule Development Guide](docs/rule-development.md) for:**

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
6. ✓ Document rule in `docs/rules/{category}/{rule-id}.md`
7. ✓ Test the rule with `npm test`
8. ✓ Run validation on project: `npm run validate`

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

3. Fill out the PR template with:
   - Description of changes
   - Issue number (if applicable)
   - Testing performed
   - Screenshots (if UI changes)

4. Wait for CI checks to pass

5. Address any review feedback

6. Once approved, a maintainer will merge your PR

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

## Documentation

- Update README.md for user-facing changes
- Update docs/ for detailed documentation
- Add JSDoc comments for API changes
- Include code examples where helpful

### Key Documentation

**For contributing code:**

- **[Rule Development Guide](docs/rule-development.md)** - How to write validation rules (START HERE)
- **[Architecture Documentation](docs/architecture.md)** - System architecture and design decisions

**For users:**

- **[Getting Started](docs/getting-started.md)** - Installation and first steps
- **[Validation Reference](docs/validation-reference.md)** - Understanding validation categories
- **[Rule Reference](docs/rules/)** - Individual documentation for all rules
- **[Configuration Guide](docs/configuration.md)** - Configuring claudelint
- **[Troubleshooting](docs/troubleshooting.md)** - Common issues and solutions

## Release Process

(For maintainers only)

1. Update version in package.json
2. Update CHANGELOG.md
3. Commit changes: `git commit -m "chore: release v1.2.3"`
4. Tag release: `git tag v1.2.3`
5. Push: `git push && git push --tags`
6. GitHub Actions will automatically publish to npm

## Getting Help

- Read the [documentation](docs/)
- Search [existing issues](https://github.com/pdugan20/claudelint/issues)
- Ask in [discussions](https://github.com/pdugan20/claudelint/discussions)
- Open a new issue if needed

## License

By contributing to claudelint, you agree that your contributions will be licensed under the MIT License.
