import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import {
  conform,
  deriveFacts,
  parseIgnoreFile,
  EMPTY_IGNORE,
  MIN_DOCUMENTED_HOOK_EVENTS,
  type Finding,
  type IgnoreFile,
} from '../../scripts/check/upstream';
import { HookEvents } from '../../src/schemas/constants';
import { KNOWN_EXTENSIONS } from '../../src/upstream/extensions';
import type { Facts } from '../../scripts/upstream/extract';

/** Every hook event claudelint currently models. */
const MODELED_EVENTS: readonly string[] = HookEvents.options;

/**
 * A realistic baseline: the hooks page carries hook-event facts AND field facts, and
 * other pages carry no hook events at all. Tests mutate this shape rather than feeding
 * `conform` a single synthetic fact - a one-fact fixture is not a plausible accounting
 * of upstream, and pretending it is was what motivated loosening the production guard.
 */
function factsFor(events: readonly string[]): Facts {
  return {
    hooks: [
      ...events.map((e) => `hook-event:${e}`),
      'field:command',
      'field:matcher',
      'field:timeout',
    ],
    settings: ['field:hooks', 'field:permissions'],
  };
}

const FULL_FACTS = factsFor(MODELED_EVENTS);

function ignoreWith(kind: Finding['kind'], fact: string, reason: string): IgnoreFile {
  return { ...EMPTY_IGNORE, [kind]: [{ fact, reason }] };
}

describe('conform', () => {
  it('reports nothing when the docs baseline documents exactly what claudelint models', () => {
    expect(conform(FULL_FACTS, EMPTY_IGNORE)).toEqual([]);
  });

  it('flags a documented hook event that claudelint does not model', () => {
    const facts = factsFor([...MODELED_EVENTS, 'TotallyNewEvent']);

    expect(conform(facts, EMPTY_IGNORE)).toEqual([
      {
        kind: 'documented-not-modeled',
        fact: 'hook-event:TotallyNewEvent',
        schema: 'HooksConfigSchema',
      },
    ]);
  });

  it('flags a modeled hook event the docs do not document (the hallucination guard)', () => {
    const modeled = [...MODELED_EVENTS, 'HallucinatedEvent'];

    // Docs document only the real events; the schema also carries a fabricated one.
    expect(conform(FULL_FACTS, EMPTY_IGNORE, modeled)).toEqual([
      {
        kind: 'modeled-not-documented',
        fact: 'hook-event:HallucinatedEvent',
        schema: 'HooksConfigSchema',
      },
    ]);
  });

  it('still flags hallucinated events when they outnumber the documented set', () => {
    // Regression: the old guard ran the hallucination check only when
    // `documented > modeled / 2`, so the modeled set - the quantity under suspicion -
    // was its own denominator. Injecting enough fake events raised the bar past the
    // real docs and switched the detector off. A fixed floor cannot be inflated.
    const fakes = Array.from({ length: 30 }, (_, i) => `FakeEvent${i}`);
    const findings = conform(FULL_FACTS, EMPTY_IGNORE, [...MODELED_EVENTS, ...fakes]);

    expect(findings).toHaveLength(fakes.length);
    expect(findings.map((f) => f.fact).sort()).toEqual(fakes.map((f) => `hook-event:${f}`).sort());
    expect(findings.every((f) => f.kind === 'modeled-not-documented')).toBe(true);
  });

  it('suppresses a documented-not-modeled finding listed in the ignore file', () => {
    const facts = factsFor([...MODELED_EVENTS, 'TotallyNewEvent']);
    const ignore = ignoreWith(
      'documented-not-modeled',
      'hook-event:TotallyNewEvent',
      'tracked in #123'
    );

    expect(conform(facts, ignore)).toEqual([]);
  });

  it('suppresses a modeled-not-documented finding listed in the ignore file', () => {
    const modeled = [...MODELED_EVENTS, 'HallucinatedEvent'];
    const ignore = ignoreWith(
      'modeled-not-documented',
      'hook-event:HallucinatedEvent',
      'docs lag behind the 2.x release; tracked in #456'
    );

    expect(conform(FULL_FACTS, ignore, modeled)).toEqual([]);
  });

  it('does not suppress across finding kinds', () => {
    const modeled = [...MODELED_EVENTS, 'HallucinatedEvent'];
    // Right fact, wrong bucket: must not silence the modeled-not-documented finding.
    const ignore = ignoreWith(
      'documented-not-modeled',
      'hook-event:HallucinatedEvent',
      'wrong bucket on purpose'
    );

    expect(conform(FULL_FACTS, ignore, modeled)).toHaveLength(1);
  });

  it('suppresses a modeled-not-documented finding declared in KNOWN_EXTENSIONS', () => {
    const modeled = [...MODELED_EVENTS, 'ClaudelintExtension'];
    KNOWN_EXTENSIONS['HooksConfigSchema.ClaudelintExtension'] = 'claudelint extension, by design';

    try {
      expect(conform(FULL_FACTS, EMPTY_IGNORE, modeled)).toEqual([]);
    } finally {
      delete KNOWN_EXTENSIONS['HooksConfigSchema.ClaudelintExtension'];
    }
  });

  it('throws when the baseline documents fewer hook events than the floor', () => {
    const facts = factsFor(MODELED_EVENTS.slice(0, 3));

    expect(() => conform(facts, EMPTY_IGNORE)).toThrow(
      `Baseline yielded only 3 hook events (floor: ${MIN_DOCUMENTED_HOOK_EVENTS})`
    );
  });

  it('throws when the hook-event extractor yields nothing but field facts survive', () => {
    // The dead-extractor case. `assertMinFacts(25)` on the hooks page passes here - it
    // gates the page's TOTAL fact set, and the field facts alone clear it - so the floor
    // in `conform` is the only thing standing between a broken extractor and a green run.
    const facts: Facts = {
      hooks: Array.from({ length: 176 }, (_, i) => `field:field${i}`),
      settings: ['field:hooks'],
    };

    expect(() => conform(facts, EMPTY_IGNORE)).toThrow(/extractor is likely broken/);
  });
});

