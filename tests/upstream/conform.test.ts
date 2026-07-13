import { conform } from '../../scripts/check/upstream';

const EMPTY_IGNORE = { 'documented-not-modeled': [], 'modeled-not-documented': [] };

describe('conform', () => {
  it('flags a documented hook event that claudelint does not model', () => {
    const findings = conform({ hooks: ['hook-event:TotallyNewEvent'] }, EMPTY_IGNORE);
    expect(findings).toContainEqual({
      kind: 'documented-not-modeled',
      fact: 'hook-event:TotallyNewEvent',
      schema: 'HooksConfigSchema',
    });
  });

  it('does not flag a documented hook event that claudelint already models', () => {
    const findings = conform({ hooks: ['hook-event:PreToolUse'] }, EMPTY_IGNORE);
    expect(findings).toHaveLength(0);
  });

  it('suppresses a finding listed in the ignore file', () => {
    const findings = conform(
      { hooks: ['hook-event:TotallyNewEvent'] },
      {
        'documented-not-modeled': [
          { fact: 'hook-event:TotallyNewEvent', reason: 'tracked in #123' },
        ],
        'modeled-not-documented': [],
      }
    );
    expect(findings).toHaveLength(0);
  });
});
