/**
 * Agent frontmatter schema
 * Based on https://code.claude.com/docs/en/sub-agents#supported-frontmatter-fields
 */

import { z } from 'zod';
import { ModelNames } from './constants';
import { noXMLTags, thirdPerson, lowercaseHyphens } from './refinements';
import { SettingsHooksSchema } from '../validators/schemas';

/**
 * Permission modes for agents
 */
const PermissionModes = z.enum(['default', 'acceptEdits', 'dontAsk', 'bypassPermissions', 'plan']);

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
  disallowedTools: z.array(z.string()).optional(),

  permissionMode: PermissionModes.optional(),

  skills: z.array(z.string()).optional(),

  // Hooks that this agent defines (object format with event name keys)
  hooks: SettingsHooksSchema.optional(),
});

/**
 * Agent frontmatter schema with cross-field refinements
 */
export const AgentFrontmatterWithRefinements = AgentFrontmatterSchema.refine(
  (data) => {
    // tools and disallowedTools are mutually exclusive
    if (data.tools && data.disallowedTools) {
      return false;
    }
    return true;
  },
  {
    message: 'Cannot specify both tools and disallowedTools',
    path: ['tools'],
  }
);

export type AgentFrontmatter = z.infer<typeof AgentFrontmatterSchema>;
export type AgentFrontmatterWithValidations = z.infer<typeof AgentFrontmatterWithRefinements>;
