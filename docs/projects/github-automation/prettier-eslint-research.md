# .github Folder Research: Prettier & ESLint Best Practices

This document analyzes the .github folder organization used by Prettier and ESLint, two major open-source CLI linting tools, to identify patterns and best practices for claudelint.

## Executive Summary

Both projects use comprehensive GitHub automation to manage their large contributor bases and issue volumes. Key patterns include:

- **Structured issue templates** using YAML forms (ESLint) or Markdown templates (Prettier)
- **Comprehensive CI/CD workflows** with multi-platform testing
- **Automated dependency management** using Renovate (both) and/or Dependabot (ESLint)
- **Issue/PR automation** for stale items, labeling, and response tracking
- **Security policies** via Tidelift or HackerOne
- **Funding/sponsorship** integration via Open Collective and other platforms

## Directory Structure Comparison

### Prettier (.github/)

```text
.github/
├── ISSUE_TEMPLATE/
│   ├── config.yml
│   ├── formatting.md
│   └── integration.md
├── codeql/
├── workflows/
│   ├── _build.yml
│   ├── autofix.yml
│   ├── bundler-friendly.yml
│   ├── check-sizes.yml
│   ├── cleanup-cspell.yml
│   ├── codeql.yml
│   ├── dev-package-test.yml
│   ├── dev-test.yml
│   ├── eslint-rules.yml
│   ├── lint.yml
│   ├── lock.yml
│   ├── mark-issue-duplicate.yml
│   ├── no-response.yml
│   ├── prevent-file-change.yml
│   ├── prod-test.yml
│   ├── release-script-test.yml
│   └── support.yml
├── PULL_REQUEST_TEMPLATE.md
├── SECURITY.md
└── renovate.json5
```

### ESLint (.github/)

```text
.github/
├── ISSUE_TEMPLATE/
│   ├── config.yml
│   ├── bug-report.yml
│   ├── change.yml
│   ├── docs.yml
│   ├── new-rule.yml
│   ├── new-syntax.yml
│   └── rule-change.yml
├── workflows/
│   ├── annotate_pr.yaml
│   ├── ci.yml
│   ├── codeql-analysis.yml
│   ├── docs-ci.yml
│   ├── pr-labeler.yml
│   ├── rebuild-docs-sites.yml
│   ├── stale.yml
│   ├── types-integration.yml
│   └── update-readme.yml
├── CODEOWNERS
├── PULL_REQUEST_TEMPLATE.md
├── copilot-instructions.md
├── dependabot.yml
├── labeler.yml
└── renovate.json5
```

## Issue Templates

### Prettier Approach

**Format:** Markdown-based templates (.md files)

**Templates:**

1. **formatting.md** - For reporting formatting issues
2. **integration.md** - For integration problems with tools/editors

**config.yml** - Provides additional resources:

- Link to experimental CLI issues repository
- Stack Overflow for support questions
- VS Code extension repository
- Allows blank issues (`blank_issues_enabled: true`)

**Template Structure (formatting.md):**

```markdown
---
name: Formatting issue
about: Report an issue related to how Prettier formats code
---

<!-- Instructions to search for duplicates and understand Prettier's philosophy -->

**Prettier version:** 3.8.1

**Playground link:** <!-- link to prettier.io/playground -->

**Options:**

```bash
--single-quote
```

**Input:**

```js
// Code here
```

**Output:**

```js
// What Prettier produces
```

**Expected Output:**

```js
// What you expected
```

**Why?**

Brief explanation
```

### ESLint Approach

**Format:** YAML-based forms (.yml files)

**Templates:**

1. **bug-report.yml** - Bug reports with required fields
2. **change.yml** - General change proposals
3. **docs.yml** - Documentation updates
4. **new-rule.yml** - New rule requests
5. **new-syntax.yml** - New JavaScript syntax support
6. **rule-change.yml** - Modifications to existing rules

**config.yml:**

- Disables blank issues (`blank_issues_enabled: false`)
- Links to GitHub Discussions for questions
- Links to VS Code plugin repository
- Links to Discord for real-time chat

**Example Template Structure (bug-report.yml):**

