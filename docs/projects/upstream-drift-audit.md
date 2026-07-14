# Upstream Drift Audit — 2026-07-12

> **RESOLVED 2026-07-13. Kept as a record of what the first sweep found, and of what it
> got wrong. Do not work from the list below — everything in it is shipped, superseded,
> or corrected.** Tracked in [#132]; shipped in #136, #140, #141, #142, #143.
>
> **What shipped**
>
> - **9 false positives fixed** — claudelint rejected documented config in nine cases, not
>   the three this audit identified. Six were found by gates built during the work, not by
>   this sweep: an agent-hook using `prompt`, `context: fork` without `agent`, a URL with a
>   `${VAR:-default}`, a marketplace `source: "settings"`, `allowUnsandboxedCommands: false`,
>   `statusLine` as an object, and `teammateMode` as a string.
> - **4 invented fields removed**, and `settings.json` coverage went from 23 of 117
>   documented keys to all of them.
> - **Three new gates**, each of which caught bugs the others structurally could not see:
>   whole-document examples (#136), documented example *values* (#141), and key *names* in
>   both directions (#143).
>
> **What this audit got wrong** — worth reading before trusting a future one:
>
> - **Severity 1.3 (skill `name` required) does not reproduce.** `skill-name.ts` returns
>   early before the schema is consulted, so nothing enforced it. Read off the Zod
>   declaration; never exercised against the CLI.
> - **`enableWeakerNestedSandbox` was not cleared, and it is documented.** It fits the
>   hallucination pattern exactly. Deleting it on that basis would have repeated the
>   `disallowed-tools` mistake — the one this document itself flags in Severity 3.
> - **The method could not see type drift.** Comparing field *names* against the docs calls
>   `tools` conformant while the docs' own canonical sub-agent example fails to lint.
>
> The lesson is in the shape of the errors, not the count: a field-name diff, read off the
> schema rather than exercised, is blind both to what a field *accepts* and to whether the
> code enforces the schema at all.

First full sweep of every claudelint schema against the official Claude Code docs,
run against the committed `docs-baseline/` snapshot.

This is the backlog the upstream-watch system produced on its first real use. The
watcher itself ships in `docs/projects/upstream-watch.md`; this document is what it
found.

**Scope of the v1 conformance gate:** hook events only. Nothing below fails CI today.
That is why this list exists as prose rather than as a red build.

## Severity 1 — claudelint rejects VALID user config

These are false positives: a user writes documented, supported config and claudelint
errors. Reproduced against the real CLI, not just read off the schema.

### 1.1 MCP WebSocket transport uses the wrong literal

- claudelint: `TransportTypes = z.enum(['stdio', 'sse', 'http', 'websocket'])`
  (`src/schemas/constants.ts:101`)
- Docs: the `.mcp.json` type literal is **`"ws"`**. `"websocket"` never appears as a
  config value anywhere — the word appears only in prose ("Add a remote WebSocket
  server").

Reproduced:

```json
{ "mcpServers": { "events": { "type": "ws", "url": "wss://example.com/mcp" } } }
```

```text
.mcp.json (1 error)
  error  mcpServers.events: Invalid input
```

Consequences: three rules (`mcp-websocket-empty-url`, `mcp-websocket-invalid-protocol`,
`mcp-websocket-invalid-url`) are keyed to a transport value that does not exist, and the
real one is rejected.

Also missing: `"streamable-http"`, documented as an alias for `"http"`.

**Root cause worth noting:** someone read "WebSocket" in prose and inferred the literal.
This is the same failure mode as the original hallucinated-fields incident.

### 1.2 `permissions.defaultMode` enum is missing three documented values

- claudelint: `['acceptEdits', 'bypassPermissions', 'default', 'plan']`
  (`src/validators/schemas.ts:99`)
- Docs: `default`, `acceptEdits`, `plan`, `auto`, `dontAsk`, `bypassPermissions`, `manual`

Missing `auto`, `dontAsk`, `manual`. Reproduced: `{"permissions":{"defaultMode":"auto"}}`
errors with `Invalid option`. `auto` is common in current usage.

### 1.3 Skill `name` is required in Zod but optional per docs

- `src/schemas/skill-frontmatter.schema.ts` — `name` has no `.optional()`, unlike every
  other field.
- Docs: `Required: No` — *"Defaults to the directory name."*
- The repo's own manual JSON schema correctly treats it as optional. Only the Zod schema
  (the one actually enforced) disagrees.

### 1.4 Agent `tools` + `disallowedTools` wrongly mutually exclusive

`AgentFrontmatterWithRefinements` rejects configs setting both. Docs explicitly define the
combined behavior: *"If both are set, `disallowedTools` is applied first, then `tools` is
resolved against the remaining pool. A tool listed in both is removed."*

### 1.5 Agent `permissionMode` missing `manual`

Docs list `manual` as an alias for `default` (requires Claude Code v2.1.200+). Not in
claudelint's `PermissionModes`.

## Severity 2 — probable hallucinations (modeled, never documented)

Same class as the five skill-frontmatter fields a prior session invented. None of these
appear anywhere in the docs, and none carry a justifying "claudelint extension" comment.
Verify each against upstream before either documenting or removing.

| Field | Location | The real field appears to be |
|---|---|---|
| `sandbox.network.allowedHosts` | `src/validators/schemas.ts` | `network.allowedDomains` |
| `sandbox.network.allowedPorts` | `src/validators/schemas.ts` | no such concept; docs have `httpProxyPort` / `socksProxyPort` |
| `sandbox.ignoreViolations` | `src/validators/schemas.ts` | not documented |
| marketplace entry `enabled` | `MarketplaceConfigSchema` | `autoUpdate` |

Confirmed NOT hallucinations (they carry justifying comments): skill `version`, skill
`tags`, agent `color: magenta`.

Unmarked but plausible claudelint conventions, lacking the comment this repo requires:
agent `name` max-length 64, agent `description` min-length 10, `noXMLTags` refinement on
agent name.

## Severity 3 — documented, not modeled

Real fields users can write that claudelint does not understand.

- **Skills:** `disallowed-tools`. **Note: the project memory currently lists this as one of
  five hallucinated fields, and it was REMOVED on that basis. That is wrong — it is
  documented today** (`docs-baseline/skills.md:237`, plus prose at :384). The removal
  created a real gap. The memory note needs correcting.
- **LSP:** `diagnostics` (documented, controls diagnostic injection).
- **Output styles:** `force-for-plugin` — overrides the user's `outputStyle` setting, so it
  has real behavioral impact.
- **MCP:** `headersHelper`, `timeout`, `alwaysLoad`, the `oauth` object
  (`clientId`, `callbackPort`, `authServerMetadataUrl`, `scopes`), and `headers` on the
  ws transport.
- **Settings:** `permissions.skipDangerousModePermissionPrompt`, `attribution.sessionUrl`,
  `includeCoAuthoredBy`, marketplace `autoUpdate` / `skipLfs`, `strictKnownMarketplaces`
  source type `pathPattern`, and the whole `sandbox.filesystem.*` / `sandbox.credentials.*`
  subtrees. `SettingsSchema` is a non-strict `z.object`, so unknown keys are stripped
  rather than flagged — no false positives, but no validation either.

## Severity 4 — wrong defaults / stale metadata

- **LSP `restartOnCrash`:** manual JSON schema says `default: false`; docs say *"Defaults to
  `true`."*
- **Agent `background`:** JSON schema says `default: false`; docs say subagents run in the
  background by default as of v2.1.198.
- Agent schema comments still list models as `sonnet, opus, haiku, inherit` — docs add
  `fable`.

## Severity 5 — structural coverage gaps

- **`SettingsSchema` is not in `SCHEMA_REGISTRY` at all.** `settings.md` is watched and
  yields 162 facts, but its watchlist entry has `governs: []` — those facts assert nothing.
- **The `commands` docs page is not watched.** The entire `commands` rule category has no
  doc authority.
- **The `permissions` page is not watched**, though 3 of 5 settings rules depend on
  permission-rule syntax documented there.
- **14 of 15 `claude-md` rules** have no schema in the registry; they are heuristic
  conventions checked against nothing.

Suggested watchlist additions, in priority order: `commands`, `permissions`,
`permission-modes`, `sandboxing`, `tools-reference`, `agent-teams`.

## Suggested order of work

1. Severity 1 (false positives) — these reject valid config in a shipped release.
2. Severity 2 (hallucinations) — verify, then remove or document.
3. Register `SettingsSchema`; set `settings.md`'s `governs`.
4. Severity 3/4 (missing fields, wrong defaults).
5. Widen the watchlist; consider extending deterministic conformance beyond hook events
   (see the v2 note in `upstream-watch.md`).
