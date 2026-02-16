---
outline: 2
---

# Contributing

This guide covers everything you need to contribute to claudelint: setting up your dev environment, writing rules, submitting PRs, and maintaining the project.

The most common contribution is [adding a validation rule](#adding-validation-rules).

## Code of Conduct

Please read the [Code of Conduct](https://github.com/pdugan20/claudelint/blob/main/CODE_OF_CONDUCT.md) before contributing.

## Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn
- Git

### Dev environment setup

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

### Making changes

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
   npm run check:self
   ```

See [CLI Reference](/guide/cli-reference) for complete command reference.

### Previewing linter output

To see what claudelint errors and warnings look like in the terminal, run it against the test fixture projects:

```bash
# All categories with intentional errors/warnings (agents, skills, hooks, etc.)
npm run check:fixtures:invalid

# Clean run (zero issues)
npm run check:fixtures:valid

# Or point individual validators at fixtures
npx claudelint validate-agents --path tests/fixtures/projects/invalid-all-categories
```

The `invalid-all-categories` fixture has intentional violations across all 10 validator categories. The `valid-complete` fixture has valid files for every category and should produce zero issues. Both are tested in CI via `tests/integration/fixture-projects.test.ts`.

### Code style

- Follow TypeScript best practices
- Use `unknown` instead of `any` for unknown types
- Add JSDoc comments to all public APIs
- Keep functions small and focused
- Write descriptive variable and function names
- Use proper type guards when narrowing types

### Diagnostic collection

Library code uses `DiagnosticCollector` instead of `console` for all output. See [Architecture](/development/architecture) for full details.

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

This makes the library testable, allows programmatic usage, and provides structured diagnostics with source tracking.

Console is only allowed in the CLI layer (`src/cli/utils/logger.ts`), output formatting (`src/utils/reporting/`), and script utilities (`scripts/util/logger.ts`). This is enforced by `npm run check:logger-usage` in CI and pre-commit hooks.

### Testing

- Write unit tests for all new rules
- Add integration tests for CLI commands
- Aim for 80%+ code coverage
- Test error conditions and edge cases
- Use descriptive test names

### Verifying constants

Constants like `ToolNames` and `ModelNames` must stay synchronized with Claude Code. This is verified by querying the Claude Code CLI and is only required for maintainers doing releases.

Requirements: Claude Code CLI installed (from [code.claude.com](https://code.claude.com/)) and `ANTHROPIC_API_KEY` configured.

```bash
# Verify all constants
npm run check:constants

# Or individually
npm run check:tool-names
npm run check:model-names
```

If drift is detected:

1. Review the output to see missing/extra values
2. Cross-check with official docs: [Tools](https://code.claude.com/docs/en/settings#tools-available-to-claude), [Models](https://code.claude.com/docs/en/sub-agents#supported-frontmatter-fields)
3. Update `src/schemas/constants.ts` if needed
4. Run tests: `npm test`
5. Re-verify: `npm run check:constants`

See the `scripts/check/` directory for detailed documentation on verification scripts.

### Commit messages

Follow [Conventional Commits](https://www.conventionalcommits.org/) format (enforced by commitlint):

```text
type(scope): subject

body (optional)

footer (optional)
```

Types: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`, `perf`

Examples:

- `feat(validators): add MCP server validator`
- `fix(cli): handle missing config file gracefully`
- `docs(readme): update installation instructions`

## Adding Validation Rules

claudelint uses a rule-based architecture similar to ESLint. Contributors write individual validation rules, not validators.

See the [Custom Rules Guide](/development/custom-rules) for the full walkthrough: rule structure, validation patterns, testing strategies, auto-fix, and best practices.

Checklist:

1. Create rule file in [`src/rules/{category}/{rule-id}.ts`](https://github.com/pdugan20/claudelint/tree/main/src/rules/)
2. Define rule metadata (id, name, description, category, severity)
3. Add `meta.docs` documentation metadata (see [schema](/development/overview#ruledocumentation-schema) and example below)
4. Implement `validate()` function
5. Add rule to category index in [`src/rules/{category}/index.ts`](https://github.com/pdugan20/claudelint/tree/main/src/rules/)
6. Write unit tests in [`tests/rules/{category}/{rule-id}.test.ts`](https://github.com/pdugan20/claudelint/tree/main/tests/rules/)
7. Test the rule with `npm test`
8. Run `npm run docs:generate` to verify documentation generates
9. Run validation on project: `npm run validate`

### Rule docs metadata

Rule documentation is auto-generated from `meta.docs` in each rule's source file. Include a `docs` property so the documentation site stays in sync automatically. See the [RuleDocumentation schema](/development/overview#ruledocumentation-schema) for all available fields.

```typescript
docs: {
  recommended: true,
  summary: 'Hook command references a script file that does not exist',
  details: 'When a hook command points to a script, the referenced file must exist on disk...',
  examples: {
    incorrect: [{ description: 'Missing script', code: `command: "bash .claude/hooks/missing.sh"` }],
    correct: [{ description: 'Existing script', code: `command: "bash .claude/hooks/validate.sh"` }],
  },
  howToFix: 'Create the missing script or update the command path.',
  whenNotToUse: 'Disable if hook scripts are generated at build time.',
}
```

For rules with configurable options, add `optionExamples` and `relatedRules` — see the [schema](/development/overview#ruledocumentation-schema) for details.

Run `npm run docs:generate` after adding metadata to verify the generated page. Output appears in `website/rules/{category}/{rule-id}.md`.

## Contributing Skills

Skills are interactive capabilities that allow Claude to help users validate, optimize, and fix their Claude Code projects through conversation.

### Quality standards

All skills must follow Anthropic's best practices for skill development.

Required for all skills:

1. Description with trigger phrases — must include what, when, triggers, and capabilities
2. Proper naming — no single-word verbs, use suffixes like `-all`, `-cc`, `-cc-md`
3. Automated validation — must pass `claudelint validate-skills`
4. Manual testing — trigger phrases tested, functionality verified

Required for complex skills:

1. Examples section — scenario-based examples (User says → Actions → Result)
2. Troubleshooting section — for skills with >3 scripts or that edit files

Recommended:

- Progressive disclosure — for skills with >3,000 words, use a `references/` directory

### Submitting a skill

Before submitting a PR:

1. Validate structure:

   ```bash
   claudelint validate-skills .claude/skills/your-skill
   ```

2. Test trigger phrases:
   - Start fresh Claude session
   - Test phrases from description field
   - Verify 90%+ trigger success rate

3. Test functionality:
   - Valid inputs work correctly
   - Invalid inputs detected properly
   - Edge cases handled

4. Update documentation:
   - Add to README.md skills list
   - Add to .claude-plugin/README.md
   - Include in PR description

### Skill PR checklist

When submitting a skill PR, include the following in your PR description (the PR template will guide you):

- Skill name and one-line description
- Trigger phrases (list at least 3)
- Confirmation that `claudelint validate-skills` passes
- Trigger phrase test results (90%+ success rate)

Review criteria: follows naming conventions (no generic names like "format", "validate"), description includes trigger phrases, progressive disclosure used if >3,000 words, examples follow scenario format, troubleshooting addresses skill usage issues (not the issues the skill fixes).

## Rule Deprecation Policy

When a rule needs to be changed or removed, follow this deprecation policy to give users time to migrate.

Deprecate a rule when:

- The rule validates a field that no longer exists in the official spec
- The rule's behavior is being merged into another rule
- The rule's validation logic needs a complete rewrite
- The rule is being split into multiple focused rules

Do not deprecate for minor fixes, bug fixes, or improved error messages — update in place.

### Marking rules deprecated

Add a `deprecated` field to the rule's metadata:

```typescript
deprecated: {
  reason: 'This rule validates a field that was removed from the spec',
  replacedBy: 'new-rule-name',        // or an array: ['rule-1', 'rule-2']
  deprecatedSince: '0.3.0',
  removeInVersion: '1.0.0',           // or null to retain indefinitely
  url: 'https://claudelint.com/rules/category/new-rule-name',
}
```

For simple cases, `deprecated: true` also works.

### Deprecation lifecycle

1. Deprecate in a minor version — add metadata, document in CHANGELOG.md under "Deprecated", add migration guide if there's a replacement
2. Warn for 2+ minor versions — users see warnings, `claudelint check-deprecated` lists deprecated rules, `claudelint migrate` auto-updates configs for 1:1 replacements
3. Remove in next major version — document in CHANGELOG.md under "Breaking Changes"

Rules deprecated before 1.0.0 may be removed in 1.0.0 if they validate non-existent fields.

### User-facing commands

- `claudelint check-deprecated` — list all deprecated rules in config
- `claudelint check-all --no-deprecated-warnings` — suppress deprecation warnings
- `claudelint check-all --error-on-deprecated` — treat deprecated rules as errors (CI mode)
- `claudelint migrate` — auto-update config files (1:1 replacements)
- `claudelint migrate --dry-run` — preview changes without writing

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

Bug reports should include: claudelint version (`claudelint --version`), Node.js version (`node --version`), operating system, steps to reproduce, expected vs actual behavior, and error messages or logs.

Feature requests should include: use case description, proposed solution, alternative solutions considered, and impact on existing functionality.

## Documentation Website

The documentation site is built with [VitePress](https://vitepress.dev/) and lives in the `website/` directory. Rule documentation pages are auto-generated from source code metadata.

### Running locally

```bash
# Start the dev server (generates rule docs + launches at localhost:5173)
npm run docs:dev

# Generate rule pages only (no dev server)
npm run docs:generate

# Production build
npm run docs:build

# Preview the production build
npm run docs:preview
```

### How it works

- Rule docs are auto-generated from `meta.docs` in each rule's TypeScript source
- Running `npm run docs:generate` reads all rules and produces markdown pages in `website/rules/`
- A sidebar JSON file (`website/rules/_sidebar.json`) is generated for navigation
- Custom Vue components live in `website/.vitepress/theme/components/`
- See the [Development Overview](/development/overview) for the full metadata schema

### Editing documentation

- Rule docs: edit the `meta.docs` property in the rule's source file, then run `npm run docs:generate`
- Guide/API pages: edit markdown files directly in `website/`
- Components: edit Vue files in `website/.vitepress/theme/components/`
- Navigation: edit sidebar config in `website/.vitepress/config.mts`

### Related docs

For contributing code: [Architecture](/development/architecture), [Custom Rules](/development/custom-rules)

For users: [Getting Started](/guide/getting-started), [Configuration](/guide/configuration), [Rules Reference](/rules/overview), [Troubleshooting](/guide/troubleshooting)

## Release Process

For maintainers only.

1. Verify constants are current:

   ```bash
   npm run check:constants
   ```

   If drift detected, fix it before proceeding. See [Verifying Constants](#verifying-constants).

2. Run full validation:

   ```bash
   npm run validate:all
   ```

3. Choose release type:

   ```bash
   npm run release:patch    # Patch (bug fixes): 0.2.0 -> 0.2.1
   npm run release:minor    # Minor (new features): 0.2.0 -> 0.3.0
   npm run release:major    # Major (breaking changes): 0.2.0 -> 1.0.0
   npm run release          # Interactive (prompts for version)
   ```

The release command uses [release-it](https://github.com/release-it/release-it) and handles everything: lint, test, build, CHANGELOG generation, version bump, skill version sync, git tag, GitHub release, and npm publish.

## Getting Help

- [Documentation](/)
- [Issues](https://github.com/pdugan20/claudelint/issues)
- [Discussions](https://github.com/pdugan20/claudelint/discussions)

## License

By contributing to claudelint, you agree that your contributions will be licensed under the MIT License.