```yaml
name: Bug Report
description: Report a problem with ESLint or bundled rules
body:
  - type: markdown
    attributes:
      value: |
        Please adhere to the OpenJS Foundation Code of Conduct

  - type: input
    id: node-version
    attributes:
      label: Node version
    validations:
      required: true

  - type: input
    id: npm-version
    attributes:
      label: npm version
    validations:
      required: true

  - type: dropdown
    id: parser
    attributes:
      label: Which parser are you using?
      options:
        - Espree
        - TypeScript
        - Babel
        - Vue
        - Angular
        - Other

  - type: textarea
    id: reproduction
    attributes:
      label: Minimal reproduction
      description: Required - provide config and code snippets
    validations:
      required: true

  - type: input
    id: link
    attributes:
      label: Link to reproduction
      description: ESLint demo, StackBlitz, or GitHub repo
    validations:
      required: true

  - type: checkboxes
    id: participate
    attributes:
      label: Participation
      options:
        - label: I will submit a pull request
```

### Best Practice Recommendations for claudelint

**Recommendation:** Use YAML forms (ESLint approach)

**Rationale:**

- More structured and easier to parse
- Required fields enforcement
- Dropdowns and checkboxes for consistent data
- Better user experience on GitHub
- Easier to maintain

**Suggested Templates:**

1. **bug-report.yml** - For bugs in claudelint
2. **rule-request.yml** - For new rule suggestions
3. **rule-change.yml** - For modifying existing rules
4. **docs.yml** - Documentation improvements
5. **config.yml** - Links to discussions, Discord, contributing guide

## Pull Request Templates

### Prettier Template

```markdown
<!-- Thank you for contributing! -->

**Description**

Brief summary of changes

**Checklist**

- [ ] Tests added/updated
- [ ] Documentation updated (for API/CLI changes)
- [ ] Changelog entries added (for user-facing changes)
- [ ] I have read the contributing guidelines
```

### ESLint Template

```markdown
<!-- Prerequisites checklist -->
- [ ] I have reviewed the contributing guidelines

**Type of change**

- [ ] Documentation update
- [ ] Bug fix
- [ ] New rule
- [ ] Rule change
- [ ] Autofix addition
- [ ] CLI option
- [ ] Core change
- [ ] Other

<!-- Instructions to include relevant template info based on type -->

**Summary**

Description of changes made

**Reviewer focus area**

Optional: What should reviewers pay special attention to?
```

### Best Practice Recommendations for claudelint

**Recommended Template:**

```markdown
## Prerequisites

- [ ] I have read the [Contributing Guide](link)
- [ ] Tests have been added/updated
- [ ] Documentation has been updated (if needed)

## Type of Change

- [ ] Bug fix
- [ ] New rule
- [ ] Rule enhancement
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Refactoring
- [ ] Other (describe):

## Summary

<!-- Brief description of changes -->

## Related Issues

Fixes #

## Test Plan

<!-- How did you test these changes? -->

## Breaking Changes

<!-- Any breaking changes? If yes, describe migration path -->

## Reviewer Notes

<!-- Optional: specific areas for reviewer attention -->
```

## GitHub Actions Workflows

### Common Workflows in Both Projects

#### 1. CI/CD Testing

**Prettier: dev-test.yml**

- Triggers: Push to main/next/version branches, all PRs
- Platforms: Ubuntu, macOS, Windows
- Node versions: 20 (min), 24 (latest), plus 22 and 25
- Key steps:
  - Checkout code
  - Setup Node with yarn cache
  - Install dependencies (`yarn install --immutable`)
  - Run tests
  - Upload coverage to Codecov (Ubuntu/Node 24 only)
  - Validate benchmark flags (non-Windows)

**ESLint: ci.yml**

- Triggers: Push to main, PRs to main
- Multiple jobs:
  - **verify_files**: Lint checks, rule validation, license checks
  - **test_on_node**: Multi-version Node testing (20.19.0, 20.x, 22.x, 24.x, 25.x)
  - **test_on_browser**: Cypress browser tests
  - **test_types**: TypeScript type validation
  - **pnpm_test**: Package manager compatibility

#### 2. Linting

**Prettier: lint.yml**

