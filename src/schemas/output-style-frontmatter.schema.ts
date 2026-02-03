/**
 * Output style frontmatter schema
 * Based on https://code.claude.com/docs/en/output-styles#frontmatter
 */

import { z } from 'zod';

/**
 * Output style frontmatter schema
 * All fields are optional - name and description inherit from file name/context if not specified
 */
export const OutputStyleFrontmatterSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  'keep-coding-instructions': z.boolean().optional(),
});

export type OutputStyleFrontmatter = z.infer<typeof OutputStyleFrontmatterSchema>;
