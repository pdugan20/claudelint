# release-it Setup Guide

Complete guide to configuring and using release-it for claudelint releases.

## Overview

**release-it** automates versioning, changelog generation, git operations, and npm publishing with a single command.

## Installation

```bash
npm install --save-dev release-it @release-it/conventional-changelog
```

## Configuration

### .release-it.json

Create `.release-it.json` in project root:

```json
{
  "git": {
    "commitMessage": "chore: release v${version}",
    "tagName": "v${version}",
    "requireCleanWorkingDir": true,
    "requireUpstream": true,
    "requireCommits": false,
    "addUntrackedFiles": false,
    "commit": true,
    "tag": true,
    "push": true
  },
  "github": {
    "release": true,
    "releaseName": "v${version}",
    "releaseNotes": "npx auto-changelog --stdout --commit-limit false -u --template ./scripts/release/changelog-template.hbs"
  },
  "npm": {
    "publish": true,
    "publishPath": ".",
    "access": "public",
    "tag": null
  },
  "hooks": {
    "before:init": [
      "npm run lint",
      "npm run test",
      "npm run build"
    ],
    "after:bump": [
      "npm run sync:versions"
    ],
    "after:release": [
      "echo Successfully released ${name} v${version} to ${repo.repository}."
    ]
  },
  "plugins": {
    "@release-it/conventional-changelog": {
      "preset": {
        "name": "conventionalcommits",
        "types": [
          { "type": "feat", "section": "Features" },
          { "type": "fix", "section": "Bug Fixes" },
          { "type": "perf", "section": "Performance Improvements" },
          { "type": "revert", "section": "Reverts" },
          { "type": "docs", "section": "Documentation" },
          { "type": "style", "section": "Styles" },
          { "type": "refactor", "section": "Code Refactoring" },
          { "type": "test", "section": "Tests" },
          { "type": "build", "section": "Build System" },
          { "type": "ci", "section": "Continuous Integration" },
          { "type": "chore", "hidden": true }
        ]
      },
      "infile": "CHANGELOG.md",
      "header": "# Changelog\n\nAll notable changes to this project will be documented in this file.",
      "strictSemVer": true,
      "gitRawCommitsOpts": {
        "path": "."
      }
    }
  }
}
```

## Package.json Scripts

Add these scripts to package.json:

```json
{
  "scripts": {
    "release": "release-it",
    "release:beta": "release-it --preRelease=beta",
    "release:alpha": "release-it --preRelease=alpha",
    "release:rc": "release-it --preRelease=rc",
    "release:dry": "release-it --dry-run",
    "release:patch": "release-it patch",
    "release:minor": "release-it minor",
    "release:major": "release-it major"
  }
}
```

## Usage

### Interactive Release

```bash
# Automatically determine version bump from commits
npm run release

# Interactive prompts will ask:
# - Confirm version bump
# - Confirm changelog
# - Confirm git tag
# - Confirm npm publish
```

### Beta Release

```bash
# First beta: 0.2.0 → 0.2.1-beta.0
npm run release:beta

# Subsequent betas: 0.2.1-beta.0 → 0.2.1-beta.1
npm run release:beta

# Publish with beta tag
npm publish --tag beta
```

### Specific Version Bumps

```bash
# Patch: 0.2.0 → 0.2.1
npm run release:patch

# Minor: 0.2.0 → 0.3.0
npm run release:minor

# Major: 0.2.0 → 1.0.0
npm run release:major
```

### Pre-release Workflow

```bash
# Alpha (internal testing)
npm run release:alpha
# → 0.2.0-alpha.0

# Beta (external testing)
npm run release:beta
# → 0.2.0-beta.0

# Release candidate
npm run release:rc
# → 0.2.0-rc.0

# Final stable
npm run release
# → 0.2.0
```

### Dry Run (No Changes)

```bash
# Test the release process without making changes
npm run release:dry

# Test beta release
npm run release:beta -- --dry-run
```

## Workflow Hooks

release-it runs these hooks automatically:

### before:init

Runs **before** starting the release process:

```bash
npm run lint    # Ensure code quality
npm run test    # Ensure tests pass
npm run build   # Build distribution files
```