Comprehensive linting including:

- ESLint validation
- Prettier formatting checks
- JSDoc type validation
- Spellcheck (likely cspell)
- Changelog validation
- Markdown code block validation
- Dependency checks
- Workflow file validation
- Renovate config validation
- Knip (unused code detection)
- File change detection

**ESLint: Integrated into ci.yml verify_files job**

#### 3. CodeQL Security Analysis

Both projects use **codeql.yml** for automated security scanning.

#### 4. Stale Issue Management

**Prettier: no-response.yml**

- Triggers: Issue comments, daily at midnight UTC
- Closes issues labeled "status:awaiting response" after 14 days
- Uses `lee-dohm/no-response` action

**ESLint: stale.yml**

- Triggers: Daily at 10:31 PM UTC
- Uses reusable workflow from `eslint/workflows` repository
- Requires write permissions for issues and PRs

#### 5. Issue Locking

**Prettier: lock.yml**

- Triggers: Daily at midnight UTC, manual dispatch
- Locks issues (not PRs) after 90 days of inactivity
- Excludes: "keep-unlocked" or "status:awaiting response" labels
- Adds "locked-due-to-inactivity" label
- Only runs on official repository (not forks)
- Uses `dessant/lock-threads@v6`

#### 6. PR Labeling

**ESLint: pr-labeler.yml**

- Triggers: `pull_request_target` events
- Uses `actions/labeler@v6` with `sync-labels: true`
- Configuration in `.github/labeler.yml`

**labeler.yml structure:**

```yaml
rule:
  - changed-files:
      - any-glob-to-any-file: lib/rules/**

cli:
  - changed-files:
      - any-glob-to-any-file:
          - lib/cli.js
          - lib/options.js
          - lib/cli-engine/**
          - lib/eslint/**

core:
  - changed-files:
      - any-glob-to-any-file:
          - lib/config/**
          - lib/linter/**
          - lib/rule-tester/**

formatter:
  - changed-files:
      - any-glob-to-any-file: lib/cli-engine/formatters/**

github actions:
  - changed-files:
      - any-glob-to-any-file: .github/workflows/**
```

### Unique Workflows

**Prettier-specific:**

- **autofix.yml** - Automated fixes
- **bundler-friendly.yml** - Bundler compatibility tests
- **check-sizes.yml** - Bundle size monitoring
- **cleanup-cspell.yml** - Spellcheck cleanup
- **dev-package-test.yml** - Dev package testing
- **eslint-rules.yml** - ESLint rule validation
- **mark-issue-duplicate.yml** - Duplicate issue automation
- **prevent-file-change.yml** - Prevent specific file modifications
- **prod-test.yml** - Production build testing
- **release-script-test.yml** - Release automation validation
- **support.yml** - Support automation

**ESLint-specific:**

- **annotate_pr.yaml** - PR annotations
- **docs-ci.yml** - Documentation build validation
- **rebuild-docs-sites.yml** - Rebuild documentation sites
- **types-integration.yml** - TypeScript type testing
- **update-readme.yml** - Automated README updates

### Best Practice Recommendations for claudelint

**Essential Workflows:**

1. **ci.yml** - Comprehensive testing
   - Multi-platform (Ubuntu, macOS, Windows)
   - Multi-version Node (18.x, 20.x, 22.x)
   - Unit tests, integration tests, lint checks
   - Coverage reporting

2. **codeql.yml** - Security analysis

3. **lint.yml** - Separate linting workflow
   - ESLint
   - Prettier
   - Markdown linting
   - Spellcheck
   - Type checking
   - Dependency validation

4. **stale.yml** - Manage inactive issues
   - Close after 60-90 days
   - Label "awaiting response" issues

5. **lock.yml** - Lock old issues
   - Lock after 90 days
   - Only issues, not PRs
   - Exclude special labels

6. **pr-labeler.yml** - Auto-label PRs
   - Based on changed files
   - Categories: rules, core, cli, docs, tests

**Optional but Recommended:**

7. **dependabot.yml** or **renovate.json5** - Dependency updates
8. **release.yml** - Automated releases (if using semantic-release)
9. **size-check.yml** - Monitor bundle size changes
10. **docs-deploy.yml** - Deploy documentation (if applicable)

