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
