# Issue follow-through — September 2026

Work is local on `fix/217-settings-hooks`, based on the released v0.8.1 main branch.
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

Keep the `run-con` 1.3.2 override. Testing 1.3.3 revealed a new `ini` 7 dependency
requiring Node `^22.22.2 || ^24.15.0 || >=26.0.0`; the current development runtime is
22.18.0. Revisit that patch with an intentional Node baseline decision. Review major
runtime/toolchain upgrades separately, especially Node, TypeScript, YAML parsing,
interactive prompts, and the VitePress/Vite combination.

Publishing remains a separate action: no push, PR, issue closure, npm release, or external
marketplace change is included in this local work. The external marketplace's 0.7.1 pin
still needs to be updated to the intended released version in its own repository.