## Dependency Management

### Prettier: Renovate Only

**renovate.json5:**

```json5
{
  "dependencyDashboardApproval": true,
  "labels": ["dependency"],
  "baseBranchPatterns": ["main"],
  "postUpdateOptions": ["yarnDedupeHighest"],
  "prHourlyLimit": 0,
  "prConcurrentLimit": 0,

  "packageRules": [
    // GitHub Actions grouped separately
    {
      "matchManagers": ["github-actions"],
      "groupName": "GitHub Actions"
    },

    // Dev dependencies separate from production
    {
      "matchDepTypes": ["devDependencies"],
      "groupName": "development dependencies"
    },

    // Framework-specific grouping
    {
      "matchPackageNames": ["react", "react-dom"],
      "groupName": "React"
    },

    // Tooling clusters
    {
      "matchPackageNames": [
        "eslint",
        "eslint-*",
        "@eslint/*"
        // ... 13 packages total
      ],
      "groupName": "ESLint ecosystem"
    }
  ],

  "ignoreDeps": ["prettier", "node"],
  "ignorePaths": ["tests/**", "packages/**"]
}
```

### ESLint: Both Renovate and Dependabot

**dependabot.yml:**

```yaml
version: 2
updates:
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
    commit-message:
      prefix: "ci"
```

**renovate.json5:**

```json5
{
  "extends": ["github>eslint/workflows//.github/renovate/base.json5"],

  "ignoreDeps": ["prettier"],

  "packageRules": [
    {
      "matchPackageNames": ["@babel/**", "babel-*"],
      "groupName": "Babel packages"
    },
    {
      "matchPackageNames": [
        "eslint",
        "espree",
        "eslint-scope",
        "eslint-visitor-keys"
      ],
      "groupName": "ESLint core",
      "minimumReleaseAge": null, // Don't wait
      "rangeStrategy": "bump"
    }
  ]
}
```

### Best Practice Recommendations for claudelint

**Recommendation:** Use both Renovate and Dependabot

**Dependabot:** For GitHub Actions only (weekly updates)

**Renovate:** For npm dependencies

**Suggested renovate.json5:**

```json5
{
  "extends": ["config:recommended"],
  "dependencyDashboardApproval": true,
  "labels": ["dependencies"],
  "baseBranches": ["main"],
  "schedule": ["before 6am on Monday"],

  "packageRules": [
    // Group GitHub Actions
    {
      "matchManagers": ["github-actions"],
      "groupName": "GitHub Actions",
      "automerge": true,
      "automergeType": "pr"
    },

    // Dev dependencies
    {
      "matchDepTypes": ["devDependencies"],
      "groupName": "dev dependencies",
      "automerge": true
    },

    // TypeScript ecosystem
    {
      "matchPackageNames": [
        "typescript",
        "@types/*",
        "ts-node",
        "tsx"
      ],
      "groupName": "TypeScript"
    },

    // Testing ecosystem
    {
      "matchPackageNames": [
        "vitest",
        "@vitest/*",
        "jest",
        "@jest/*"
      ],
      "groupName": "Testing"
    },

    // ESLint ecosystem (if used)
    {
      "matchPackageNames": [
        "eslint",
        "eslint-*",
        "@eslint/*"
      ],
      "groupName": "ESLint"
    }
  ],

  "ignoreDeps": [],
  "ignorePaths": ["**/test/**", "**/fixtures/**"]
}
```

## Code Ownership

**ESLint: CODEOWNERS**

```text
/docs/ @eslint/website-team @eslint/eslint-team
* @eslint/eslint-team
```

**Prettier:** Does not appear to use CODEOWNERS

### Best Practice Recommendations for claudelint

**Recommended CODEOWNERS:**

```text
# Default owners for everything in the repo
* @patdugan

# Documentation
/docs/ @patdugan

# Rules
/src/rules/ @patdugan

# CI/CD
/.github/ @patdugan

# Configuration
/src/config/ @patdugan

# Tests
/tests/ @patdugan
```

Update as team grows or when specific domain expertise develops.

