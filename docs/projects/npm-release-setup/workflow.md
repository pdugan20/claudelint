# Release Workflow

Day-to-day release workflow and checklists for claudelint.

## Overview

This document provides step-by-step checklists for common release scenarios.

## Beta Release Workflow

### First Beta (0.2.0-beta.0)

```bash
# 1. Prepare environment
npm install
npm run build
npm test

# 2. Sync versions
npm run sync:versions

# 3. Migrate package name
npm run migrate:name:dry  # Review changes
npm run migrate:name      # Execute

# 4. Commit migration
git add .
git commit -m "chore: migrate to unscoped package name"

# 5. Update CHANGELOG
# Add section for 0.2.0-beta.0

# 6. Add beta warning to README
# See publishing-strategy.md

# 7. Create release with release-it
npm run release:beta

# 8. Publish with beta tag
npm publish --tag beta --access public

# 9. Verify
npm view claudelint
npm install -g claude-code-lint@beta
claudelint --version

# 10. Create GitHub release
# Tag: v0.2.0-beta.0
# Title: v0.2.0-beta.0 (Beta)
# Body: Beta release notes

# 11. Announce
# Post in Discord/Twitter/etc.
```

**Checklist:**

- [ ] Build passes
- [ ] Tests pass
- [ ] Versions synced
- [ ] Package name migrated
- [ ] CHANGELOG updated
- [ ] Beta warning added
- [ ] Git committed
- [ ] release-it executed
- [ ] Published with beta tag
- [ ] Installation verified
- [ ] GitHub release created
- [ ] Announced

### Subsequent Beta (0.2.0-beta.1+)

```bash
# 1. Make changes
# Fix bugs, add features

# 2. Commit changes
git add .
git commit -m "fix: resolve validation issue"

# 3. Run tests
npm test

# 4. Create release
npm run release:beta

# release-it will:
# - Bump version: 0.2.0-beta.0 → 0.2.0-beta.1
# - Sync versions automatically
# - Update CHANGELOG
# - Create commit
# - Create tag
# - Prompt for publish

# 5. Confirm publish
# When prompted, enter tag: beta

# Or publish manually
npm publish --tag beta --access public

# 6. Verify
npm view claudelint dist-tags
# beta should point to new version
```

**Checklist:**

- [ ] Changes committed
- [ ] Tests pass
- [ ] release-it executed
- [ ] Published with beta tag
- [ ] Version verified on npm

## Release Candidate Workflow

### Creating RC (0.2.0-rc.0)

```bash
# 1. Verify beta is stable
# - No critical bugs
# - All features complete
# - Documentation complete

# 2. Create RC
npm run release:rc

# release-it bumps: 0.2.0-beta.5 → 0.2.0-rc.0

# 3. Publish with rc tag
npm publish --tag rc --access public

# 4. Update documentation
# - Mark as release candidate
# - Set stable release date estimate

# 5. Announce RC
# - Request final testing
# - Set RC testing period (1-2 weeks)

# 6. Monitor for issues
# - Fix critical bugs only
# - No new features
```

**Checklist:**

- [ ] Beta testing complete
- [ ] Feature freeze in effect
- [ ] Documentation finalized
- [ ] RC created and published
- [ ] Testing period announced
- [ ] Monitoring for issues

### RC Bug Fix (0.2.0-rc.1)

```bash
# 1. Fix critical bug
git commit -m "fix: critical bug in validator"

# 2. Bump RC version
npm run release:rc

# 0.2.0-rc.0 → 0.2.0-rc.1

# 3. Publish
npm publish --tag rc --access public

# 4. Notify testers
# - RC updated
# - Request re-testing
```

**Checklist:**

- [ ] Bug fixed
- [ ] Tests pass
- [ ] RC version bumped
- [ ] Published
- [ ] Testers notified

## Stable Release Workflow

### Creating Stable (0.2.0)

```bash
# 1. Verify RC testing complete
# - RC period finished (1-2 weeks)
# - No critical bugs reported
# - All feedback addressed

# 2. Final preparations
# - Remove beta warning from README
# - Finalize CHANGELOG
# - Update version references in docs

# 3. Run full validation
npm run validate:all
npm run build
npm test

# 4. Create stable release
npm run release

# release-it bumps: 0.2.0-rc.2 → 0.2.0

# 5. Publish (gets 'latest' tag automatically)
npm publish --access public

# 6. Verify latest tag
npm view claudelint dist-tags
# latest: 0.2.0

# 7. Test installation
npm install -g claude-code-lint
claudelint --version
# Should show: 0.2.0

# 8. Create GitHub release
# - Tag: v0.2.0
# - Title: v0.2.0
# - Mark as latest release
# - Include full release notes

# 9. Announce stable release
# - Blog post / Twitter
# - Update website
# - Close GitHub milestone

# 10. Plan next version
# - Create milestone for 0.3.0
# - Update project board
```

