# Upstream Watch — Design

Status: Implemented
Date: 2026-07-12

## Problem

claudelint models Claude Code's configuration surface (plugin manifests, skill
frontmatter, hooks, MCP, settings). That surface moves upstream, and today
nothing tells us when it does.

Two failures make the cost concrete:

1. **Undetected new surface.** The `plugin-dependencies` docs page shipped an
   entire feature — dependency declarations, version constraints, cross-marketplace
   allowlists — and claudelint never noticed. Its schema still cannot express the
   `marketplace` field. A real plugin (`pdugan20/mintlify-docs`) shipped a broken
   manifest that claudelint validated as clean.
2. **Undetected field drift.** The `MessageDisplay` hook event exists upstream and
   is absent from our `HookEvents` constant. No mechanism would ever surface this.

There is a third, inverted failure this system must also prevent: **hallucinated
fields**. A prior session added five skill-frontmatter fields that do not exist in
any official doc. Nothing mechanically prevented it.

The existing `check-schema-drift` skill is manual, model-driven, emits prose, has
no exit code, and reads only the 9 URLs in `SCHEMA_REGISTRY` — so it is
structurally blind to a new page like `plugin-dependencies`.

## Goals

- Detect new upstream docs pages, new fields, and new enum values.
- Make hallucinated (modeled-but-undocumented) fields mechanically impossible to
  reintroduce.
- Keep the everyday check offline, deterministic, and fast.
- Produce findings a human reviews; never silently mutate schemas.

## Non-goals

- Interpreting *prose* semantics automatically (v1 has no LLM in CI; see
  "Deferred").
- Auto-fixing schemas.
- Watching the Claude Code binary/changelog for undocumented behavior.

## Key design decision: split refresh from conform

The docs snapshot is **committed to the repo**. That yields two operations with
very different properties:

| Operation | Network | Cadence | Purpose |
|---|---|---|---|
| **Refresh** | yes | weekly (cron) + on demand | Update the committed snapshot from upstream |
| **Conform** | no | every PR | Assert Zod schemas match the committed snapshot |

Consequences:

- CI's per-PR check is hermetic — no network flakiness, no rate limits.
- Drift cannot creep in between weekly runs; conform runs on every commit.
- Accepting upstream change is an explicit human act (`npm run upstream:refresh`),
  reviewed as a normal diff.

## Architecture

### 1. Watchlist — `src/upstream/watchlist.ts`

Extends the `SCHEMA_REGISTRY` pattern rather than duplicating it. Each entry:

```ts
interface WatchEntry {
  id: string;            // 'plugin-dependencies'
  url: string;           // https://code.claude.com/docs/en/plugin-dependencies.md
  extractors: ExtractorId[];  // ['field-tables', 'json-keys']
  governs?: string[];    // Zod schema names this page is authoritative for
  minFacts: number;      // guard; see §3
}
```

Verified: `code.claude.com/docs/en/<page>.md` returns plain markdown (HTTP 200),
and `code.claude.com/docs/llms.txt` is a complete page index.

### 2. Refresh — `scripts/upstream/refresh.ts` (`npm run upstream:refresh`)

1. Fetch `llms.txt`; parse the page list.
2. **Diff the page index against the previous run.** A new docs page appearing is
   itself a finding — this is the mechanism that would have caught
   `plugin-dependencies` the week it shipped.
3. Fetch each watched page as `.md`.
4. Normalize: strip volatile artifacts (`theme={null}`, trailing whitespace,
   the boilerplate "Documentation Index" preamble).
5. Write `docs-baseline/<id>.md` and `docs-baseline/_index.json`.
6. Run the extractor; write `docs-baseline/facts.json`.

### 3. Extractor — `scripts/upstream/extract.ts`

Deterministic parsers over normalized markdown:

- `hook-events` — rows of the hook events table.
- `field-tables` — `| Field | Type | Required | Description |` tables.
- `json-keys` — top-level keys of JSON code blocks tagged `plugin.json`,
  `marketplace.json`, or SKILL.md frontmatter.

**Silent-failure guard (required).** If upstream reformats a table into a list,
a naive parser yields zero facts and conformance passes vacuously — detection
that quietly stops detecting. Each watch entry declares `minFacts`; extraction
yielding fewer than that is a **hard error**, not an empty result. Example:
the hooks page must yield ≥ 25 events.

### 4. Conform — `scripts/check/upstream.ts` (`npm run check:upstream`)

Offline. Compares `docs-baseline/facts.json` against claudelint's live Zod
constants. Two finding classes:

- **documented-but-not-modeled** — upstream has it, we don't (e.g. `MessageDisplay`).
- **modeled-but-not-documented** — we have it, upstream doesn't. Checked against an
  explicit extensions allowlist in `src/upstream/extensions.ts`, so intentional
  claudelint extensions do not false-positive — **but an undocumented value that is
  not on the allowlist fails the build.**

Exit 1 on any unsuppressed finding. Runs in `ci.yml` on every PR.

**Scope in v1: hook events only.** This is a deliberate limit, not an oversight.
Hook events are deterministically extractable because the hooks page has exactly one
canonical event table. Field-level conformance is a materially harder problem: a docs
page carries many tables (fields, CLI flags, LSP options, error codes) and nothing in
the markdown declares which table governs which Zod schema. Mapping them would be
brittle against any upstream reformat, and it still would not reach a *nested* field
like `marketplace` inside a `dependencies` entry.

