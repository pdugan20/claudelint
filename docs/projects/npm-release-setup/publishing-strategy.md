# Publishing Strategy

Complete strategy for publishing claude-code-lint to npm, from beta to stable releases.

## Overview

Publishing workflow:

1. Beta releases (`0.2.0-beta.0`) - Early testing with `beta` tag
2. Release candidates (`0.2.0-rc.0`) - Final validation with `rc` tag
3. Stable releases (`0.2.0`) - Production ready with `latest` tag

## NPM Dist Tags

### What are Dist Tags?

Dist tags are labels that point to specific versions. When users run `npm install claude-code-lint`, npm uses the version tagged as `latest`.

### Default Tags

- `latest` - Default for `npm install claude-code-lint` (stable releases only)
- `beta` - For beta testing: `npm install claude-code-lint@beta`
- `rc` - For release candidates: `npm install claude-code-lint@rc`
- `next` - For development builds (optional)
- `alpha` - For alpha testing (optional)

### Why Tags Matter

Without proper tags, even beta versions become the default install:

```bash
# BAD: Publish beta without tag
npm publish
# Users get: npm install claude-code-lint → 0.2.0-beta.0 (WRONG!)

# GOOD: Publish beta with tag
npm publish --tag beta
# Users get: npm install claude-code-lint → (latest stable)
# Beta users: npm install claude-code-lint@beta → 0.2.0-beta.0 (CORRECT)
```

## First Beta Release (0.2.0-beta.0)

### Pre-publish Checklist

- [ ] Version synced across all files
- [ ] Package name migrated to `claude-code-lint`
- [ ] Build succeeds: `npm run build`
- [ ] Tests pass: `npm test`
- [ ] Linting passes: `npm run lint`
- [ ] Markdown linting passes: `npm run lint:md`
- [ ] Local installation works: `npm pack` → install tarball
- [ ] Git working directory clean
- [ ] CHANGELOG.md updated
- [ ] README.md has beta warning

### Beta Warning in README

Add to top of README.md:

```markdown
> **Beta Release**: claude-code-lint is currently in beta testing (v0.2.0-beta.x).
> The API may change before the stable 1.0.0 release. Please report issues
> at [github.com/pdugan20/claude-code-lint/issues](https://github.com/pdugan20/claude-code-lint/issues).
```

### Publishing Steps

```bash
# 1. Verify npm login
npm whoami
# Should show your npm username

# 2. Run pre-publish checks
npm run validate:all

# 3. Build fresh
npm run clean
npm run build

# 4. Pack and test locally
npm pack
# Creates: claude-code-lint-0.2.0-beta.0.tgz

# Install globally from tarball
npm install -g ./claude-code-lint-0.2.0-beta.0.tgz

# Test CLI
claude-code-lint --version
claude-code-lint --help
claude-code-lint check-all

# Uninstall test version
npm uninstall -g claude-code-lint

# 5. Publish to npm with beta tag
npm publish --tag beta --access public

# 6. Verify on npm
npm view claude-code-lint

# Should show:
# name: claude-code-lint
# version: 0.2.0-beta.0
# dist-tags:
#   beta: 0.2.0-beta.0
```

### Post-publish Verification

```bash
# Test installation from npm
npm install -g claude-code-lint@beta

# Verify version
claude-code-lint --version
# Should show: 0.2.0-beta.0

# Test basic functionality
cd /tmp
mkdir test-claude-code-lint
cd test-claude-code-lint
claude-code-lint init
claude-code-lint check-all

# Check package page
open https://www.npmjs.com/package/claude-code-lint
```

### What Users See

```bash
# Default install (no stable version yet)
npm install claude-code-lint
# Error: No version tagged as 'latest'

# Beta install (correct way)
npm install claude-code-lint@beta
# Installs: 0.2.0-beta.0
```

## Subsequent Beta Releases (0.2.0-beta.1, etc.)

### When to Release Beta

- Bug fixes during beta period
- New features added during beta
- Breaking changes before stable

### Using release-it

```bash
# Automatic beta increment: 0.2.0-beta.0 → 0.2.0-beta.1
npm run release:beta

# release-it will:
# 1. Bump version to 0.2.0-beta.1
# 2. Run sync:versions script
# 3. Update CHANGELOG.md
# 4. Create git commit
# 5. Create git tag
# 6. Prompt to publish

# Confirm publish with beta tag
# Type: beta
```

### Manual Process

```bash
# Bump version
npm version prerelease --preid=beta
# 0.2.0-beta.0 → 0.2.0-beta.1

# Sync versions
npm run sync:versions

# Build and test
npm run build
npm test

# Publish with beta tag
npm publish --tag beta --access public
```

## Release Candidate (0.2.0-rc.0)

### When to Create RC

- Beta testing complete
- No known critical bugs
- Ready for final validation
- 1-2 weeks before stable

### Creating RC

```bash
# Using release-it
npm run release:rc

# Or manually
npm version prerelease --preid=rc
# 0.2.0-beta.5 → 0.2.0-rc.0

npm run sync:versions
npm run build
npm test
npm publish --tag rc --access public
```

### What Changes from Beta

- More stable API (avoid breaking changes)
- Feature freeze (only bug fixes)
- Documentation finalized
- Migration guides complete
- Release notes drafted

### RC Testing Period

**Duration:** 1-2 weeks

**Goals:**

- Identify any remaining bugs
- Validate documentation
- Test in real projects
- Gather final feedback

**No new features** during RC period.

## Stable Release (0.2.0)

### Pre-release Checklist

- [ ] RC testing period complete (1-2 weeks)
- [ ] No critical bugs reported
- [ ] All tests passing
- [ ] Documentation complete
- [ ] CHANGELOG.md finalized
- [ ] Migration guide ready (if breaking changes)
- [ ] README.md beta warning removed
- [ ] Examples all working
- [ ] CI/CD passing

