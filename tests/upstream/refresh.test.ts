import { normalize } from '../../scripts/upstream/refresh';

describe('normalize', () => {
  it('strips the boilerplate documentation-index preamble', () => {
    const input = [
      '> ## Documentation Index',
      '> Fetch the complete documentation index at: https://code.claude.com/docs/llms.txt',
      '> Use this file to discover all available pages before exploring further.',
      '',
      '# Hooks',
    ].join('\n');
    expect(normalize(input)).toBe('# Hooks');
  });

  it('strips volatile theme attributes from code fences', () => {
    expect(normalize('```json theme={null}\n{}\n```')).toBe('```json\n{}\n```');
  });

  it('strips trailing whitespace and normalizes trailing newlines', () => {
    expect(normalize('# Title   \n\n\n')).toBe('# Title');
  });
});
