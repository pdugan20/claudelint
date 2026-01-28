/**
 * Tests for CLAUDE.md frontmatter schema
 */

import { ClaudeMdFrontmatterSchema } from '../../src/schemas/claude-md-frontmatter.schema';

describe('ClaudeMdFrontmatterSchema', () => {
  describe('paths validation', () => {
    it('should accept valid paths array', () => {
      const result = ClaudeMdFrontmatterSchema.safeParse({
        paths: ['src/**/*.ts', 'tests/**/*.test.ts'],
      });
      expect(result.success).toBe(true);
    });

    it('should accept single path', () => {
      const result = ClaudeMdFrontmatterSchema.safeParse({
        paths: ['src/**/*.ts'],
      });
      expect(result.success).toBe(true);
    });

    it('should accept missing paths (optional)', () => {
      const result = ClaudeMdFrontmatterSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should reject empty paths array', () => {
      const result = ClaudeMdFrontmatterSchema.safeParse({
        paths: [],
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty path strings', () => {
      const result = ClaudeMdFrontmatterSchema.safeParse({
        paths: ['src/**/*.ts', ''],
      });
      expect(result.success).toBe(false);
    });

    it('should accept glob patterns', () => {
      const result = ClaudeMdFrontmatterSchema.safeParse({
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
