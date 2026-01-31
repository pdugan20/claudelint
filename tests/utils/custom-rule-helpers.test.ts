import {
  hasHeading,
  extractHeadings,
  matchesPattern,
  countOccurrences,
  extractFrontmatter,
  validateSemver,
  fileExists,
  parseJSON,
  parseYAML,
  findLinesMatching,
} from '../../src/utils/custom-rule-helpers';
import { writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

describe('custom-rule-helpers', () => {
  describe('hasHeading', () => {
    it('should find heading at any level', () => {
      const content = '# Title\n## Section\n### Subsection';
      expect(hasHeading(content, 'Title')).toBe(true);
      expect(hasHeading(content, 'Section')).toBe(true);
      expect(hasHeading(content, 'Missing')).toBe(false);
    });

    it('should find heading at specific level', () => {
      const content = '# Title\n## Section\n### Subsection';
      expect(hasHeading(content, 'Title', 1)).toBe(true);
      expect(hasHeading(content, 'Title', 2)).toBe(false);
      expect(hasHeading(content, 'Section', 2)).toBe(true);
    });

    it('should be case-insensitive', () => {
      const content = '# Example Title';
      expect(hasHeading(content, 'example title')).toBe(true);
      expect(hasHeading(content, 'EXAMPLE TITLE')).toBe(true);
    });
  });

  describe('extractHeadings', () => {
    it('should extract all headings with levels', () => {
      const content = '# Title\nSome text\n## Section 1\n### Subsection\n## Section 2';
      const headings = extractHeadings(content);

      expect(headings).toHaveLength(4);
      expect(headings[0]).toEqual({ level: 1, text: 'Title', line: 1 });
      expect(headings[1]).toEqual({ level: 2, text: 'Section 1', line: 3 });
      expect(headings[2]).toEqual({ level: 3, text: 'Subsection', line: 4 });
      expect(headings[3]).toEqual({ level: 2, text: 'Section 2', line: 5 });
    });

    it('should return empty array for content with no headings', () => {
      expect(extractHeadings('Just plain text')).toEqual([]);
    });
  });

  describe('matchesPattern', () => {
    it('should match regex pattern', () => {
      expect(matchesPattern('has TODO item', /TODO/)).toBe(true);
      expect(matchesPattern('no items', /TODO/)).toBe(false);
    });

    it('should support case-insensitive matching', () => {
      expect(matchesPattern('Has TODO', /todo/i)).toBe(true);
    });
  });

  describe('countOccurrences', () => {
    it('should count string occurrences', () => {
      const content = 'foo bar foo baz foo';
      expect(countOccurrences(content, 'foo')).toBe(3);
      expect(countOccurrences(content, 'bar')).toBe(1);
      expect(countOccurrences(content, 'missing')).toBe(0);
    });

    it('should count regex pattern matches', () => {
      const content = 'TODO: fix this\nFIXME: that\nTODO: another';
      expect(countOccurrences(content, /TODO:/g)).toBe(2);
      expect(countOccurrences(content, /TODO:|FIXME:/g)).toBe(3);
    });

    it('should handle regex without global flag', () => {
      const content = 'foo foo foo';
      expect(countOccurrences(content, /foo/)).toBe(3);
    });
  });

  describe('extractFrontmatter', () => {
    it('should extract valid frontmatter', () => {
      const content = '---\nname: test\nversion: 1.0.0\n---\nBody content';
      const result = extractFrontmatter(content);

      expect(result.frontmatter).not.toBeNull();
      expect(result.frontmatter?.name).toBe('test');
      expect(result.frontmatter?.version).toBe('1.0.0');
      expect(result.hasFrontmatter).toBe(true);
      expect(result.content).toBe('Body content');
    });

    it('should return null frontmatter for content without frontmatter', () => {
      const result = extractFrontmatter('No frontmatter here');
      expect(result.frontmatter).toBeNull();
      expect(result.hasFrontmatter).toBe(false);
    });

    it('should throw for invalid YAML', () => {
      const content = '---\ninvalid: yaml: content:\n---\nBody';
      expect(() => extractFrontmatter(content)).toThrow();
    });
  });

  describe('validateSemver', () => {
    it('should validate correct semver versions', () => {
      expect(validateSemver('1.0.0')).toBe(true);
      expect(validateSemver('2.1.3')).toBe(true);
      expect(validateSemver('0.0.1')).toBe(true);
      expect(validateSemver('1.0.0-beta')).toBe(true);
      expect(validateSemver('1.0.0-beta.1')).toBe(true);
      expect(validateSemver('1.0.0+build.123')).toBe(true);
    });

    it('should reject invalid semver versions', () => {
      expect(validateSemver('1.0')).toBe(false);
      expect(validateSemver('v1.0.0')).toBe(false);
      expect(validateSemver('1.0.0.')).toBe(false);
      expect(validateSemver('not-a-version')).toBe(false);
    });
  });

  describe('fileExists', () => {
    let testDir: string;

    beforeEach(() => {
      testDir = join(tmpdir(), `claudelint-test-${Date.now()}`);
      mkdirSync(testDir, { recursive: true });
    });

    afterEach(() => {
      if (testDir) {
        rmSync(testDir, { recursive: true, force: true });
      }
    });

    it('should return true for existing file', async () => {
      const filePath = join(testDir, 'test.txt');
      writeFileSync(filePath, 'content');
      expect(await fileExists(filePath)).toBe(true);
    });

    it('should return false for non-existent file', async () => {
      const filePath = join(testDir, 'missing.txt');
      expect(await fileExists(filePath)).toBe(false);
    });
  });

  describe('parseJSON', () => {
    it('should parse valid JSON', () => {
      const json = '{"name": "test", "value": 123}';
      const parsed = parseJSON(json);

      expect(parsed).not.toBeNull();
      expect(parsed?.name).toBe('test');
      expect(parsed?.value).toBe(123);
    });

    it('should return null for invalid JSON', () => {
      expect(parseJSON('{invalid json}')).toBeNull();
      expect(parseJSON('not json at all')).toBeNull();
    });
  });

  describe('parseYAML', () => {
    it('should parse valid YAML', () => {
      const yaml = 'name: test\nvalue: 123';
      const parsed = parseYAML(yaml);

      expect(parsed).not.toBeNull();
      expect(parsed?.name).toBe('test');
      expect(parsed?.value).toBe(123);
    });

    it('should return null for invalid YAML', () => {
      expect(parseYAML('invalid: yaml: content:')).toBeNull();
    });
  });

  describe('findLinesMatching', () => {
    it('should find all matching lines', () => {
      const content = 'line 1\nTODO: fix this\nline 3\nTODO: another\nline 5';
      const matches = findLinesMatching(content, /TODO:/);

      expect(matches).toHaveLength(2);
      expect(matches[0]).toEqual({
        line: 2,
        text: 'TODO: fix this',
        match: 'TODO:',
      });
      expect(matches[1]).toEqual({
        line: 4,
        text: 'TODO: another',
        match: 'TODO:',
      });
    });

    it('should return empty array when no matches', () => {
      const matches = findLinesMatching('no matches here', /TODO:/);
      expect(matches).toEqual([]);
    });

    it('should capture groups in match', () => {
      const content = 'password = "secret123"';
      const matches = findLinesMatching(content, /password\s*=\s*"(.+)"/);

      expect(matches).toHaveLength(1);
      expect(matches[0].match).toBe('password = "secret123"');
    });
  });
});