**Checklist:**

- [ ] RC testing complete
- [ ] Beta warning removed
- [ ] CHANGELOG finalized
- [ ] Full validation passed
- [ ] Stable version created
- [ ] Published without tag
- [ ] Latest tag verified
- [ ] Installation tested
- [ ] GitHub release created
- [ ] Announced
- [ ] Next version planned

## Patch Release Workflow

### Bug Fix Patch (0.2.1)

```bash
# 1. Fix bug in stable
git commit -m "fix: resolve config loading issue"

# 2. Run tests
npm test

# 3. Create patch release
npm run release:patch

# 0.2.0 → 0.2.1

# 4. Publish
npm publish --access public

# 5. Verify latest tag
npm view claudelint dist-tags
# latest: 0.2.1

# 6. Create GitHub release
# Tag: v0.2.1
# Title: v0.2.1
# Body: Bug fix release notes

# 7. Announce (optional for patches)
```

**Checklist:**

- [ ] Bug fixed
- [ ] Tests pass
- [ ] Patch version created
- [ ] Published
- [ ] Latest tag updated
- [ ] GitHub release created

## Minor Release Workflow

### New Features (0.3.0)

```bash
# 1. Develop features on main branch
git commit -m "feat: add new validation rule"
git commit -m "feat: improve error messages"

# 2. Optional: Beta testing
npm run release:beta
# 0.2.5 → 0.3.0-beta.0
npm publish --tag beta --access public

# Test beta for 1-2 weeks

# 3. Create minor release
npm run release:minor

# 0.2.5 → 0.3.0 (or 0.3.0-beta.5 → 0.3.0)

# 4. Publish
npm publish --access public

# 5. Create GitHub release
# Tag: v0.3.0
# Title: v0.3.0
# Body: Feature release notes

# 6. Announce
# - Highlight new features
# - Update documentation
```

**Checklist:**

- [ ] Features developed and tested
- [ ] Beta testing complete (if applicable)
- [ ] Minor version created
- [ ] Published
- [ ] GitHub release created
- [ ] Documentation updated
- [ ] Announced

## Major Release Workflow

### Breaking Changes (1.0.0)

```bash
# 1. Develop on main with breaking changes
git commit -m "feat!: redesign configuration API

BREAKING CHANGE: Configuration format changed from YAML to JSON"

# 2. Create alpha/beta for testing
npm run release:beta
# 0.9.5 → 1.0.0-beta.0

npm publish --tag beta --access public

# 3. Beta testing period (2-4 weeks)
# - Gather feedback
# - Fix issues
# - Update migration guide

# 4. Create RC
npm run release:rc
# 1.0.0-beta.5 → 1.0.0-rc.0

npm publish --tag rc --access public

# 5. RC testing (1-2 weeks)
# - Final validation
# - No new features

# 6. Create stable release
npm run release

# 1.0.0-rc.2 → 1.0.0

# 7. Publish
npm publish --access public

# 8. Create GitHub release
# - Tag: v1.0.0
# - Mark as major release
# - Include migration guide
# - List breaking changes

# 9. Major announcement
# - Blog post
# - Documentation site
# - Social media
# - Email newsletter (if applicable)
```

**Checklist:**

- [ ] Breaking changes documented
- [ ] Migration guide created
- [ ] Extended beta testing
- [ ] RC validation complete
- [ ] Major version created
- [ ] Published
- [ ] GitHub release created
- [ ] Major announcement
- [ ] Documentation updated

## Hotfix Workflow

### Critical Bug in Stable

