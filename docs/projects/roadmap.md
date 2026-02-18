# Roadmap

**Last Updated:** 2026-02-17
**Current stats:** 117 rules, 1675 tests

Single source of truth for all remaining work. Check off tasks as you complete them.

---

## Release Burndown

### ~~Plugin Spec Alignment~~ (Complete)

Done. Archived to `docs/projects/archive/plugin-spec-alignment/`.

### Interactive Testing (Pre-Release)

**Effort:** ~3.5-4 hours
**Unblocks:** Stable release
**Runbook:** [`scripts/test/manual/manual-testing-runbook.md`](../../scripts/test/manual/manual-testing-runbook.md)

Follow the 6-task runbook. Each task has setup/verify/cleanup scripts in `scripts/test/manual/`.

### Stable Release (0.2.0)

**Effort:** ~2 hours
**Depends on:** Interactive testing above

- [ ] Fix any issues found in testing
- [ ] Update CHANGELOG.md
- [ ] Version bump to 0.2.0: `npm run release`
- [ ] Publish: `npm publish --access public`
- [ ] Verify `latest` tag applied
- [ ] Create GitHub release with highlights
- [ ] Remove beta warnings from docs

### Post-Release

- [ ] Create `.github/SECURITY.md` -- vulnerability reporting policy, security contact, supported versions
- [ ] Add release cadence section to RELEASING.md -- when to patch vs minor vs major, security patch SLA
- [ ] Document security patch process

---

## Future Work

### Advanced Analysis

**Source:** [dogfood-and-improvements](./archive/dogfood-and-improvements/) T3-15/16/17
**Effort:** ~2-3 weeks

- [ ] T3-15: Red flags detection -- stale commands, dead file refs, old TODOs, version mismatches
- [ ] T3-16: Progressive disclosure validation -- enforce 3-level content hierarchy
- [ ] T3-17: Additive guidance engine -- suggest missing sections, heuristics-based

### Deferred / Low Priority

Work these when demand exists or as time permits.

- [ ] E7: `skill-placeholder-content` -- detect TODO/FIXME/HACK in SKILL.md
- [ ] H1-H2: MCP registry validation -- needs public MCP registry API
- [ ] H3-H5: LLM-based quality evaluation -- needs `--llm` flag + Claude API integration
- [ ] H10-H12: External tool integration (shellcheck, pylint, markdownlint)
- [ ] Full manual testing runbook (GitHub install, trigger phrases, quality tests) -- blocked until repo is public

---

## Completed

| Milestone | Summary |
|-----------|---------|
| GitHub Repo | CI/CD, branch protection, 46 labels, Codecov, Discussions |
| Plugin Infrastructure | plugin.json, 9 skills, dependency checks, schema verification |
| npm Beta Release | Published `claude-code-lint@0.2.0-beta.1` |
| Release Documentation | RELEASING.md, CONTRIBUTING.md, release-it scripts |
| Schema Verification | 8 reference schemas, dual-schema drift detection, CI integration |
| Rule Deprecation System | `check-deprecated` + `migrate` commands, deprecation metadata |
| Skill Quality | Trigger phrases, troubleshooting, examples, standard fields on all 9 skills |
| Spec Alignment | 5 new rules (B5-B9), self-fixed all 9 skills |
| Testing Infrastructure | Fluent builders, fixtures, dogfood scripts, CI jobs |
| Rule Reliability | Parsing hardening, regex fixes, banned patterns, ESLint restrictions |
| Config System Audit | Removed dead formats, fixed stale rule IDs, 13 edge case tests |
| Dependency Migrations | Zod 4, markdownlint 0.40, ora 9 |
| Custom Rule Plugin API | `CustomRuleLoader` class, docs |
| Medium Skill Rules | 7 rules (hardcoded-secrets, shell-script-*, description-quality, etc.) |
| Codebase Cross-Referencing | `claude-md-npm-script-not-found`, `claude-md-file-reference-invalid` |
| Smoke Testing | npm pack verified, CLI verified, 0 errors/0 warnings on self |
| VitePress Website | claudelint.com launched, auto-generated rule docs |
| Preset System | `claudelint:recommended` (89 rules), `claudelint:all` (117 rules), config resolver |
| CLI Best Practices | `--output-file`, `--rule`, `--changed`, `--stdin`, option-builders, stdin-reader |
