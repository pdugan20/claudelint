/**
 * Tests for output style frontmatter schema
 */

import { OutputStyleFrontmatterSchema } from '../../src/schemas/output-style-frontmatter.schema';

describe('OutputStyleFrontmatterSchema', () => {
  describe('name field', () => {
    it('should accept any string name', () => {
      const result = OutputStyleFrontmatterSchema.safeParse({
        name: 'Markdown Table',
      });
      expect(result.success).toBe(true);
    });

    it('should accept kebab-case names', () => {
      const result = OutputStyleFrontmatterSchema.safeParse({
        name: 'markdown-table',
      });
      expect(result.success).toBe(true);
    });

    it('should be optional', () => {
      const result = OutputStyleFrontmatterSchema.safeParse({
        description: 'Formats output as markdown table',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('description field', () => {
    it('should accept any string description', () => {
      const result = OutputStyleFrontmatterSchema.safeParse({
        description: 'Short',
      });
      expect(result.success).toBe(true);
    });

    it('should accept long descriptions', () => {
      const result = OutputStyleFrontmatterSchema.safeParse({
        description: 'This is a long description that formats output as markdown table',
      });
      expect(result.success).toBe(true);
    });

    it('should be optional', () => {
      const result = OutputStyleFrontmatterSchema.safeParse({
        name: 'markdown-table',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('keep-coding-instructions field', () => {
    it('should accept true', () => {
      const result = OutputStyleFrontmatterSchema.safeParse({
        'keep-coding-instructions': true,
      });
      expect(result.success).toBe(true);
    });

    it('should accept false', () => {
      const result = OutputStyleFrontmatterSchema.safeParse({
        'keep-coding-instructions': false,
      });
      expect(result.success).toBe(true);
    });

    it('should be optional', () => {
      const result = OutputStyleFrontmatterSchema.safeParse({
        name: 'markdown-table',
      });
      expect(result.success).toBe(true);
    });

    it('should reject non-boolean values', () => {
      const result = OutputStyleFrontmatterSchema.safeParse({
        'keep-coding-instructions': 'yes',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('all fields optional', () => {
    it('should accept empty object', () => {
      const result = OutputStyleFrontmatterSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should accept all fields together', () => {
      const result = OutputStyleFrontmatterSchema.safeParse({
        name: 'Custom Style',
        description: 'A custom output style',
        'keep-coding-instructions': true,
      });
      expect(result.success).toBe(true);
    });
  });
});
