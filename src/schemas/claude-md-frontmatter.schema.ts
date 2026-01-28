/**
 * CLAUDE.md frontmatter schema
 */

import { z } from 'zod';

/**
 * CLAUDE.md frontmatter schema for rules files
 * Rules files can specify paths for glob pattern matching
 */
export const ClaudeMdFrontmatterSchema = z.object({
  paths: z
    .array(z.string().min(1, 'Path pattern cannot be empty'))
    .min(1, 'Paths array must have at least one pattern')
    .optional(),
});

export type ClaudeMdFrontmatter = z.infer<typeof ClaudeMdFrontmatterSchema>;
