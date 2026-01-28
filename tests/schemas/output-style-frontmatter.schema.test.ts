/**
 * Tests for output style frontmatter schema
 */

import { OutputStyleFrontmatterSchema } from '../../src/schemas/output-style-frontmatter.schema';

describe('OutputStyleFrontmatterSchema', () => {
  describe('name validation', () => {
    it('should accept valid lowercase-hyphen names', () => {
      const result = OutputStyleFrontmatterSchema.safeParse({
        name: 'markdown-table',
        description: 'Formats output as markdown table',
      });
      expect(result.success).toBe(true);
    });

    it('should reject uppercase in name', () => {
      const result = OutputStyleFrontmatterSchema.safeParse({
        name: 'Markdown-Table',
        description: 'Formats output as markdown table',
      });
      expect(result.success).toBe(false);
    });

    it('should reject XML tags in name', () => {
      const result = OutputStyleFrontmatterSchema.safeParse({
        name: 'markdown-<style>-table',
        description: 'Formats output as markdown table',
      });
      expect(result.success).toBe(false);
    });

    it('should reject names over 64 characters', () => {
      const result = OutputStyleFrontmatterSchema.safeParse({
        name: 'a'.repeat(65),
        description: 'Formats output as markdown table',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('description validation', () => {
    it('should accept valid third-person descriptions', () => {
      const result = OutputStyleFrontmatterSchema.safeParse({
        name: 'markdown-table',
        description: 'Formats output as markdown table',
      });
      expect(result.success).toBe(true);
    });

    it('should reject descriptions under 10 characters', () => {
      const result = OutputStyleFrontmatterSchema.safeParse({
        name: 'markdown-table',
        description: 'Short',
      });
      expect(result.success).toBe(false);
    });

    it('should reject first-person descriptions', () => {
      const result = OutputStyleFrontmatterSchema.safeParse({
        name: 'markdown-table',
        description: 'I format output as markdown table',
      });
      expect(result.success).toBe(false);
    });

    it('should reject second-person descriptions', () => {
      const result = OutputStyleFrontmatterSchema.safeParse({
        name: 'markdown-table',
        description: 'Helps you format output',
      });
      expect(result.success).toBe(false);
    });

    it('should reject XML tags in description', () => {
      const result = OutputStyleFrontmatterSchema.safeParse({
        name: 'markdown-table',
        description: 'Formats output as <em>markdown</em> table',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('optional fields', () => {
    it('should accept examples array', () => {
      const result = OutputStyleFrontmatterSchema.safeParse({
        name: 'markdown-table',
        description: 'Formats output as markdown table',
        examples: ['Example 1', 'Example 2'],
      });
      expect(result.success).toBe(true);
    });

    it('should accept missing examples', () => {
      const result = OutputStyleFrontmatterSchema.safeParse({
        name: 'markdown-table',
        description: 'Formats output as markdown table',
      });
      expect(result.success).toBe(true);
    });
  });
});