## GitHub Copilot Instructions

**ESLint: copilot-instructions.md**

Provides comprehensive guidance for GitHub Copilot when working in the repository:

- Project organization and directory structure
- Code standards and file format
- Testing requirements and framework
- Rule development patterns
- Documentation standards
- Registration procedures

**Key sections:**

```markdown
## Project Organization
- Source code in `lib/`
- Tests mirror structure
- Config files in root

## Code Standards
- File header format
- Import organization
- Helper functions before exports

## Testing Requirements
- All exported functions need tests
- All bug fixes need tests
- Use Mocha with Chai
- Run via `npm test`

## Rule Development
- Rules in `lib/rules/`
- Export object with `meta` and `create`
- Helper functions outside `create`
- Register in `lib/rules/index.js`

## Documentation
- Frontmatter fields required
- Code examples with enabling comments
```

### Best Practice Recommendations for claudelint

**Recommended copilot-instructions.md:**

```markdown
# claudelint Project Knowledge

## Project Structure

```text
src/
├── rules/         # Lint rules
├── config/        # Configuration handling
├── cli/           # CLI interface
└── utils/         # Shared utilities

tests/
├── rules/         # Rule tests
└── integration/   # End-to-end tests
```

## Code Standards

- TypeScript with strict mode
- ESLint + Prettier for formatting
- JSDoc comments for public APIs
- Explicit return types for functions

## Testing Requirements

- All rules require tests in `tests/rules/`
- Use Vitest testing framework
- Run tests: `npm test`
- Coverage requirement: 80%+
- Test both valid and invalid cases

## Rule Development

Rules are located in `src/rules/` and must:

1. Export a `Rule` object with:
   - `meta`: Metadata including id, description, severity
   - `check`: Function that performs validation

2. Include comprehensive tests in `tests/rules/[rule-name].test.ts`

3. Register in `src/rules/index.ts`:

```typescript
export const rules = {
  'rule-name': require('./rule-name').default,
};
```

4. Add documentation in `docs/rules/[rule-name].md`

## File Format

```typescript
// File header
/**
 * @fileoverview Brief description
 * @author Your Name
 */

// Imports
import { ... } from '...';

// Types
interface RuleOptions { ... }

// Helper functions
function helper() { ... }

// Main export
export default {
  meta: { ... },
  check: (context) => { ... }
};
```

## Contributing

- Fork and create feature branch
- Add tests for all changes
- Run `npm run lint` before committing
- Update documentation for new rules
- Keep commits focused and descriptive
```

## Security Policies

### Prettier: SECURITY.md

```markdown
# Security Policy

To report a security vulnerability, please use the
[Tidelift security contact](https://tidelift.com/security).
Tidelift will coordinate the fix and disclosure.
```

### ESLint: No SECURITY.md found

Likely uses HackerOne or similar platform (referenced in their documentation).

### Best Practice Recommendations for claudelint

**Recommended SECURITY.md:**

```markdown
# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

To report a security vulnerability, please email:

**security@[your-domain].com**

Or use GitHub Security Advisories:
[Report a vulnerability](https://github.com/[org]/claudelint/security/advisories/new)

**Please do not:**
- Open public GitHub issues for security vulnerabilities
- Disclose vulnerabilities publicly before coordinated disclosure

**What to expect:**
- Acknowledgment within 48 hours
- Status updates every 5 business days
- Coordinated disclosure timeline
- Credit in release notes (if desired)

## Security Update Process

1. Vulnerability reported
2. Severity assessment (24-48 hours)
3. Fix development
4. Security advisory published
5. Patch release
6. Public disclosure

Thank you for helping keep claudelint secure!
```

## Funding/Sponsorship

### Prettier

**Funding platforms:**

- Open Collective: `opencollective.com/prettier`
- Thanks.dev: `thanks.dev/u/gh/prettier`
- Tidelift: `tidelift.com/funding/github/npm/prettier`

**Implementation:** Likely via FUNDING.yml (file not directly accessible but indicated by sponsor button)

### ESLint

**Funding platforms:**

- Open Collective (primary)

**Sponsor tiers:**

