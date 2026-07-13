import { extractHookEvents, assertMinFacts } from '../../scripts/upstream/extract';
import { readFileSync } from 'fs';
import { join } from 'path';

const fixture = (name: string): string =>
  readFileSync(join(__dirname, 'fixtures', name), 'utf8');

describe('extractHookEvents', () => {
  it('pulls event names out of the events table', () => {
    const events = extractHookEvents(fixture('hooks-sample.md'));
    expect(events).toEqual([
      'hook-event:MessageDisplay',
      'hook-event:PostToolUse',
      'hook-event:PreToolUse',
    ]);
  });
});

describe('assertMinFacts', () => {
  it('passes when a page meets its guard', () => {
    expect(() => assertMinFacts('hooks', ['a', 'b', 'c'], 3)).not.toThrow();
  });

  it('throws when upstream reformats a table into prose', () => {
    // The regression this guard exists to catch: extraction silently collapses to
    // near-zero facts and conformance would otherwise pass vacuously.
    const events = extractHookEvents(fixture('hooks-reformatted.md'));
    expect(() => assertMinFacts('hooks', events, 25)).toThrow(/hooks yielded \d+ facts, expected >= 25/);
  });
});
