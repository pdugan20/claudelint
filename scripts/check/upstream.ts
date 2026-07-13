/**
 * Offline conformance check: does claudelint model what the docs baseline documents?
 *
 * Runs on every PR. Never touches the network - it reads only the committed baseline,
 * so drift cannot creep in between weekly refreshes.
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { HookEvents } from '../../src/schemas/constants';
import { KNOWN_EXTENSIONS } from '../../src/upstream/extensions';
import type { Facts } from '../upstream/extract';
import { log } from '../util/logger';

const BASELINE_DIR = join(__dirname, '../../docs-baseline');

export interface Finding {
  kind: 'documented-not-modeled' | 'modeled-not-documented';
  fact: string;
  schema: string;
}

interface IgnoreEntry {
  fact: string;
  reason: string;
}

export interface IgnoreFile {
  'documented-not-modeled': IgnoreEntry[];
  'modeled-not-documented': IgnoreEntry[];
}

export function conform(facts: Facts, ignore: IgnoreFile): Finding[] {
  const findings: Finding[] = [];
  const suppressed = (kind: Finding['kind'], fact: string): boolean =>
    ignore[kind].some((e) => e.fact === fact);

  const modeledEvents = new Set<string>(HookEvents.options);
  const documentedEvents = new Set<string>();

  for (const pageFacts of Object.values(facts)) {
    for (const fact of pageFacts) {
      if (!fact.startsWith('hook-event:')) {
        continue;
      }
      const event = fact.slice('hook-event:'.length);
      documentedEvents.add(event);
      if (!modeledEvents.has(event) && !suppressed('documented-not-modeled', fact)) {
        findings.push({ kind: 'documented-not-modeled', fact, schema: 'HooksConfigSchema' });
      }
    }
  }

  // Guard against false positives from a partial fact set: absence-based
  // (modeled-not-documented) findings are only trustworthy once we've observed a
  // majority of the events claudelint currently models. A single mocked fact (as in a
  // unit test) or a genuinely broken extractor must not be mistaken for "upstream
  // deleted everything else" - that would flag every other modeled event as
  // hallucinated. This scales with the schema instead of a hardcoded count.
  if (documentedEvents.size > modeledEvents.size / 2) {
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
  }

  return findings;
}

function main(): void {
  const factsPath = join(BASELINE_DIR, 'facts.json');
  if (!existsSync(factsPath)) {
    log.bracket.error('No baseline. Run: npm run upstream:refresh');
    process.exit(1);
  }

  const facts = JSON.parse(readFileSync(factsPath, 'utf8')) as Facts;
  const ignorePath = join(BASELINE_DIR, 'upstream-ignore.json');
  const ignore = (
    existsSync(ignorePath)
      ? JSON.parse(readFileSync(ignorePath, 'utf8'))
      : { 'documented-not-modeled': [], 'modeled-not-documented': [] }
  ) as IgnoreFile;

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

if (require.main === module) {
  main();
}
