# Releasing

This document covers the release process for claudelint. All releases use [release-it](https://github.com/release-it/release-it) which automates versioning, changelog generation, git tagging, GitHub releases, and npm publishing.

## Prerequisites

- Authenticated with npm (`npm login`)
- Push access to `pdugan20/claudelint`
- Clean working directory (`git status` shows no changes)

## Pre-Release Checklist

1. Verify constants are current (manual, not automated):

   ```bash
   npm run check:constants
   ```

2. Run full validation:

   ```bash
   npm run validate:all
   ```

3. Run a dry run to preview:

   ```bash
   npm run release:dry
   ```

## Release Types

### Patch Release (bug fixes)

```bash
npm run release:patch    # 0.2.0 -> 0.2.1
```

Use for: bug fixes, typo corrections, dependency patches that don't change behavior.

### Minor Release (new features)

```bash
npm run release:minor    # 0.2.0 -> 0.3.0
```

Use for: new rules, new validators, new CLI commands, non-breaking API additions.

### Major Release (breaking changes)

```bash
npm run release:major    # 0.2.0 -> 1.0.0
```

Use for: removed rules, changed rule IDs, config format changes, dropped Node.js versions.

### Pre-Release (beta/alpha/rc)

```bash
npm run release:beta     # 0.2.0 -> 0.3.0-beta.0
npm run release:alpha    # 0.2.0 -> 0.3.0-alpha.0
npm run release:rc       # 0.2.0 -> 0.3.0-rc.0
```

### Interactive

```bash
npm run release          # Prompts for version
```

## What Happens During Release

`npm run release` executes this pipeline (configured in `.release-it.json`):

1. **before:init** — Runs `npm run lint`, `npm run test`, `npm run build`
2. **Version bump** — Updates `package.json` version
3. **after:bump** — Runs `npm run sync:versions` (syncs plugin.json, marketplace.json, examples)
4. **Changelog** — Auto-generates CHANGELOG.md section from conventional commits
5. **Git** — Commits changes, creates `v{version}` tag, pushes to origin
6. **GitHub** — Creates GitHub release with release notes
7. **npm** — Publishes to npm with public access

## Version Sync

All version numbers must stay in sync across:

- `package.json` (primary source)
- `.claude-plugin/plugin.json`
- `.claude-plugin/marketplace.json` (top-level version and `plugins[0].version`)

This is handled automatically by the `after:bump` hook. To verify manually:

```bash
npm run sync:versions:check
```

To fix drift manually:

```bash
npm run sync:versions
```

## Hotfix Process

1. Create fix on `main` (we don't use release branches)
2. Run `npm run release:patch`
3. Verify on npm: `npm view claude-code-lint version`

## Troubleshooting

### "Not authenticated with npm"

```bash
npm login
npm whoami  # Should show your username
```

### Dirty working directory

```bash
git status     # Check what's uncommitted
git stash      # Or commit/discard changes
```

### Version sync drift

```bash
npm run sync:versions        # Fix drift
npm run sync:versions:check  # Verify
```

### Failed release mid-way

If release fails after the git tag but before npm publish:

```bash
# Check what was created
git tag -l | tail -5
gh release list | head -5

# Retry npm publish manually
npm publish --access public

# Or delete the tag and re-run
git tag -d v0.x.x
git push origin :refs/tags/v0.x.x
npm run release
```
