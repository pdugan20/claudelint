# NPM Release Setup - Progress Tracker

Project to set up professional npm versioning, release automation, and package name migration from `@pdugan20/claudelint` to `claudelint`.

**Status:** In Progress
**Start Date:** 2026-01-30
**Target Completion:** TBD

## Phase 1: Environment Setup

### 1.1 Install Dependencies

- [x] Install release-it: `npm install --save-dev release-it`
- [x] Install conventional changelog plugin: `npm install --save-dev @release-it/conventional-changelog`
- [ ] Verify npm login status: `npm whoami` (Need to run `npm login`)
- [x] Verify git is clean and up to date

### 1.2 Create Configuration Files

- [x] Create `.release-it.json` configuration
- [x] Update `.gitignore` if needed (already has .env coverage)
- [x] Add release scripts to package.json
- [x] Document release-it workflow (see release-it-setup.md)

**Phase 1 Completion Criteria:**
- [x] All dependencies installed
- [x] Configuration files created
- [x] Release scripts functional (pending npm login for actual publishing)

---

## Phase 2: Version Synchronization

### 2.1 Audit Current Versions

- [x] Audit all version numbers across codebase
- [x] Document version discrepancies (3 files out of sync: plugin.json, marketplace.json, integration example)
- [x] Create version sync script

### 2.2 Create Version Sync Script

- [x] Create `scripts/sync-versions.ts`
- [x] Script updates package.json (reads primary version)
- [x] Script updates plugin.json
- [x] Script updates .claude-plugin/marketplace.json
- [x] Script updates examples/integration/package.json
- [x] Add npm script: `sync:versions`
- [x] Test script execution (successfully synced 3 files to 0.2.0)

### 2.3 Update to Beta Version

- [ ] Run version sync script
- [ ] Update all versions to `0.2.0-beta.0`
- [ ] Verify all version references updated
- [ ] Commit version sync changes

**Phase 2 Completion Criteria:**
- All version numbers synchronized
- Version sync script functional
- Version set to 0.2.0-beta.0

---

## Phase 3: Package Name Migration

### 3.1 Create Migration Script

- [ ] Create `scripts/migrate-package-name.ts`
- [ ] Script finds all `@pdugan20/claudelint` references
- [ ] Script replaces with `claudelint`
- [ ] Script updates package.json name field
- [ ] Script updates README badges
- [ ] Script updates all documentation
- [ ] Script updates all examples
- [ ] Script updates integration packages
- [ ] Add npm script: `migrate:name`
- [ ] Test script on sample files (dry-run mode)

### 3.2 Verify Migration Scope

- [ ] Review all files that will be changed
- [ ] Check for any missed references
- [ ] Verify no breaking changes to API exports
- [ ] Document migration for users (if any published versions exist)

**Phase 3 Completion Criteria:**
- Migration script functional and tested
- All references identified
- Ready to execute migration

---

## Phase 4: Pre-Release Preparation

### 4.1 Build and Test

- [ ] Run `npm run build`
- [ ] Run `npm run test`
- [ ] Run `npm run lint`
- [ ] Run `npm run format:check`
- [ ] Run `npm run lint:md`
- [ ] Run `npm run validate:all`
- [ ] Verify dist/ output is correct

### 4.2 Documentation Review

- [ ] Update README with beta installation instructions
- [ ] Update CHANGELOG.md for 0.2.0-beta.0
- [ ] Update any version references in docs
- [ ] Add beta warning to README
- [ ] Document known limitations/issues

### 4.3 Package Audit

- [ ] Verify package.json `files` field includes all necessary files
- [ ] Test local installation: `npm pack` and install tarball
- [ ] Verify CLI works from packed tarball
- [ ] Verify programmatic API works from packed tarball

**Phase 4 Completion Criteria:**
- All tests passing
- Documentation complete
- Package verified locally

---

## Phase 5: First Beta Release

### 5.1 Execute Migration

- [ ] Run package name migration script
- [ ] Verify all references updated to `claudelint`
- [ ] Commit name migration changes
- [ ] Create git tag: `v0.2.0-beta.0`

### 5.2 Publish Beta

