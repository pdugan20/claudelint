# Issue follow-through — September 2026

The issue fixes merged in [#225](https://github.com/pdugan20/claudelint/pull/225) and
shipped as [v0.8.2](https://github.com/pdugan20/claudelint/releases/tag/v0.8.2).
The separate PR closeout task completed its release work before this implementation.

## Completed implementation

| Issue | Outcome |
| --- | --- |
| [#217](https://github.com/pdugan20/claudelint/issues/217) | Settings and local settings run the shared hook rules, including event, handler, and script checks. Raw malformed hook entries are guarded. |
| [#188](https://github.com/pdugan20/claudelint/issues/188) | Removed the plugin-versus-latest-npm version comparison that produced misleading update warnings. |
| [#189](https://github.com/pdugan20/claudelint/issues/189) | Update instructions use the installed marketplace name, including CLI JSON guidance. |
| [#151](https://github.com/pdugan20/claudelint/issues/151) | Moved the watched settings source to the new settings-reference page; preserved extraction floors, linked field names, dotted paths, and fence filenames. |
| [#146](https://github.com/pdugan20/claudelint/issues/146) | Added documented schema fields and conformance checks described below. |

## Documentation evidence and corrections

The committed baseline is the authority for this batch. Field examples are parsed from
`settings-reference.md`, including managed-settings examples. The schema checks value
shapes across scopes; it does not implement Claude Code's file-scope policy enforcement.

- Added 43 newly indexed top-level settings, plus nested permissions, attribution,
  sandbox, credential masking, policy-helper, model, and worktree fields. Complete
  examples retain required siblings, and tests reject silent stripping of their values.
- `forceLoginOrgUUID` accepts a string or a list. `strictPluginOnlyCustomization`
  accepts `true` or an array; its dotted index entries describe array members, not objects.
- `skipDangerousModePermissionPrompt` is top-level, not inside `permissions` as the
  older issue proposed. `workflowSizeGuideline` and `sandbox.ignoreViolations` are now
  explicitly documented settings; their former exclusion is obsolete.
- Added hook events `DirectoryAdded`, `PreModelSwitch`, and `PostModelSwitch`, and
  tools `EndConversation`, `ListAgents`, and `SendFeedback`. Hook `args` selects the
  documented executable form. Agent hooks require `prompt`, not an `agent` field.
- Skill names and descriptions are optional in the schema, with documented fallbacks.
  Model aliases and full identifiers are accepted. Added disallowed tools, background,
  metadata, license, and compatibility. Existing description style rules remain.
- Added agent `experimental.cacheTtl`, LSP `diagnostics`, and output style
  `force-for-plugin`. Corrected the manual LSP restart default to true. Current agent
  background prose makes no unconditional default claim, so no true default is imposed.
- Added MCP dynamic headers, timeout, eager loading, and OAuth options. Fixtures check
  field retention and invalid types for every transport, alongside extracted examples.
- Added plugin display names, initial enablement, metadata, workflows, and experimental
  components. Top-level themes and monitors remain supported for compatibility.
- Added marketplace renames, recommendation metadata, archive authentication, and
  archive/command source forms. Their required source fields are validated without
  executing commands or fetching archives.

Schema-key checks cover every registry entry, selected nested settings tables, and hook
handler fields. Website field tables are checked in both directions; this removed stale
marketplace-owner and hook-handler fields. These checks catch supported field names and
examples, not every runtime semantic constraint in upstream prose.

The refresh detects 20 added pages and one removed page (`ultraplan`). The settings
reference belongs in the watchlist because it owns a modeled schema. The remaining
new pages chiefly describe product surfaces, deployment, cloud environments, and eval
workflows. Keep page discovery active; add another watched source when a concrete
schema or semantic check will consume it. The existing commands, permissions,
permission-modes, sandboxing, and agent-teams pages remain candidates for dedicated
behavior checks, rather than increasing snapshot volume without a consumer.

## Verification

Final verification after a clean dependency install passed:

- 2,627 tests across 223 suites; all 11 snapshots passed.
- TypeScript build, all linters, formatting, and package validation with publint 0.3.24.
- Schema synchronization, upstream hook and field/key conformance, CLI documentation
  examples, and bidirectional website field-table checks.
- VitePress production build, including generated rule documentation and OG images.

Review used one GPT-5.6 Luna agent at medium effort, reused for bounded parser,
implementation, and dependency reviews. Findings were addressed and the affected
changes re-reviewed. Exact billing is not exposed by the tools.

The optional live `check:tool-names` probe could not obtain a result from the Claude CLI.
The deterministic tool-name check against the refreshed official reference passes.
No claim is made about binary-level conformance from that unavailable probe.

## Dependency maintenance and publication

[#200](https://github.com/pdugan20/claudelint/issues/200) is a rolling Renovate dashboard,
not a ticket that should be closed after one update. The reviewed dependency batch updates:

| Dependency | Before | After | Reason |
| --- | --- | --- | --- |
| `fflate` | 0.7.4 | 0.7.5 | Fix the malformed ZIP64 infinite-loop advisory [GHSA-px8p-9vwx-vf98](https://github.com/advisories/GHSA-px8p-9vwx-vf98), in the Satori development dependency tree |
| `publint` | 0.3.21 | 0.3.24 | Compatible package-validation patch, including its required transitives |
| `undici` override | 7.29.0 | 7.29.1 | Compatible patch for release tooling |

A clean `npm ci --ignore-scripts` succeeds. `npm audit` reports zero vulnerabilities,
down from one moderate development-dependency advisory. Production dependencies and
package engine requirements are unchanged.

The first batch retained `run-con` 1.3.2 because its 1.3.3 update adds `ini` 7,
requiring Node `^22.22.2 || ^24.15.0 || >=26.0.0`. The separate tooling batch below
sets that contributor baseline explicitly before applying the update.

The npm `latest` tag is 0.8.2, its `gitHead` matches the release tag, and provenance
and registry signatures are present. An isolated consumer installed the published
package and checked invalid events and valid agent hooks in both settings files,
plus marketplace-neutral update guidance.

External marketplace [PR #35](https://github.com/pdugan20/plugins/pull/35) updated
its claudelint pin from 0.7.1 to 0.8.2 and merged after every required CI check passed.
Marketplace v3.4.1 is published; its release notes match the curated changelog.
Clean Claude Code and Codex profiles installed every entry from the published catalog
successfully. Runtime membership remains unchanged: claudelint is Claude-only.

Issues #217, #188, and #189 closed through #225. Issue #146 now marks sections 1–4
complete while retaining its watchlist work. Rolling trackers #151 and #200 remain open.

## Separate tooling batch

The contributor baseline is Node 22.22.2, with Node 24.15+ and 26+ also accepted by
`devEngines`. `.nvmrc` selects the minimum; build/check CI jobs consume it, and tests
cover the exact minimum plus current Node 22 and 24. npm 11+ enforces the developer
requirement. The published CLI engine remains Node 22+; this batch changes development
dependencies, not runtime dependencies.

Upgrades: ESLint 10 and JSDoc 64, commitlint 21, release-it 21 with conventional-changelog
12, CSpell 10, Knip 6, lint-staged 17, npm-package-json-lint 11, npm-run-all2 9,
postcss-html 2, and stylelint-config-recommended-vue 2. Compatible TypeScript ESLint,
Node 22 declarations, and API extractor patches accompany them. ESLint's new
`preserve-caught-error` rule exposed five existing catch/rethrow sites; they now retain
the cause without changing their messages.

Full validation passed on Node 22.22.2: 2,627 tests / 223 suites / 11 snapshots,
lint, formatting, build, publint, the aggregate static checks, API report, and website
build. One reused GPT-5.6 Luna reviewer checked compatibility and the CI/runtime split;
exact billing is unavailable.

Optional diagnostic commands are not clean release gates today. CSpell 9 and 10 both
report 64 existing spelling findings across 15 pages. Knip 5 already reports unused
files, dependencies, exports, and duplicate exports; Knip 6 additionally detects the
system `shellcheck` and self-invoked `claudelint` binaries plus more exports. No public
exports or intentional invalid fixtures were removed to silence those diagnostics.

## Remaining dependency decisions

- Keep TypeScript 6: `ts-jest@29.4.12` requires `<7`, and TypeScript ESLint 8.70 requires
  `<6.1.0`. TypeScript 7 needs compatible test/lint tooling before installation.
- Keep VitePress 1.6.4 and its tested Vite 6 override. VitePress still declares Vite 5;
  forcing Vite 8 is a separate compatibility migration, not ordinary lock maintenance.
- Keep release-it's Undici 7 override. Release-it 21 declares Undici 7.29.0; forcing
  Undici 8 underneath it needs separate validation.
- Keep Node 22 declarations while Node 22 is supported. GitHub action majors are
  handled in the workflow batch below.

Primary migration references: [Commander 15](https://github.com/tj/commander.js/releases/tag/v15.0.0),
[js-yaml 5](https://github.com/nodeca/js-yaml/blob/master/docs/migrate_v4_to_v5.md),
[Inquirer](https://github.com/SBoudrias/Inquirer.js/blob/main/packages/inquirer/package.json),
and [ESLint 10](https://eslint.org/docs/latest/use/migrate-to-10.0.0).

## Runtime dependency migration

The runtime batch updates Chalk 6, Commander 15, Diff 9, Inquirer 14, js-yaml 5,
ignore 7.0.9, and Zod 4.6.4. The published Node minimum becomes 22.13.0 to match
Inquirer; the separate contributor toolchain floor remains unchanged.

TypeScript uses `module: node20` and `moduleResolution: node16` to resolve package
exports while emitting CommonJS for this package. Relative dynamic imports now use
`.js`; custom formatters use file URLs to preserve Windows and special-character
paths. The three source-registry checkers retain ts-node's CommonJS loader for
TypeScript source files. External Inquirer and js-yaml declarations are removed
because these packages now provide their own.

The shared YAML loader preserves the established document model using js-yaml 5's
schema/tag APIs: merge keys, dates, binary values, collection representations, base
prefixed integers, and empty input. It keeps YAML 1.2 boolean resolution, rejecting
an unconditional YAML 1.1 schema swap that would turn `yes` and `on` into booleans.
Frontmatter, public rule helpers, and workspace detection share that loader. A
migration probe matched 213 repository documents; committed regression tests cover
its deliberate value semantics and invalid documents.

Jest transforms the real Commander implementation and TypeScript to CommonJS on
Node 22. Separate `pretest` TypeScript checking preserves checks on the complete test
suite before isolated transformation. Actual built-module subprocess tests verify
CJS/ESM formatter paths containing URL characters, option defaults and flags, unified
diff dry runs, and real prompt/color module exports. The packed CLI passed invalid
and valid settings/hook checks on Node 22.13.0, and an actual interactive Inquirer
prompt completed on that version. API report and docs build passed.

## Website dependency migration

The website batch updates Analytics 2.0.1, Speed Insights 2.0.0, Satori 0.33.4, and
vitepress-plugin-llms 1.14.0. Satori pins vulnerable fflate 0.7.3 upstream, so its
scoped override retains patched 0.7.5. The lockfile and clean `npm ci` agree, and
`npm audit` reports zero vulnerabilities.

The image cache now includes Satori's installed version. A cold build regenerated
173 page images, and the following build reused all 173 cached images. The fallback
and a rule image were inspected for layout and text rendering. All 174 Markdown
links in `llms.txt` resolve to generated files, and `llms-full.txt` is populated.

The completed production preview passed homepage/guide rendering and hydrated Rules
navigation. Analytics and Speed Insights each inject one script across route changes;
local checks verify initialization, not production telemetry delivery. Lint passed.
The build/tooling delta received one reused Luna review, and its pending lockfile
finding was resolved before submission.

## GitHub Actions migration

The workflow batch pins setup-node 7, labeler 7, and stale 11 to their verified
release commits and updates the provenance manifest and exact workflow profiles.
All three actions use Node 24 internally; package test versions remain unchanged.

Publishing retains its Node 24, token-free OIDC contract. Its setup-node step
explicitly disables package-manager caching, and release commands use quoted
`GITHUB_REF_NAME` environment values instead of interpolating tag expressions into
shell source. The runbook now distinguishes setup-node 7 from older versions that
exported a placeholder token.

The security contracts and 121 focused tests pass, including actual release-note
extraction, stable/prerelease arguments, and a malicious tag remaining inert. Core
actionlint and separate ShellCheck checks of every publish workflow script pass.
Separate invocation avoids a diagnosed hang in actionlint's external ShellCheck
integration. Zizmor's five publish findings are resolved; its two remaining trigger
warnings concern unchanged, pinned metadata-only workflows without checkout or
untrusted shell execution. One reused Luna reviewer found no actionable regression.

## Permission and command conformance follow-through

Merged PR #227 fixes all five Settings rules skipping `settings.local.json`.
Raw nulls, arrays, and non-string values no longer crash semantic rules; schema errors
remain responsible for malformed shapes. Permission syntax uses the outer delimiter,
allowing literal parentheses inside patterns. Deny/ask tool-name globs and the `Cd`
permission target are accepted; unanchored allow globs and MCP specifiers ignored by
settings are diagnosed. Helper validation checks only plain paths and resolves project
paths from the settings project, skipping shell commands and expansions.

The permissions reference is now watched and yields 31 positive examples from JSON
configurations and rule tables. `check:upstream` executes those examples through the
three semantic permission rules for both filenames, with a fixed minimum of 15.
Regression tests separately cover invalid syntax, allow-glob restrictions, malformed
containers, literal parentheses, stdin, severity overrides, and helper paths.

The remaining watchlist candidates were evaluated against their actual consumers:

- `commands`: the current page catalogs built-in slash commands and directs custom
  command authors to Skills. The existing watched `skills` and `plugins-reference`
  pages govern the two migration advisories. Their documentation now correctly says
  command files remain supported, with fixtures checking that authority. No unused
  built-in-command snapshot is added just to match the rule category's name.
- `permissions`: added with the concrete semantic consumer above.
- `permission-modes`: its static `permissions.defaultMode` surface already belongs to
  the watched settings reference; mode behavior and classifier decisions need a
  runtime integration consumer, not another schema-key snapshot.
- `sandboxing`: its static settings already have schema and nested-key coverage from
  the settings reference. Operating-system isolation behavior is outside this static
  linter; add this page with a dedicated sandbox semantic check if one is introduced.
- `agent-teams`: enablement uses `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` in the existing
  environment map, and `teammateMode` is covered by the settings reference. Session
  orchestration behavior has no current static rule consumer.

Decision sources checked on September 13: [commands](https://code.claude.com/docs/en/commands),
[permissions](https://code.claude.com/docs/en/permissions),
[permission modes](https://code.claude.com/docs/en/permission-modes),
[sandboxing](https://code.claude.com/docs/en/sandboxing), and
[agent teams](https://code.claude.com/docs/en/agent-teams).
