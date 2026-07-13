---
name: check-upstream
description: Refreshes the Claude Code docs baseline, runs the conformance check, and recommends schema and rule updates. Use when asked to "check for upstream changes", "check schema drift", "are our schemas up to date", or "what is new in Claude Code".
version: 1.0.0
allowed-tools:
  - Bash(npm run *)
  - Bash(git diff*)
  - Read
  - Edit
  - Glob
---

# Check Upstream

Detects new Claude Code documentation surface and drift between the official docs
and claudelint's schemas, then recommends concrete updates.

The deterministic half of this system runs in CI. This skill adds the judgment the
scripts deliberately do not attempt: reading the prose diff and deciding what it
means for claudelint.

## Usage

Run this skill when asked to check for upstream changes, verify schemas are up to
date, or find out what changed in Claude Code's documentation.

### Step 1: Refresh the baseline

Run `npm run upstream:refresh`.

Watch for two things in the output:

- `[NEW PAGE] <slug> (NOT WATCHED ...)` - a docs page appeared that claudelint does
  not watch. This is how a whole feature (such as plugin dependencies) arrives. Read
  the page and decide whether it belongs in `src/upstream/watchlist.ts`.
- `Extractor guard tripped` - the extractor stopped finding facts on a page. Upstream
  changed format. Fix the extractor in
  [scripts/upstream/extract.ts](../../../scripts/upstream/extract.ts). Do NOT lower
  `minFacts` to make it pass; that disables the detector.

### Step 2: Read the prose diff

Run `git diff -- docs-baseline/`.

This step is not optional, and it is not a skim. The scripts catch exactly two things:
new pages, and hook-event drift. They do NOT catch field-level drift - a new, renamed,
or removed field in any schema is caught ONLY by a human or agent reading this diff.
They also cannot catch a constraint stated only in prose, and that class of change
causes real bugs: the mintlify-docs install failure came from one sentence, "a bare
string with only the plugin name".

So read the diff for both - changed fields and changed sentences. For each meaningful
change, ask: does claudelint model this? Could a user violate it and have us report
success?

### Step 3: Run the conformance check

Run `npm run check:upstream`.

Its conformance findings cover hook events ONLY. A clean run means the `HookEvents` enum
matches the baseline - it says nothing about whether any other field is up to date. Field
drift is caught only by Step 2.

- `documented-not-modeled` - upstream documents a hook event we do not model. Add it to
  the Zod schema, the manual schema in `schemas/`, and the website docs, then run
  `npm run check:schema-sync`.
- `modeled-not-documented` - we model a hook event the docs do not document. Treat this
  as a probable hallucination. Verify against the official page before assuming it is
  real. If it is a deliberate claudelint extension, add it to `src/upstream/extensions.ts`
  with a reason. Never silence it by deleting the check.

### Step 4: Report

Summarize: new pages, conformance findings, prose constraints worth a new rule, and a
recommended action for each. Do not change schemas without saying what you are changing
and why.

## Important

- Never add a schema field that is not in the official docs. A previous session
  hallucinated five skill frontmatter fields. `src/upstream/extensions.ts` plus the
  `modeled-not-documented` check exist to make that mistake mechanically visible.
- Accepting a baseline refresh is a deliberate act: review `git diff -- docs-baseline/`
  before committing it.

## See also

- `docs/projects/upstream-watch.md` - design and rationale
- `src/upstream/watchlist.ts` - watched pages and their minFacts guards
- `npm run check:upstream` - the offline conformance gate, also run on every PR