- [ ] Verify npm login: `npm whoami`
- [ ] Dry run: `npm publish --dry-run --tag beta --access public`
- [ ] Review dry-run output
- [ ] Publish: `npm publish --tag beta --access public`
- [ ] Verify package on npmjs.com
- [ ] Test installation: `npm install claudelint@beta`
- [ ] Verify installed CLI works
- [ ] Verify installed API works

### 5.3 Post-Release Verification

- [ ] Check npm package page displays correctly
- [ ] Test installation in clean directory
- [ ] Verify README renders on npm
- [ ] Update GitHub release with notes
- [ ] Announce beta release (if applicable)

**Phase 5 Completion Criteria:**
- Package published to npm as `claudelint@beta`
- Package installs and functions correctly
- Name claimed on npm registry

---

## Phase 6: Release Workflow Documentation

### 6.1 Create Documentation

- [ ] Document beta release process
- [ ] Document stable release process
- [ ] Document hotfix process
- [ ] Document version bump workflow
- [ ] Add CONTRIBUTING.md section on releases
- [ ] Create release checklist template

### 6.2 Automate Where Possible

- [ ] Add pre-publish checks (prepublishOnly script)
- [ ] Add version validation script
- [ ] Add release-it npm scripts
- [ ] Document CI/CD integration (future)

**Phase 6 Completion Criteria:**
- Release process documented
- Scripts automated
- Contributors can follow process

---

## Phase 7: Stable Release Preparation

### 7.1 Beta Testing Period

- [ ] Set testing timeline (recommended: 1-2 weeks)
- [ ] Gather feedback from beta users
- [ ] Fix critical bugs found in beta
- [ ] Document any breaking changes
- [ ] Update CHANGELOG.md

### 7.2 Prepare for Stable

- [ ] All critical issues resolved
- [ ] Documentation reviewed and updated
- [ ] Version bumped to `0.2.0`
- [ ] CHANGELOG.md finalized
- [ ] Migration guide completed (if needed)

### 7.3 Publish Stable Release

- [ ] Run full test suite
- [ ] Build production assets
- [ ] Publish: `npm publish --access public`
- [ ] Verify `latest` tag applied
- [ ] Create GitHub release with notes
- [ ] Update documentation to remove beta warnings
- [ ] Announce stable release

**Phase 7 Completion Criteria:**
- Stable version published
- `latest` tag points to stable release
- Documentation updated
- Release announced

---

## Phase 8: Ongoing Maintenance

### 8.1 Establish Release Cadence

- [ ] Define patch release criteria
- [ ] Define minor release criteria
- [ ] Define major release criteria
- [ ] Document security patch process
- [ ] Set up security advisories monitoring

### 8.2 Automation Improvements

- [ ] Set up GitHub Actions for releases
- [ ] Add automated changelog generation
- [ ] Add automated version bumping
- [ ] Add release candidate workflow
- [ ] Implement OIDC trusted publishing (optional)

**Phase 8 Completion Criteria:**
- Release cadence established
- Automation in place
- Process running smoothly

---

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| Package name already claimed between planning and publishing | High | Check name availability immediately before publish; have fallback name ready |
| Breaking changes in beta not caught | Medium | Thorough testing period; semantic versioning strictly followed |
| Version numbers get out of sync | Medium | Automated version sync script; pre-publish checks |
| Lost access to npm account | High | Document account recovery; consider org namespace for future |
| Dependencies break build | Low | Lock file committed; test before publish |

## Notes

- Using `beta` tag for pre-release to prevent accidental installation
- Using release-it for automation and consistency
- Following SemVer 2.0.0 strictly
- Keeping scoped package name until ready to publish (prevents premature claiming)

## References

- [tracker.md](./tracker.md) - This file
- [release-it-setup.md](./release-it-setup.md) - release-it configuration
- [version-sync.md](./version-sync.md) - Version synchronization strategy
- [package-name-migration.md](./package-name-migration.md) - Name change process
- [publishing-strategy.md](./publishing-strategy.md) - Beta to stable workflow
- [workflow.md](./workflow.md) - Day-to-day release process
