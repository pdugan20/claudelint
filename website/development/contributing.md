---
outline: 2
description: Contribute to claudelint by adding validation rules, submitting skills, or improving documentation.
---

# Contributing

The most common contribution is [adding a validation rule](#adding-validation-rules). Please read the [Code of Conduct](https://github.com/pdugan20/claudelint/blob/main/CODE_OF_CONDUCT.md) before contributing.

## Getting Started

Prerequisites: Node.js 20+, npm, Git, and optionally [Claude Code](https://code.claude.com/) for testing the plugin.

```bash
git clone https://github.com/YOUR_USERNAME/claudelint.git
cd claudelint
npm install
npm run build
npm test
```

Before opening a PR, run `npm run validate` to catch lint, format, build, and test failures in one pass. See [CLI Reference](/guide/cli-reference) for all available commands.

## Previewing Linter Output

Run claudelint against the test fixture projects to see what errors and warnings look like:

```bash
# All categories with intentional errors/warnings
npm run check:fixtures:invalid

# Clean run (zero issues)
npm run check:fixtures:valid

# Individual validators
npx claudelint validate-agents --path tests/fixtures/projects/invalid-all-categories
```

The `invalid-all-categories` fixture has intentional violations across all 10 validator categories. The `valid-complete` fixture should produce zero issues. Both are tested in CI via `tests/integration/fixture-projects.test.ts`.

## Diagnostic Collection

Library code uses `DiagnosticCollector` instead of `console` for all output. See [Architecture](/development/architecture) for full details.

```typescript
import { DiagnosticCollector } from '../utils/diagnostics';

export function myFunction(
  param: string,
  diagnostics?: DiagnosticCollector
): Result {
  if (invalid) {
    diagnostics?.warn('Invalid param', 'MyFunction', 'MY_001');
  }
}
```

Console is only allowed in the CLI layer (`src/cli/utils/logger.ts`), output formatting (`src/utils/reporting/`), and script utilities (`scripts/util/logger.ts`). This is enforced by `npm run check:logger-usage` in CI and pre-commit hooks.

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/) format (enforced by commitlint). PR titles must also follow this format.

```text
type(scope): subject
```

Types: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`, `perf`

## Adding Validation Rules

claudelint uses a rule-based architecture similar to ESLint. Contributors write individual validation rules, not validators.

See the [Custom Rules Guide](/development/custom-rules) for the full walkthrough: rule structure, validation patterns, auto-fix, and testing strategies.

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

### Rule Docs Metadata

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

### Quality Standards

Required for all skills:

1. Description with trigger phrases — must include what, when, triggers, and capabilities
2. Proper naming — no single-word verbs, use suffixes like `-all`, `-cc`, `-cc-md`
3. Automated validation — must pass `claudelint validate-skills`
4. Manual testing — trigger phrases tested, functionality verified

Required for complex skills:

1. Examples section — scenario-based examples (User says → Actions → Result)
2. Troubleshooting section — for skills with >3 scripts or that edit files

For skills with >3,000 words, use a `references/` directory for progressive disclosure.

### Submitting a Skill

Before submitting a PR:

1. Validate structure:

   ```bash
   claudelint validate-skills .claude/skills/your-skill
   ```

2. Test trigger phrases in a fresh Claude session — verify 90%+ trigger success rate

3. Test functionality with valid inputs, invalid inputs, and edge cases

4. Update README.md and `.claude-plugin/README.md` with the new skill

## Documentation Website

The documentation site is built with [VitePress](https://vitepress.dev/) and lives in `website/`. Rule documentation pages are auto-generated from source code metadata.

```bash
npm run docs:dev       # Dev server (generates rule docs + launches at localhost:5173)
npm run docs:generate  # Generate rule pages only
npm run docs:build     # Production build
npm run docs:preview   # Preview the production build
```

- Rule docs: edit the `meta.docs` property in the rule's source file, then run `npm run docs:generate`
- Guide/API pages: edit markdown files directly in `website/`
- Components: edit Vue files in `website/.vitepress/theme/components/`
- Navigation: edit sidebar config in `website/.vitepress/config.mts`

## See Also

- [Architecture](/development/architecture) - How the codebase is structured
- [Custom Rules Guide](/development/custom-rules) - Full walkthrough for writing rules
- [Rule System](/development/rule-system) - How validators and rules interact
- [Rules Reference](/rules/overview) - Complete list of built-in rules
