/**
 * Skill frontmatter schema
 * Based on official spec: https://code.claude.com/docs/en/skills#frontmatter-reference
 */

import { z } from 'zod';
import { ModelNames, ContextModes } from './constants';
import { noXMLTags, thirdPerson, lowercaseHyphens, semver, noReservedWords } from './refinements';
import { SettingsHooksSchema } from '../validators/schemas';

/**
 * Base skill frontmatter schema without cross-field validations
 */
export const SkillFrontmatterSchema = z.object({
  name: lowercaseHyphens()
    .max(64, 'Skill name must be 64 characters or less')
    .refine(noXMLTags().check, { message: noXMLTags().message })
    .refine(noReservedWords().check, { message: noReservedWords().message }),

  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .refine(noXMLTags().check, { message: noXMLTags().message })
    .refine(thirdPerson().check, { message: thirdPerson().message }),

  'argument-hint': z.string().optional(),

  'disable-model-invocation': z.boolean().optional(),

  'user-invocable': z.boolean().optional(),

  version: semver().optional(),

  model: ModelNames.optional(),

  context: ContextModes.optional(),

  agent: z.string().optional(),

  // Note: Uses z.string() instead of ToolNames to allow custom validation with warnings
  'allowed-tools': z.array(z.string()).optional(),

  // Note: Uses z.string() instead of ToolNames to allow custom validation with warnings
  'disallowed-tools': z.array(z.string()).optional(),

  tags: z.array(z.string()).optional(),

  dependencies: z.array(z.string()).optional(),

  hooks: SettingsHooksSchema.optional(),
});

/**
 * Skill frontmatter schema with cross-field refinements
 */
export const SkillFrontmatterWithRefinements = SkillFrontmatterSchema.refine(
  (data) => {
    // If context is 'fork', agent must be specified
    if (data.context === 'fork' && !data.agent) {
      return false;
    }
    return true;
  },
  {
    message: 'When context is "fork", agent field is required',
    path: ['agent'],
  }
).refine(
  (data) => {
    // allowed-tools and disallowed-tools are mutually exclusive
    if (data['allowed-tools'] && data['disallowed-tools']) {
      return false;
    }
    return true;
  },
  {
    message: 'Cannot specify both allowed-tools and disallowed-tools',
    path: ['allowed-tools'],
  }
);

export type SkillFrontmatter = z.infer<typeof SkillFrontmatterSchema>;
export type SkillFrontmatterWithValidations = z.infer<typeof SkillFrontmatterWithRefinements>;
