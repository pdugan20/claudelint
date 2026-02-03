/**
 * Rules file frontmatter schema
 * Based on https://code.claude.com/docs/en/memory#path-specific-rules
 */

import { z } from 'zod';

/**
 * Frontmatter schema for .claude/rules/*.md files
 * Rules files can specify paths for glob pattern matching to scope rules to specific files
 */
export const RulesFrontmatterSchema = z.object({
  paths: z
    .array(z.string().min(1, 'Path pattern cannot be empty'))
    .min(1, 'Paths array must have at least one pattern')
    .optional(),
});

export type RulesFrontmatter = z.infer<typeof RulesFrontmatterSchema>;