### Creating Stable Release

```bash
# Using release-it (recommended)
npm run release

# release-it detects 0.2.0-rc.2 → 0.2.0 automatically

# Or manually
npm version 0.2.0
npm run sync:versions
npm run build
npm test

# Publish WITHOUT tag (gets 'latest' automatically)
npm publish --access public
```

### Important: Latest Tag

```bash
# After publishing 0.2.0, verify latest tag
npm view claude-code-lint dist-tags

# Should show:
# latest: 0.2.0
# beta: 0.2.0-beta.5
# rc: 0.2.0-rc.2
```

### Post-release Tasks

- [ ] Create GitHub release with notes
- [ ] Update README.md (remove beta warning)
- [ ] Update documentation links
- [ ] Announce release (Twitter, Discord, etc.)
- [ ] Close milestone/project board
- [ ] Plan next version

### What Users See (After Stable)

```bash
# Default install now works
npm install claude-code-lint
# Installs: 0.2.0 (stable)

# Beta users can stay on beta
npm install claude-code-lint@beta
# Installs: 0.2.0-beta.5 (last beta)

# Or upgrade to stable
npm install claude-code-lint@latest
# Installs: 0.2.0 (stable)
```

## Subsequent Releases

### Patch Release (0.2.1)

Bug fixes, no new features:

```bash
npm run release:patch
# 0.2.0 → 0.2.1

npm publish --access public
```

### Minor Release (0.3.0)

New features, backward compatible:

```bash
npm run release:minor
# 0.2.1 → 0.3.0

npm publish --access public
```

### Major Release (1.0.0)

Breaking changes:

```bash
# Beta cycle for major version
npm run release:beta
# 0.3.5 → 1.0.0-beta.0

npm publish --tag beta --access public

# After beta testing
npm run release:rc
# 1.0.0-beta.5 → 1.0.0-rc.0

npm publish --tag rc --access public

# Final stable
npm run release
# 1.0.0-rc.2 → 1.0.0

npm publish --access public
```

## Hotfix Workflow

Critical bug in stable version:

```bash
# Current: 0.2.0 (stable), 0.3.0-beta.2 (beta in progress)

# Option 1: Patch stable and merge forward
git checkout v0.2.0
git checkout -b hotfix/critical-bug

# Fix bug
# Test fix

npm version patch
# 0.2.0 → 0.2.1

npm publish --access public

# Merge fix to main
git checkout main
git merge hotfix/critical-bug

# Continue beta development
npm version 0.3.0-beta.3
npm publish --tag beta --access public
```

## NPM Access Control

### Public vs Private

Unscoped packages must be public:

```bash
# First publish of unscoped package
npm publish --access public

# Subsequent publishes
npm publish  # Access level persists
```

### Scoped Packages

If you ever use `@username/package`:

```bash
# Public scoped package
npm publish --access public

# Private scoped package (requires paid npm account)
npm publish --access restricted
```

## Unpublishing (Emergency Only)

**Warning:** Only use within 72 hours of publish.

```bash
# Unpublish specific version
npm unpublish claude-code-lint@0.2.0-beta.0

# NEVER unpublish stable versions
# Instead, deprecate:
npm deprecate claude-code-lint@0.2.0 "Critical bug, upgrade to 0.2.1"
```

## Deprecation

Mark old versions as deprecated:

```bash
# Deprecate single version
npm deprecate claude-code-lint@0.1.0 "Upgrade to 0.2.0 or later"

# Deprecate range
npm deprecate claude-code-lint@"< 0.2.0" "Upgrade to 0.2.0 or later"
```

## Version Lifecycle

```
Development
    ↓
0.2.0-alpha.0 (optional, internal testing)
    ↓
0.2.0-beta.0 (public beta testing)
    ↓
0.2.0-beta.1 (bug fixes)
    ↓
0.2.0-beta.2 (bug fixes)
    ↓
0.2.0-rc.0 (release candidate)
    ↓
0.2.0-rc.1 (critical fixes only)
    ↓
0.2.0 (stable release) ← 'latest' tag
    ↓
0.2.1 (patch)
    ↓
0.3.0 (minor)
    ↓
1.0.0-beta.0 (next major)
```

## Best Practices

1. **Always use dist tags for prereleases**
2. **Test locally before publishing** (npm pack)
3. **Use semantic versioning strictly**
4. **Keep CHANGELOG.md updated**
5. **Test installation from npm after publish**
6. **Don't skip RC for major versions**
7. **Communicate breaking changes clearly**
8. **Deprecate instead of unpublish**
9. **Tag git commits with versions**
10. **Create GitHub releases for stable versions**

## Troubleshooting

### "latest tag not found"

Users can't install because no stable version exists:

```bash
# They see:
npm install claude-code-lint
# Error: No version published with tag 'latest'

# Solution: Direct them to beta
npm install claude-code-lint@beta
```

### Published wrong tag

```bash
# Accidentally published beta as latest
npm publish  # Should have used --tag beta

# Fix: Move latest tag back
npm dist-tag add claude-code-lint@0.1.9 latest
npm dist-tag add claude-code-lint@0.2.0-beta.0 beta
```

### Need to unpublish

```bash
# Within 72 hours
npm unpublish claude-code-lint@0.2.0-beta.0

# After 72 hours: can't unpublish, must deprecate
npm deprecate claude-code-lint@0.2.0-beta.0 "Do not use, broken build"
```

## Checklist Templates

See [workflow.md](./workflow.md) for detailed checklists for each release type.

## Next Steps

- [ ] Plan beta release timeline
- [ ] Create beta release checklist
- [ ] Document hotfix process
- [ ] Set up GitHub releases
- [ ] Configure release-it