- Platinum Sponsors: Automattic
- Gold Sponsors: Qlty Software, Shopify
- Silver Sponsors: Vite, Liftoff, American Express, StackBlitz
- Bronze Sponsors: Multiple organizations
- Technology Sponsors: Netlify, Algolia, 1Password (free services)

**Call to action:** "Become a Sponsor" in README

### Best Practice Recommendations for claudelint

**Recommended FUNDING.yml:**

```yaml
# Funding platforms
github: [patdugan]  # GitHub Sponsors username
open_collective: claudelint  # If set up
ko_fi: username  # If using Ko-fi
```

**Add to README.md:**

```markdown
## Sponsors

Support this project by becoming a sponsor. Your logo will show up here
with a link to your website.

[Become a sponsor](https://github.com/sponsors/[username])
```

## Additional Automation Files

### labeler.yml (ESLint)

Automatically labels PRs based on file changes. See earlier section for full structure.

### config.yml (Both projects)

Configures issue template behavior and provides links to external resources.

**Key settings:**

- `blank_issues_enabled: true/false`
- `contact_links`: Array of resources (discussions, Stack Overflow, etc.)

## Summary of Recommendations for claudelint

### Immediate Priorities

1. **Issue Templates (YAML format)**
   - bug-report.yml
   - rule-request.yml
   - rule-change.yml
   - docs.yml
   - config.yml (with links to discussions/Discord)

2. **Pull Request Template**
   - Clear sections: Prerequisites, Type, Summary, Related Issues, Test Plan

3. **Essential Workflows**
   - ci.yml (multi-platform testing)
   - codeql.yml (security)
   - lint.yml (comprehensive linting)
   - stale.yml (issue management)

4. **Dependency Management**
   - dependabot.yml (GitHub Actions)
   - renovate.json5 (npm packages)

5. **Security**
   - SECURITY.md (vulnerability reporting)

### Secondary Priorities

6. **Code Ownership**
   - CODEOWNERS file

7. **PR Automation**
   - pr-labeler.yml
   - labeler.yml

8. **Issue Automation**
   - lock.yml (lock old issues)
   - no-response.yml (close unresponsive issues)

9. **GitHub Copilot**
   - copilot-instructions.md (project-specific guidance)

10. **Funding**
    - FUNDING.yml (if accepting sponsorships)

### Long-term Enhancements

11. **Advanced Workflows**
    - size-check.yml (bundle size monitoring)
    - docs-deploy.yml (documentation deployment)
    - release.yml (automated releases)
    - benchmark.yml (performance tracking)

12. **Quality Gates**
    - Require passing CI before merge
    - Require code review
    - Require up-to-date branches
    - Status checks for coverage thresholds

## File Priority Matrix

| File | Priority | Complexity | Impact |
|------|----------|------------|--------|
| bug-report.yml | High | Low | High |
| PULL_REQUEST_TEMPLATE.md | High | Low | High |
| ci.yml | High | Medium | High |
| dependabot.yml | High | Low | Medium |
| renovate.json5 | High | Medium | Medium |
| SECURITY.md | High | Low | Medium |
| codeql.yml | Medium | Low | High |
| lint.yml | Medium | Low | High |
| stale.yml | Medium | Low | Medium |
| pr-labeler.yml + labeler.yml | Medium | Low | Medium |
| CODEOWNERS | Medium | Low | Low |
| copilot-instructions.md | Low | Medium | Medium |
| lock.yml | Low | Low | Low |
| FUNDING.yml | Low | Low | Low |

## Next Steps

1. Review existing .github folder in claudelint
2. Create missing issue templates (YAML format)
3. Enhance PR template
4. Add comprehensive CI workflow
5. Configure Renovate for dependency updates
6. Add security policy
7. Implement PR labeler
8. Add stale issue management
9. Document code ownership
10. Consider funding options

## References

- [Prettier Repository](https://github.com/prettier/prettier)
- [ESLint Repository](https://github.com/eslint/eslint)
- [GitHub Issue Forms Documentation](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/syntax-for-issue-forms)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Dependabot Documentation](https://docs.github.com/en/code-security/dependabot)
- [Renovate Documentation](https://docs.renovatebot.com/)
