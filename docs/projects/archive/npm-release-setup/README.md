# NPM Release Setup Project

Project to establish professional npm package versioning, release automation, and publish `claudelint` as an unscoped package.

## Project Goals

1. **Claim package name**: Publish `claudelint` (unscoped) to npm
2. **Automate releases**: Use release-it for versioning and publishing
3. **Synchronize versions**: Keep all version references in sync
4. **Establish workflow**: Document and standardize release process

## Current Status

**Phase:** Not Started
**Package Name:** `claudelint` (scoped) → `claudelint` (unscoped)
**Current Version:** 0.2.0
**Target Version:** 0.2.0-beta.0

## Documentation

- **[tracker.md](./tracker.md)** - Central progress tracker with checklists for all phases
- **[release-it-setup.md](./release-it-setup.md)** - Complete release-it configuration guide
- **[version-sync.md](./version-sync.md)** - Version synchronization strategy and scripts
- **[package-name-migration.md](./package-name-migration.md)** - Migration from scoped to unscoped package name
- **[publishing-strategy.md](./publishing-strategy.md)** - Beta, RC, and stable release strategy
- **[workflow.md](./workflow.md)** - Day-to-day release workflow and checklists

## Quick Start

### Phase 1: Setup

```bash
# Install dependencies
npm install --save-dev release-it @release-it/conventional-changelog

# Verify npm login
npm whoami
```

### Phase 2: Version Sync

```bash
# Create and run version sync script
npm run sync:versions
```

### Phase 3: Package Name Migration

```bash
# Test migration (dry run)
npm run migrate:name:dry

# Execute migration
npm run migrate:name
```

### Phase 4: First Beta Release

```bash
# Use release-it
npm run release:beta

# Publish with beta tag
npm publish --tag beta --access public
```

## Project Structure

```text
docs/projects/npm-release-setup/
├── README.md                      # This file
├── tracker.md                     # Progress tracker (START HERE)
├── release-it-setup.md            # release-it configuration
├── version-sync.md                # Version synchronization
├── package-name-migration.md      # Name migration guide
├── publishing-strategy.md         # Publishing workflow
└── workflow.md                    # Daily release workflow
```

## Implementation Phases

### Phase 1: Environment Setup [Not Started]

Install release-it and configure npm access.

**Documents:** [tracker.md](./tracker.md#phase-1-environment-setup), [release-it-setup.md](./release-it-setup.md)

### Phase 2: Version Synchronization [Not Started]

Create scripts to sync version numbers across all files.

**Documents:** [tracker.md](./tracker.md#phase-2-version-synchronization), [version-sync.md](./version-sync.md)

### Phase 3: Package Name Migration [Not Started]

Migrate from `claudelint` to `claudelint`.

**Documents:** [tracker.md](./tracker.md#phase-3-package-name-migration), [package-name-migration.md](./package-name-migration.md)

### Phase 4: Pre-Release Preparation [Not Started]

Build, test, and prepare for first beta release.

**Documents:** [tracker.md](./tracker.md#phase-4-pre-release-preparation)

### Phase 5: First Beta Release [Not Started]

Publish `claudelint@beta` to npm and claim the package name.

**Documents:** [tracker.md](./tracker.md#phase-5-first-beta-release), [publishing-strategy.md](./publishing-strategy.md)

### Phase 6: Release Workflow Documentation [Not Started]

Document the ongoing release process for contributors.

**Documents:** [tracker.md](./tracker.md#phase-6-release-workflow-documentation), [workflow.md](./workflow.md)

### Phase 7: Stable Release Preparation [Not Started]

Test beta, gather feedback, and prepare for stable 0.2.0 release.

**Documents:** [tracker.md](./tracker.md#phase-7-stable-release-preparation), [publishing-strategy.md](./publishing-strategy.md#stable-release-020)

### Phase 8: Ongoing Maintenance [Not Started]

Establish release cadence and automation for future releases.

**Documents:** [tracker.md](./tracker.md#phase-8-ongoing-maintenance)

## Key Decisions

### Why release-it?

- Automates versioning, changelog, git tags, and publishing
- Supports conventional commits
- Integrates with npm dist-tags
- Flexible plugin system
- Industry standard

### Why unscoped package?

- Shorter, more memorable name (`claudelint` vs `claudelint`)
- Easier to install (`npm i claude-code-lint` vs `npm i claude-code-lint`)
- More discoverable on npm
- Professional appearance

### Why beta first?

- Allows testing before committing to stable API
- Users won't accidentally install unstable version
- Time to gather feedback and fix issues
- Standard practice for 0.x packages

## Success Criteria

- [ ] Package published as `claudelint` on npm
- [ ] Beta version (`0.2.0-beta.0`) available via `npm install claude-code-lint@beta`
- [ ] All version numbers synchronized across codebase
- [ ] release-it configured and working
- [ ] Release workflow documented
- [ ] Contributors can follow release process

## Timeline

- **Phase 1-3:** 1-2 days (setup and scripts)
- **Phase 4-5:** 1 day (first beta)
- **Phase 6:** 1 day (documentation)
- **Phase 7:** 1-2 weeks (beta testing)
- **Phase 8:** Ongoing

**Total:** ~2 weeks to stable release

## Resources

### NPM Documentation

- [Semantic Versioning](https://semver.org/)
- [npm-version](https://docs.npmjs.com/cli/v8/commands/npm-version)
- [npm-publish](https://docs.npmjs.com/cli/v8/commands/npm-publish)
- [npm-dist-tag](https://docs.npmjs.com/cli/v8/commands/npm-dist-tag)

### Tools

- [release-it](https://github.com/release-it/release-it)
- [@release-it/conventional-changelog](https://www.npmjs.com/package/@release-it/conventional-changelog)
- [Conventional Commits](https://www.conventionalcommits.org/)

### Best Practices

- [How to Prerelease an npm Package](https://cloudfour.com/thinks/how-to-prerelease-an-npm-package/)
- [npm Versioning Guide](https://www.datree.io/resources/npm-versioning-guide)

## Next Steps

1. Review [tracker.md](./tracker.md) for detailed task checklist
2. Start with Phase 1: Environment Setup
3. Work through phases sequentially
4. Mark tasks complete in tracker as you go
5. Refer to specific guides as needed

## Questions?

- Review the documentation in this folder
- Check the [tracker.md](./tracker.md) risk register
- Consult [publishing-strategy.md](./publishing-strategy.md) troubleshooting section

## Notes

- Package name `claudelint` verified as available (2026-01-30)
- Using beta tag prevents accidental unstable installations
- Version sync script will be integrated with release-it hooks
- Following SemVer 2.0.0 strictly