describe('parseIgnoreFile', () => {
  it('accepts a well-formed ignore file', () => {
    const raw = {
      'documented-not-modeled': [{ fact: 'hook-event:Foo', reason: 'tracked in #123' }],
      'modeled-not-documented': [],
    };

    expect(parseIgnoreFile(raw)).toEqual(raw);
  });

  it('defaults missing sections to empty arrays', () => {
    expect(parseIgnoreFile({})).toEqual(EMPTY_IGNORE);
  });

  it('rejects a suppression with no reason', () => {
    const raw = { 'documented-not-modeled': [{ fact: 'hook-event:Bogus' }] };

    expect(() => parseIgnoreFile(raw)).toThrow(/reason/);
  });

  it('rejects a suppression whose reason is empty or whitespace', () => {
    const raw = {
      'modeled-not-documented': [{ fact: 'hook-event:Bogus', reason: '   ' }],
    };

    expect(() => parseIgnoreFile(raw)).toThrow(/reason is required and must be non-empty/);
  });

  it('rejects a suppression with no fact', () => {
    expect(() => parseIgnoreFile({ 'documented-not-modeled': [{ reason: 'why' }] })).toThrow(
      /fact/
    );
  });
});

/**
 * The committed `facts.json` is an artifact, not evidence. These tests pin the property
 * that makes every other guard here mean something: the check re-derives the facts from
 * `docs-baseline/*.md` and refuses to run against an artifact that does not match them.
 * Without it, a hallucinated hook event added to BOTH the enum and facts.json - the exact
 * shortcut an agent takes when it cannot run the network-bound refresh - prints [SUCCESS].
 */
describe('deriveFacts', () => {
  const REAL_BASELINE = join(__dirname, '../../docs-baseline');
  const tempDirs: string[] = [];

  /** A working copy of the real committed baseline, safe to tamper with. */
  function copyBaseline(): string {
    const dir = mkdtempSync(join(tmpdir(), 'claudelint-baseline-'));
    tempDirs.push(dir);
    cpSync(REAL_BASELINE, dir, { recursive: true });
    return dir;
  }

  afterAll(() => {
    for (const dir of tempDirs) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('accepts the committed baseline: facts.json matches what the extractor derives', () => {
    const facts = deriveFacts(REAL_BASELINE);

    const committed = JSON.parse(
      readFileSync(join(REAL_BASELINE, 'facts.json'), 'utf8')
    ) as Facts;
    expect(facts).toEqual(committed);
  });

  it('throws when facts.json carries a fact the markdown does not support', () => {
    const dir = copyBaseline();
    const factsPath = join(dir, 'facts.json');
    const facts = JSON.parse(readFileSync(factsPath, 'utf8')) as Facts;
    // The bypass: assert an event upstream never documented, straight into the artifact.
    facts.hooks = [...facts.hooks, 'hook-event:FakeEvent'].sort();
    writeFileSync(factsPath, `${JSON.stringify(facts, null, 2)}\n`);

    expect(() => deriveFacts(dir)).toThrow(/stale or hand-edited/);
  });

  it('throws when facts.json is missing a fact the markdown does document', () => {
    const dir = copyBaseline();
    const factsPath = join(dir, 'facts.json');
    const facts = JSON.parse(readFileSync(factsPath, 'utf8')) as Facts;
    facts.hooks = facts.hooks.filter((f) => f !== 'hook-event:PreToolUse');
    writeFileSync(factsPath, `${JSON.stringify(facts, null, 2)}\n`);

    expect(() => deriveFacts(dir)).toThrow(/stale or hand-edited/);
  });

  it('throws when a baseline page falls below its minFacts floor (assertMinFacts now fires on every PR)', () => {
    const dir = copyBaseline();
    // Upstream reformats its tables into prose, or the extractor breaks: either way the
    // page yields almost nothing. Before this check re-derived, the stale facts.json
    // covered for it and the run went green.
    writeFileSync(join(dir, 'hooks.md'), '# Hooks\n\nAll hook events are now described in prose.\n');

    expect(() => deriveFacts(dir)).toThrow(/Extractor guard tripped: hooks yielded/);
  });

  it('throws when there is no baseline at all', () => {
    const dir = mkdtempSync(join(tmpdir(), 'claudelint-baseline-empty-'));
    tempDirs.push(dir);

    expect(() => deriveFacts(dir)).toThrow('No baseline. Run: npm run upstream:refresh');
  });
});
