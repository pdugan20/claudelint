/**
 * Tests for rules file frontmatter schema
 */

import { RulesFrontmatterSchema } from '../../src/schemas/rules-frontmatter.schema';

describe('RulesFrontmatterSchema', () => {
  describe('paths validation', () => {
    it('should accept valid paths array', () => {
      const result = RulesFrontmatterSchema.safeParse({
        paths: ['src/**/*.ts', 'tests/**/*.test.ts'],
      });
      expect(result.success).toBe(true);
    });

    it('should accept single path', () => {
      const result = RulesFrontmatterSchema.safeParse({
        paths: ['src/**/*.ts'],
      });
      expect(result.success).toBe(true);
    });

    it('should accept missing paths (optional)', () => {
      const result = RulesFrontmatterSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should reject empty paths array', () => {
      const result = RulesFrontmatterSchema.safeParse({
        paths: [],
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty path strings', () => {
      const result = RulesFrontmatterSchema.safeParse({
        paths: ['src/**/*.ts', ''],
      });
      expect(result.success).toBe(false);
    });

    it('should accept glob patterns', () => {
      const result = RulesFrontmatterSchema.safeParse({
        paths: [
          '**/*.{ts,tsx}',
          'src/**/index.ts',
          '!node_modules/**',
        ],
      });
      expect(result.success).toBe(true);
    });
  });
});
