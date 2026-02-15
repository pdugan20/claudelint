import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Tests that the problem matcher regex patterns match the actual stylish output format.
 */
describe('Problem Matcher', () => {
  const matcherPath = join(__dirname, '../../.github/claudelint-problem-matcher.json');
  let patterns: Array<{ regexp: string }>;

  beforeAll(() => {
    const matcher = JSON.parse(readFileSync(matcherPath, 'utf-8'));
    patterns = matcher.problemMatcher[0].pattern;
  });

  it('should be valid JSON', () => {
    expect(() => JSON.parse(readFileSync(matcherPath, 'utf-8'))).not.toThrow();
  });

  it('should have two patterns (severity+message, then file+line)', () => {
    expect(patterns).toHaveLength(2);
  });

  describe('pattern 1 (severity, message, code)', () => {
    let regex: RegExp;

    beforeAll(() => {
      regex = new RegExp(patterns[0].regexp);
    });

    it('should match error lines from stylish format', () => {
      const line = '✗ Error: File exceeds 40KB limit (66669 bytes) [claude-md-size]';
      const match = line.match(regex);

      expect(match).not.toBeNull();
      expect(match![1]).toBe('Error');
      expect(match![2]).toBe('File exceeds 40KB limit (66669 bytes)');
      expect(match![3]).toBe('claude-md-size');
    });

    it('should match warning lines from stylish format', () => {
      const line = '! Warning: File approaching size limit (38000 bytes) [claude-md-size]';
      const match = line.match(regex);

      expect(match).not.toBeNull();
      expect(match![1]).toBe('Warning');
      expect(match![2]).toBe('File approaching size limit (38000 bytes)');
      expect(match![3]).toBe('claude-md-size');
    });

    it('should match errors with complex messages', () => {
      const line = '✗ Error: Missing required field "name" in frontmatter [skill-name]';
      const match = line.match(regex);

      expect(match).not.toBeNull();
      expect(match![1]).toBe('Error');
      expect(match![3]).toBe('skill-name');
    });

    it('should not match summary lines', () => {
      const line = '1 error, 1 warning';
      expect(line.match(regex)).toBeNull();
    });

    it('should not match status lines', () => {
      const line = '✓ CLAUDE.md Validator (12ms)';
      expect(line.match(regex)).toBeNull();
    });
  });

  describe('pattern 2 (file, line)', () => {
    let regex: RegExp;

    beforeAll(() => {
      regex = new RegExp(patterns[1].regexp);
    });

    it('should match file path without line number', () => {
      const line = '  at: CLAUDE.md';
      const match = line.match(regex);

      expect(match).not.toBeNull();
      expect(match![1]).toBe('CLAUDE.md');
      expect(match![2]).toBeUndefined();
    });

    it('should match file path with line number', () => {
      const line = '  at: .claude/skills/deploy/SKILL.md:12';
      const match = line.match(regex);

      expect(match).not.toBeNull();
      expect(match![1]).toBe('.claude/skills/deploy/SKILL.md');
      expect(match![2]).toBe('12');
    });

    it('should match absolute file paths', () => {
      const line = '  at: /Users/user/project/CLAUDE.md:5';
      const match = line.match(regex);

      expect(match).not.toBeNull();
      expect(match![1]).toBe('/Users/user/project/CLAUDE.md');
      expect(match![2]).toBe('5');
    });

    it('should not match non-indented lines', () => {
      const line = 'CLAUDE.md:12';
      expect(line.match(regex)).toBeNull();
    });
  });
});