### after:bump

Runs **after** bumping version in package.json:

```bash
npm run sync:versions  # Sync versions to plugin.json, marketplace.json, etc.
```

### after:release

Runs **after** successful release:

```bash
echo "Successfully released..."  # Log success message
```

## Configuration Options Explained

### git

- `commitMessage`: Template for release commit
- `tagName`: Git tag format (v1.0.0)
- `requireCleanWorkingDir`: Fail if uncommitted changes
- `requireUpstream`: Fail if no upstream branch
- `commit`: Create git commit
- `tag`: Create git tag
- `push`: Push to remote

### github

- `release`: Create GitHub release
- `releaseName`: GitHub release title
- `releaseNotes`: Command to generate release notes

### npm

- `publish`: Publish to npm
- `access`: "public" for unscoped or public scoped packages
- `tag`: null = determine automatically, "beta" = force beta tag

### plugins

- `@release-it/conventional-changelog`: Generate changelog from conventional commits
- `preset`: Conventional commit types and sections
- `infile`: Where to write changelog
- `strictSemVer`: Enforce semantic versioning

## Conventional Commits

release-it uses conventional commits to determine version bumps:

```bash
# Patch: 0.2.0 → 0.2.1
git commit -m "fix: resolve validation error"

# Minor: 0.2.0 → 0.3.0
git commit -m "feat: add new rule type"

# Major: 0.2.0 → 1.0.0
git commit -m "feat!: redesign API

BREAKING CHANGE: API signatures changed"
```

### Commit Format

```text
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types

- `feat`: New feature (minor bump)
- `fix`: Bug fix (patch bump)
- `docs`: Documentation only
- `style`: Code style changes
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Test changes
- `build`: Build system changes
- `ci`: CI configuration changes
- `chore`: Maintenance tasks
- `revert`: Revert previous commit

### Breaking Changes

Add `!` after type or `BREAKING CHANGE:` in footer:

```bash
git commit -m "feat!: redesign config format

BREAKING CHANGE: Config files now use JSON instead of YAML"
```

## Environment Variables

### GitHub Token

For GitHub releases, set token:

```bash
export GITHUB_TOKEN=ghp_xxxxxxxxxxxxx
```

Or use `.env` file (add to .gitignore):

```text
GITHUB_TOKEN=ghp_xxxxxxxxxxxxx
```

### NPM Token (for CI/CD)

```bash
export NPM_TOKEN=npm_xxxxxxxxxxxxx
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Release

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
          token: ${{ secrets.GITHUB_TOKEN }}

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          registry-url: 'https://registry.npmjs.org'

      - run: npm ci
      - run: npm test

      - name: Release
        run: npm run release -- --ci
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## Troubleshooting

### Working Directory Not Clean

```bash
# Check for uncommitted changes
git status

# Commit or stash changes
git add .
git commit -m "chore: prepare for release"
```

### No Upstream Branch

```bash
# Set upstream
git push --set-upstream origin main
```

### NPM Publish Fails

```bash
# Check login status
npm whoami

# Login if needed
npm login

# Check package name availability
npm view claudelint
```

### Tests Fail

```bash
# Skip hooks (not recommended)
npm run release -- --no-git.requireCleanWorkingDir --hooks=false

# Better: fix tests first
npm test
```

## Best Practices

1. **Commit Frequently**: Use conventional commits for automatic changelog
2. **Test Before Release**: Let hooks run, don't skip
3. **Use Dry Run**: Test release process with `--dry-run` first
4. **Beta Tag**: Always use `--tag beta` for pre-releases
5. **Clean Working Dir**: Commit changes before releasing
6. **Review Changelog**: Check generated CHANGELOG.md before publishing
7. **Version Sync**: Let `after:bump` hook sync all version references

## Next Steps

- [ ] Configure .release-it.json
- [ ] Add npm scripts to package.json
- [ ] Test with dry run: `npm run release:dry`
- [ ] Create first beta: `npm run release:beta`
- [ ] Verify on npmjs.com
- [ ] Document process in CONTRIBUTING.md
