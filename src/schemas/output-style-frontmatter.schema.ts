/**
 * Output style frontmatter schema
 */

import { z } from 'zod';
import { noXMLTags, thirdPerson, lowercaseHyphens } from './refinements';

/**
 * Output style frontmatter schema
 */
export const OutputStyleFrontmatterSchema = z.object({
  name: lowercaseHyphens()
    .max(64, 'Output style name must be 64 characters or less')
    .refine(noXMLTags().check, { message: noXMLTags().message }),

  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .refine(noXMLTags().check, { message: noXMLTags().message })
    .refine(thirdPerson().check, { message: thirdPerson().message }),

  examples: z.array(z.string()).optional(),
});

export type OutputStyleFrontmatter = z.infer<typeof OutputStyleFrontmatterSchema>;
