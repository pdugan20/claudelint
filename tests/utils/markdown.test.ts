import { extractFrontmatter, countLines } from '../../src/utils/markdown';

describe('Markdown utilities', () => {
  describe('extractFrontmatter', () => {
    it('should extract valid frontmatter', () => {
      const content = `---
name: test-skill
description: A test skill
---

# Content here`;

      const result = extractFrontmatter<{ name: string; description: string }>(content);

      expect(result.hasFrontmatter).toBe(true);
      expect(result.frontmatter).toEqual({
        name: 'test-skill',
        description: 'A test skill',
      });
      expect(result.content).toBe('# Content here');
    });

    it('should return null frontmatter when none exists', () => {
      const content = '# Just a heading';

      const result = extractFrontmatter(content);

      expect(result.hasFrontmatter).toBe(false);
      expect(result.frontmatter).toBeNull();
      expect(result.content).toBe(content);
    });
  });

  describe('countLines', () => {
    it('should count lines correctly', () => {
      expect(countLines('line1')).toBe(1);
      expect(countLines('line1\nline2')).toBe(2);
      expect(countLines('line1\nline2\nline3')).toBe(3);
    });
  });
});