```bash
# Current state:
# - Stable: 0.2.5
# - Beta: 0.3.0-beta.2 (next version in progress)
# - Critical bug found in 0.2.5

# 1. Create hotfix branch from stable tag
git checkout v0.2.5
git checkout -b hotfix/critical-security-fix

# 2. Fix bug
git commit -m "fix: resolve critical security vulnerability"

# 3. Test fix thoroughly
npm test
npm run validate:all

# 4. Create patch release
npm version patch
# 0.2.5 → 0.2.6

npm run sync:versions

# 5. Publish hotfix
npm publish --access public

# 6. Create GitHub release
# Tag: v0.2.6
# Title: v0.2.6 (Security Hotfix)
# Mark as important

# 7. Announce immediately
# - Security advisory
# - Urge users to upgrade

# 8. Merge fix to main
git checkout main
git merge hotfix/critical-security-fix

# 9. Apply fix to beta (if needed)
git checkout beta
git cherry-pick <commit-hash>
npm version prerelease
npm publish --tag beta --access public

# 10. Clean up
git branch -d hotfix/critical-security-fix
```

**Checklist:**

- [ ] Hotfix branch created
- [ ] Bug fixed and tested
- [ ] Patch version created
- [ ] Published immediately
- [ ] Security advisory issued
- [ ] Users notified
- [ ] Fix merged to main
- [ ] Fix applied to beta
- [ ] Hotfix branch cleaned up

## Daily Development Workflow

### Working on Features

```bash
# 1. Create feature branch (optional)
git checkout -b feature/new-rule

# 2. Develop feature
# Make changes
git commit -m "feat: add new validation rule"

# 3. Test locally
npm test
npm run build

# 4. Create PR
git push origin feature/new-rule
# Open PR on GitHub

# 5. After merge
git checkout main
git pull

# 6. When ready to release
# Use appropriate release workflow above
```

### Pre-commit Checks

Automated by Husky:

```bash
# Runs automatically on commit:
npm run lint-staged
npm run check:version-sync
```

## Emergency Procedures

### Need to Unpublish

**Within 72 hours:**

```bash
npm unpublish claudelint@0.2.0-beta.0
```

**After 72 hours:**

```bash
# Can't unpublish, must deprecate
npm deprecate claudelint@0.2.0-beta.0 "Critical bug, do not use"

# Publish fixed version immediately
npm version patch
npm publish --access public
```

### Wrong Tag Published

```bash
# Published beta as latest by accident
npm publish  # Should have been: npm publish --tag beta

# Fix: Move tags
npm dist-tag add claudelint@0.2.4 latest    # Restore previous stable
npm dist-tag add claudelint@0.3.0-beta.0 beta  # Move beta to beta tag
```

### Lost NPM Access

```bash
# 1. Reset password at npmjs.com
# 2. Re-login
npm login

# 3. Verify access
npm whoami
npm owner ls claudelint
```

## Automation

### Using release-it (Current)

All releases automated via release-it:

```bash
npm run release        # Auto-determine version
npm run release:beta   # Beta release
npm run release:rc     # Release candidate
npm run release:patch  # Patch version
npm run release:minor  # Minor version
npm run release:major  # Major version
```

### Future: GitHub Actions

Potential automation:

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    branches: [main]

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
      - run: npm ci
      - run: npm test
      - run: npm run release -- --ci
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## Tips

1. **Always test locally first**: `npm pack` and install the tarball
2. **Use dry run**: `npm run release:dry` to preview changes
3. **Check dist-tags**: `npm view claudelint dist-tags` after publishing
4. **Verify installation**: Install from npm after publishing
5. **Keep CHANGELOG current**: Update as you develop, not at release time
6. **Tag git commits**: release-it does this automatically
7. **Create GitHub releases**: Provides download links and release notes
8. **Communicate**: Announce releases to users
9. **Monitor issues**: Watch for bug reports after releases
10. **Plan ahead**: Know your next version before releasing current

## Quick Reference

| Command | Purpose | Version Change |
|---------|---------|----------------|
| `npm run release:beta` | Beta release | 0.2.0 → 0.2.1-beta.0 |
| `npm run release:rc` | Release candidate | 0.2.0-beta.5 → 0.2.0-rc.0 |
| `npm run release` | Auto-detect | Based on commits |
| `npm run release:patch` | Patch release | 0.2.0 → 0.2.1 |
| `npm run release:minor` | Minor release | 0.2.0 → 0.3.0 |
| `npm run release:major` | Major release | 0.2.0 → 1.0.0 |
| `npm run release:dry` | Test release | No changes |

## Next Steps

- [ ] Configure release-it
- [ ] Test release workflow
- [ ] Document in CONTRIBUTING.md
- [ ] Train team on process
- [ ] Set up GitHub Actions (future)
