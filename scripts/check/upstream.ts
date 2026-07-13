/**
 * Offline conformance check: does claudelint model what the docs baseline documents?
 *
 * Runs on every PR. Never touches the network - it reads only the committed baseline,
 * so drift cannot creep in between weekly refreshes. The facts it checks against are
 * re-derived from the committed `.md` pages every run (see `deriveFacts`), never taken
 * on trust from the committed `facts.json`.
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { z } from 'zod';
import { HookEvents } from '../../src/schemas/constants';
import { KNOWN_EXTENSIONS } from '../../src/upstream/extensions';
import { extract, type Facts } from '../upstream/extract';
import { log } from '../util/logger';

const BASELINE_DIR = join(__dirname, '../../docs-baseline');

/**
 * Floor on how many hook events the baseline must document before this check is willing
 * to run at all. Mirrors the intent of the `hooks` page's `minFacts: 25` in the watchlist.
 *
 * That `minFacts` does NOT protect this check: `assertMinFacts` gates the page's TOTAL
 * fact set (hook-events UNION field-tables, ~206 facts), so a hook-event extractor that
 * yields ZERO still sails past it on the strength of the ~176 field facts alone. Without
 * the floor below, a dead extractor ships a facts.json with no hook events, this check
 * prints [SUCCESS], and we have exactly the detector that quietly stopped detecting.
 *
 * The floor is deliberately a FIXED constant, never a ratio against the modeled set: a
 * denominator drawn from `HookEvents` is inflated by the very hallucination the
 * modeled-not-documented guard is hunting - each fake event added to the enum would
 * raise its own detection bar.
 */
export const MIN_DOCUMENTED_HOOK_EVENTS = 25;

export interface Finding {
  kind: 'documented-not-modeled' | 'modeled-not-documented';
  fact: string;
  schema: string;
}

/**
 * A suppression MUST carry a non-empty reason. That requirement is the whole point of the
 * ignore file: it forces someone to write down WHY an undocumented value is permitted,
 * which is what keeps a hallucinated value visible instead of silently permanent.
 * Validated with Zod so a missing or blank reason is a hard error, not a quiet pass.
 */
const IgnoreEntrySchema = z.object({
  fact: z.string().min(1, 'fact must be a non-empty string'),
  reason: z
    .string()
    .trim()
    .min(1, 'reason is required and must be non-empty - write down WHY this is permitted'),
});

const IgnoreFileSchema = z.object({
  'documented-not-modeled': z.array(IgnoreEntrySchema).default([]),
  'modeled-not-documented': z.array(IgnoreEntrySchema).default([]),
});

export type IgnoreFile = z.infer<typeof IgnoreFileSchema>;

export const EMPTY_IGNORE: IgnoreFile = {
  'documented-not-modeled': [],
  'modeled-not-documented': [],
};

/** Parse and validate docs-baseline/upstream-ignore.json. Throws on any violation. */
export function parseIgnoreFile(raw: unknown): IgnoreFile {
  const result = IgnoreFileSchema.safeParse(raw);
  if (result.success) {
    return result.data;
  }
  const details = result.error.issues
    .map((issue) => `${issue.path.join('.') || '<root>'}: ${issue.message}`)
    .join('; ');
  throw new Error(`Invalid docs-baseline/upstream-ignore.json - ${details}`);
}

function documentedHookEvents(facts: Facts): Set<string> {
  const events = new Set<string>();
  for (const pageFacts of Object.values(facts)) {
    for (const fact of pageFacts) {
      if (fact.startsWith('hook-event:')) {
        events.add(fact.slice('hook-event:'.length));
      }
    }
  }
  return events;
}

/**
 * @param modeled - the hook events claudelint models. Defaults to the live `HookEvents`
 *   enum; overridable so tests can simulate a hallucinated schema (an enum carrying
 *   events upstream never documented) without editing source.
 */
