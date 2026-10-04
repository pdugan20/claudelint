# October 2026 issue and release follow-through

Target: **0.10.0**. The batch combines fixes for all six open bug reports with new
upstream schema support. Local preparation does not publish a package or close an
issue. Publish through the existing release-it and tag-triggered OIDC workflow.

## Issue decisions

| Issue | Finding and implementation | Closeout |
| --- | --- | --- |
| [#233](https://github.com/pdugan20/claudelint/issues/233) | Valid. Component references resolve from the plugin root above `.claude-plugin`, with flat manifests retained. Mixed inline/path arrays and command maps are supported. | Reply and close after npm publication. |
| [#234](https://github.com/pdugan20/claudelint/issues/234) | Valid. Heading counts exclude fenced examples, including tilde fences and longer delimiters. | Reply and close after publication. |
| [#235](https://github.com/pdugan20/claudelint/issues/235) | Valid. npm/pnpm parsing distinguishes literal scripts from flags. Workspace, directory, conditional, dynamic, and unknown selectors are skipped when their target cannot be established safely. | Reply and close after publication. |
| [#236](https://github.com/pdugan20/claudelint/issues/236) | Valid. Leading-slash route tokens remain intact and are excluded; missing relative files still report. | Reply and close after publication. |
| [#237](https://github.com/pdugan20/claudelint/issues/237) | Valid. Skill link existence checks exclude fenced examples. | Reply and close after publication. |
| [#238](https://github.com/pdugan20/claudelint/issues/238) | Valid, including both follow-up reports. Unicode word boundaries preserve real pronoun detection. Overrides use the consuming configuration directory and include hidden directories. Code-span link labels remain intact under autofix. | Reply covering all three defects, then close after publication. |
| [#151](https://github.com/pdugan20/claudelint/issues/151) | Valid current drift. Canonical plugin reference URLs, nested-page discovery, extraction, schemas, and docs are refreshed. | Keep the recurring tracker open; summarize this refresh after merge. |
| [#200](https://github.com/pdugan20/claudelint/issues/200) | Active dependency dashboard. Compatible updates are included; explicit migration decisions are below. | Keep open. |

Loaded and inherited override patterns are relative to the consuming config's
directory; inline public API configuration uses `cwd`. Direct validator callers
without a config source retain their prior absolute-path matching. API inspection,
CLI `resolve-config`, and validation share the matcher.

## Upstream review

Reviewed substantive additions, deletions, and rewritten prose across all 12 changed
baseline pages. Relocated watched sources now use `plugins/manifest-reference`,
`plugins/marketplace-reference`, and `plugins/dependencies`, retaining stable local
page IDs. Extraction floors remain enforced. HTML headings, compound field cells,
and nested index paths have regression coverage; obsolete ignored examples were removed.

Added ten settings, `omitClaudeMd` for agents, `requestTimeout` for LSP servers,
`SubagentHandback`, plugin listing URLs/icon/settings/types, command maps, mixed
configuration arrays, and current monitor and fixed-choice user configuration forms.
Nested channel, user configuration, monitor, and LSP objects reject unknown keys as
documented. Gateway ranges enforce count, prefix, private-space, and overlap limits.
Non-semver plugin versions are valid strings; the existing semver rule is now a
configurable warning. Generated rule docs, presets, reference JSON schemas, and
website schema tables reflect these changes.

Discovery now sees nested SDK, plugin, mods, and weekly-news pages. Projects and SDK
session orchestration have no current static schema consumer. The new mods reference
also defines executable hooks modules and runtime event/API contracts; comprehensive
mods validation is a separate feature, not established by this refresh. Keep discovery
active and add a dedicated watched source and consumer when that feature is selected.
The existing plugin references cover the manifest fields added in this batch.

Primary sources: [manifest reference](https://code.claude.com/docs/en/plugins/manifest-reference),
[marketplace reference](https://code.claude.com/docs/en/plugins/marketplace-reference),
[settings reference](https://code.claude.com/docs/en/settings-reference),
[mods reference](https://code.claude.com/docs/en/plugins/mods/reference), and
[Projects](https://code.claude.com/docs/en/claude-projects).

## Dependency decisions

The lockfile includes the compatible updates represented by
[PR #241](https://github.com/pdugan20/claudelint/pull/241),
[PR #245](https://github.com/pdugan20/claudelint/pull/245),
[PR #248](https://github.com/pdugan20/claudelint/pull/248), and
[PR #250](https://github.com/pdugan20/claudelint/pull/250).
After this batch merges, close those redundant PRs as superseded, linking the merged
change, unless their bots already close them. Do not merge stale alternate lockfiles.

Additional compatible patches include ignore 7.0.12, eslint-plugin-tsdoc 0.5.4,
publint 0.3.25, sharp 0.35.5, fast-uri 3.1.8, and Undici 7.30.0. Markdownlint CLI's
js-yaml is scoped to the root's patched 5.4.2 range. Codecov 7.1.1 and PR-size-labeler
1.12.0 use verified immutable commit pins; provenance and exact workflow profiles are
updated. Workflow permissions and the publication contract are unchanged. Jest's
unsupported per-project worker option moves to a bounded root worker count.

Retain these intentional deferrals:

- TypeScript 7: current ts-jest requires TypeScript below 7, and TypeScript ESLint
  requires below 6.1. Upgrade only after compatible lint/test tooling is available.
- Vite 8: VitePress 1.6.4 declares Vite 5; keep the tested Vite 6 override pending a
  supported website migration.
- Undici 8: release-it 21 depends on Undici 7; retain its compatible patched major.
- Node 24 declarations: keep Node 22 declarations while the runtime minimum is 22.13.
- Satori 0.35 and fflate 0.8: separate image-generation compatibility migration;
  Satori still declares fflate 0.7.3 and the existing patched 0.7.5 override remains.
- Emoji-regex 11 and JSDoc 65: separate major tooling changes; no release-blocking
  defect in the currently tested versions was identified.

The production audit has **zero vulnerabilities**. The complete development tree
still reports **19 high findings**, propagated from two underlying advisories:

- [braces stack exhaustion](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm): no
  published patched version is available. Used by lint/test file-discovery tools.
- [basic-ftp directory-listing denial of service](https://github.com/advisories/GHSA-c475-qrg2-pj4r):
  the release-it proxy chain's latest get-uri 8.0.1 still requires basic-ftp 5.3.1;
  the patched basic-ftp 6 line is outside that range. Track the parent update rather
  than silently forcing a new major under release tooling.

These are not runtime dependencies of the packed npm package. Audit suggestions to
backgrade release-it/remark/tsd are not applied. The residual findings remain an
explicit maintenance item under #200, not a claim that the whole tree is audit-clean.

## Verification

Final verification on Node 22.22.2 passed:

- 2,758 tests across 232 suites; all 11 snapshots passed.
- TypeScript build, all linters, formatting, and publint 0.3.25.
- All nine aggregate repository checks, schema synchronization, upstream conformance,
  schema documentation coverage, and GitHub Actions security contracts.
- API declaration tests, API examples, and API Extractor report (unchanged).
- VitePress production build with generated rule docs and OG images; plugin ZIP packaging.
- Self-lint: 18 files across six categories with no findings.
- Isolated installation of the packed npm tarball; issue regression checks and CLI
  configuration inspection passed on Node 22.13.0 and 24.21.0.
- Production npm audit: zero vulnerabilities. Full-tree residuals are documented above.

The packed consumer check also exposed and fixed an existing `claude-md-size` bug:
it read filesystem metadata instead of the supplied content. It now measures UTF-8
bytes from the content being linted, including unsaved input. Regression tests cover
multibyte text and differing on-disk content; file-existence diagnostics remain separate.

One GPT-6 Luna reviewer at medium effort was reused for bounded upstream prose,
implementation, and tooling reviews. Its findings were fixed and re-reviewed. Exact
billing is not exposed. No unresolved actionable finding remains from those reviews.

The package remains at 0.9.0 until the release generator performs the synchronized
version bump and changelog. The 0.10.0 dry-run preview is checked after local commits;
no branch/tag has been pushed, package published, or issue reply posted.

## Proposed replies

Post only after npm confirms 0.10.0 is available. Each reply should acknowledge the
specific report and include the upgrade instruction; then close as completed.

### #233

Thanks for the clear reproduction. Fixed in `claude-code-lint@0.10.0`: paths in
`.claude-plugin/plugin.json` now resolve from the plugin root. Regression tests cover
skills, agents, commands, hooks, MCP, LSP, and output styles. Upgrade with
`npm install -D claude-code-lint@0.10.0` (or use `-g` for a global installation).

### #234

Thanks for reporting this. Fixed in `claude-code-lint@0.10.0`: headings and shell
comments inside fenced examples no longer count as document sections. Tests cover
backtick, tilde, and longer fences while retaining real headings after the example.
Upgrade with `npm install -D claude-code-lint@0.10.0` (or `-g` for a global install).

### #235

Thanks for the reproduction. Fixed in `claude-code-lint@0.10.0`: npm/pnpm flags no
longer become script names. Literal missing scripts still report; commands that
select another workspace or directory are skipped when the target is ambiguous.
Upgrade with `npm install -D claude-code-lint@0.10.0` (or `-g` for a global install).

### #236

Thanks for reporting this. Fixed in `claude-code-lint@0.10.0`: leading-slash routes
such as `/api-docs/openapi.json` are excluded from relative-file checks. Missing
relative references still report. Upgrade with `npm install -D claude-code-lint@0.10.0`
(or `-g` for a global install).

### #237

Thanks for the clear example. Fixed in `claude-code-lint@0.10.0`: links inside fenced
code examples are ignored, while links in surrounding prose are still checked.
Upgrade with `npm install -D claude-code-lint@0.10.0` (or `-g` for a global install).

### #238

Thanks for the detailed report and the two follow-ups. All three are fixed in
`claude-code-lint@0.10.0`: Unicode words such as Braþi no longer trigger the pronoun
check, configuration overrides match paths relative to the config directory
(including `.claude` directories), and links with code-span labels are recognized
without being rewritten into nested links by autofix.

Descriptions and body prose may contain Unicode; skill identifiers retain their
separate naming constraints. Regression tests cover Unicode and combining marks,
real first/second-person pronouns, override matching/precedence, and autofix
idempotence. After upgrading, the workaround disable directives can be removed;
`reportUnusedDisableDirectives` can help identify them. Upgrade with
`npm install -D claude-code-lint@0.10.0` (or `-g` for a global install).

## Publication sequence

1. Approve pushing the reviewed branch and opening/merging its PR; require green CI.
2. On updated main, run the documented minor release command. Let release-it generate
   the changelog, synchronize package/plugin versions, and push the release tag.
3. Confirm the tag-triggered OIDC publish job, npm version/provenance, and an isolated
   consumer installation of the published package.
4. Post the approved replies and close #233–#238. Close superseded dependency PRs.
5. Leave #151 and #200 open; post concise progress comments with the remaining
   maintenance decisions if approved.
