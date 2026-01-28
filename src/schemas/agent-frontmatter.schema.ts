/**
 * Agent frontmatter schema
 */

import { z } from 'zod';
import { ModelNames } from './constants';
import { noXMLTags, thirdPerson, lowercaseHyphens } from './refinements';
import { HookSchema } from '../validators/schemas';

/**
 * Base agent frontmatter schema without cross-field validations
 */
export const AgentFrontmatterSchema = z.object({
  name: lowercaseHyphens()
    .max(64, 'Agent name must be 64 characters or less')
    .refine(noXMLTags().check, { message: noXMLTags().message }),

  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .refine(noXMLTags().check, { message: noXMLTags().message })
    .refine(thirdPerson().check, { message: thirdPerson().message }),

  model: ModelNames.optional(),

  // Note: Uses z.string() instead of ToolNames to allow custom validation with warnings
  tools: z.array(z.string()).optional(),

  // Note: Uses z.string() instead of ToolNames to allow custom validation with warnings
  'disallowed-tools': z.array(z.string()).optional(),

  skills: z.array(z.string()).optional(),

  // Note: Uses z.string() instead of HookEvents to allow custom validation with warnings
  events: z.array(z.string()).optional(),

  // Hooks that this agent defines
  hooks: z.array(HookSchema).optional(),
});

/**
 * Agent frontmatter schema with cross-field refinements
 */
export const AgentFrontmatterWithRefinements = AgentFrontmatterSchema.refine(
  (data) => {
    // tools and disallowed-tools are mutually exclusive
    if (data.tools && data['disallowed-tools']) {
      return false;
    }
    return true;
  },
  {
    message: 'Cannot specify both tools and disallowed-tools',
    path: ['tools'],
  }
).refine(
  (data) => {
    // events can only have up to 3 items
    if (data.events && data.events.length > 3) {
      return false;
    }
    return true;
  },
  {
    message: 'Events array cannot have more than 3 items',
    path: ['events'],
  }
);

export type AgentFrontmatter = z.infer<typeof AgentFrontmatterSchema>;
export type AgentFrontmatterWithValidations = z.infer<
  typeof AgentFrontmatterWithRefinements
>;