export function conform(
  facts: Facts,
  ignore: IgnoreFile,
  modeled: readonly string[] = HookEvents.options
): Finding[] {
  const findings: Finding[] = [];
  const suppressed = (kind: Finding['kind'], fact: string): boolean =>
    ignore[kind].some((e) => e.fact === fact);

  const modeledEvents = new Set<string>(modeled);
  const documentedEvents = documentedHookEvents(facts);

  // A baseline this thin means the extractor is broken, not that upstream deleted its
  // hook events. Refuse to run rather than emit a vacuous pass.
  if (documentedEvents.size < MIN_DOCUMENTED_HOOK_EVENTS) {
    throw new Error(
      `Baseline yielded only ${documentedEvents.size} hook events (floor: ${MIN_DOCUMENTED_HOOK_EVENTS}); ` +
        `the extractor is likely broken. Refusing to run the conformance check vacuously. ` +
        `Fix the extractor - do not lower this floor.`
    );
  }

  for (const event of documentedEvents) {
    const fact = `hook-event:${event}`;
    if (!modeledEvents.has(event) && !suppressed('documented-not-modeled', fact)) {
      findings.push({ kind: 'documented-not-modeled', fact, schema: 'HooksConfigSchema' });
    }
  }

  // The hallucination guard. Runs UNCONDITIONALLY - it is protected by the fixed floor
  // above, never by a threshold derived from the very set it is auditing.
  for (const event of modeledEvents) {
    const fact = `hook-event:${event}`;
    if (documentedEvents.has(event)) {
      continue;
    }
    if (
      KNOWN_EXTENSIONS[`HooksConfigSchema.${event}`] ||
      suppressed('modeled-not-documented', fact)
    ) {
      continue;
    }
    findings.push({ kind: 'modeled-not-documented', fact, schema: 'HooksConfigSchema' });
  }

  return findings;
}

/**
 * Derive the facts from the evidence, then hold the committed artifact to them.
 *
 * `facts.json` is a hand-editable file in the repo, so trusting it makes every guard
 * downstream a formality: append `hook-event:FakeEvent` to it, add the same event to the
 * `HookEvents` enum, and the hallucination guard reports [SUCCESS] on an event no page
 * mentions. The realistic path there is not malice - it is an agent told to make this
 * check pass that cannot run the network-bound refresh, so it edits the artifact instead.
 *
 * So re-run the real extractor over `docs-baseline/*.md` on every PR. `extract` is pure
 * `readFileSync` - no network - and it calls `assertMinFacts`, which until now fired only
 * inside the weekly refresh, leaving the per-page floors inert in CI. Comparing the result
 * against the committed artifact then catches the other half: a stale or hand-edited
 * `facts.json` becomes a hard error instead of the thing we validate against.
 */
export function deriveFacts(baselineDir: string): Facts {
  const factsPath = join(baselineDir, 'facts.json');
  if (!existsSync(factsPath)) {
    throw new Error('No baseline. Run: npm run upstream:refresh');
  }

  // The evidence, re-derived. Throws if any page falls below its minFacts floor.
  const facts = extract(baselineDir);

  const committed = JSON.parse(readFileSync(factsPath, 'utf8')) as Facts;
  if (JSON.stringify(facts) !== JSON.stringify(committed)) {
    throw new Error(
      'docs-baseline/facts.json does not match the facts extracted from docs-baseline/*.md. ' +
        'It is stale or hand-edited. Run: npm run upstream:refresh - do not edit facts.json by hand.'
    );
  }

  return facts;
}

function run(): void {
  const facts = deriveFacts(BASELINE_DIR);

  const ignorePath = join(BASELINE_DIR, 'upstream-ignore.json');
  const ignore = existsSync(ignorePath)
    ? parseIgnoreFile(JSON.parse(readFileSync(ignorePath, 'utf8')))
    : EMPTY_IGNORE;

  const findings = conform(facts, ignore);

  if (findings.length === 0) {
    log.bracket.success('claudelint conforms to the upstream docs baseline');
    return;
  }

  log.bracket.error(`${findings.length} conformance finding(s):`);
  log.blank();
  for (const f of findings) {
    const detail =
      f.kind === 'documented-not-modeled'
        ? 'documented upstream, not modeled by claudelint'
        : 'modeled by claudelint, not documented upstream (hallucinated?)';
    log.error(`  ${f.fact} (${f.schema}): ${detail}`);
  }
  log.blank();
  log.error('Fix the schema, or suppress with a reason in docs-baseline/upstream-ignore.json');
  process.exit(1);
}

function main(): void {
  try {
    run();
  } catch (err) {
    log.bracket.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