Field-level drift is therefore caught by the other half of the system: the committed
prose snapshot diff, read by the `/check-upstream` skill. That is the layer with
judgment, and field semantics need judgment. Extending deterministic conformance to
top-level manifest keys is a reasonable v2 — see Open questions.

### 5. Suppression — `docs-baseline/upstream-ignore.json`

Every finding can be suppressed with a mandatory reason string:

```json
{
  "documented-but-not-modeled": [
    { "fact": "hooks.MessageDisplay", "reason": "tracked in #123", "until": "2026-09-01" }
  ]
}
```

Without this, an intentional or won't-fix finding nags forever, the weekly issue
gets ignored, and we have rebuilt the original problem with extra steps.

### 6. Weekly workflow — `.github/workflows/upstream-watch.yml`

Cron, weekly. Runs refresh; if the working tree is unchanged, exits silently. If
anything changed:

- Run `check:upstream` for deterministic findings.
- Open **or update** a single stable-titled issue (`Upstream drift`) so it edits
  rather than spams, containing: new/removed docs pages, deterministic findings,
  and the baseline diff.

It does **not** auto-commit the baseline. Accepting drift stays deliberate.

Failure modes degrade gracefully: a fetch error warns and does not red-build the
repo; extractor guard failures *do* fail loudly, because that is a detector
malfunction rather than upstream noise.

### 7. Skill — `.claude/skills/check-upstream/`

Absorbs today's `check-schema-drift`. Runs refresh + conform locally, then does
the interpretive work: reads the prose diff, judges what matters for claudelint,
and proposes concrete schema/rule edits. This is where LLM judgment lives in v1.

## First findings batch

The work this system should have surfaced. Ships alongside it as proof.

### Schema fixes

- Add `marketplace: z.string().optional()` to `PluginDependencySchema`.
- Add `MessageDisplay` to `HookEvents`.
- Add `plugin-dependencies` to `SCHEMA_REGISTRY` / the watchlist.

### New rule: `plugin-dependency-string-with-marketplace` (error)

A bare-string dependency containing `@`.

Doc-backed: *"Each entry is either a plugin name or an object"*, and plugin `name`
is *"kebab-case, no spaces"* — so `@` cannot appear in a plugin name. Therefore
`"dependencies": ["mintlify@claude-plugins-official"]` is parsed as a literal
plugin name that cannot exist.

Why it matters: Claude Code **silently drops the entire plugin entry** from the
marketplace catalog and reports `Plugin "X" not found in marketplace "Y"` — an
error pointing at the wrong thing entirely. Undiagnosable from the runtime message.

The trap: `name@marketplace` *is* valid CLI syntax (`claude plugin install
foo@bar`), so it looks correct. The fix is the object form:
`{ "name": "mintlify", "marketplace": "claude-plugins-official" }`.

### New rule: `plugin-dependency-not-allowlisted` (error)

A cross-marketplace dependency requires `allowCrossMarketplaceDependenciesOn` on
the declaring marketplace. Fires when a `marketplace.json` in the scanned tree
lists a plugin whose dependency names a *different* marketplace not present in
the allowlist.

**Scoping caveat — this rule can only fire when both halves are visible.** In the
motivating case the plugin (`mintlify-docs`) and the marketplace
(`pdugan20-plugins`) live in *different repositories*, so linting the plugin alone
cannot see `marketplace.json`. The rule therefore scopes to trees where the
marketplace manifest is resolvable (the common case for marketplace repos, which
`check-all` scans whole).

**Rejected alternative — an advisory warn when linting a plugin standalone.** Two
reasons. First, `RuleIssue` has no severity field; severity is fixed per-rule in
`meta`, so one rule cannot be error-in-tree and warn-standalone. Second, and more
importantly, a cross-marketplace dependency in correct object form *is valid* —
it is exactly the shipped fix. Warning on it would nag correct code. Declining to
check what we cannot see is better than emitting noise on what is already right.

## Testing

- Rule fixtures per new rule (valid/invalid manifests).
- Extractor tested against frozen sample markdown committed as a fixture, including
  a reformatted-table case that must trip the `minFacts` guard.
- `check:upstream` tested against a frozen baseline with known seeded drift.
- Conform runs offline, so it is a normal unit-testable check.

## Deferred (explicitly not in v1)

**LLM triage in CI.** Considered and cut. It would require a standing
`ANTHROPIC_API_KEY` secret in a repo that deliberately uses OIDC trusted publishing
to avoid long-lived credentials, and it is the only nondeterministic, cost-bearing,
externally-failing component in an otherwise hermetic design. The deterministic
layer catches both known real bugs without it. Revisit if the raw weekly issues
prove tedious to read.

## Open questions

- Which pages beyond the current 9 belong in the watchlist? Candidates: `settings`,
  `tools`, `plugin-dependencies`, `discover-plugins`.
- Does the committed baseline belong in the npm package? (No — should be
  `.npmignore`d; it is repo tooling, not shipped code.)
- **v2: deterministic conformance for top-level manifest and frontmatter keys.** Would
  require an explicit per-page mapping from a docs table to a Zod schema, since the
  markdown does not declare it. Would make the `modeled-not-documented` hallucination
  guard cover schema fields, not just hook events.
