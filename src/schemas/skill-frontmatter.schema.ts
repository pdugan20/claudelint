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

  when_to_use: z.string().optional(),

  'argument-hint': z.string().optional(),

  arguments: z.union([z.string(), z.array(z.string())]).optional(),

  'disable-model-invocation': z.boolean().optional(),

  'user-invocable': z.boolean().optional(),

  // claudelint extension: not in official Claude Code docs, used for plugin marketplace
  version: semver().optional(),

  model: ModelNames.optional(),

  context: ContextModes.optional(),

  agent: z.string().optional(),

  effort: z.enum(['low', 'medium', 'high', 'xhigh', 'max']).optional(),

  // Note: Uses z.string() instead of ToolNames to allow custom validation with warnings.
  // Docs accept space-separated string or YAML list — we accept both shapes here.
  'allowed-tools': z.union([z.string(), z.array(z.string())]).optional(),

  // claudelint extension: not in official Claude Code docs, used for skill categorization
  tags: z.array(z.string()).optional(),

  hooks: SettingsHooksSchema.optional(),

  paths: z.union([z.string(), z.array(z.string())]).optional(),

  shell: z.enum(['bash', 'powershell']).optional(),
});

/**
 * Skill frontmatter schema with cross-field refinements
 *
 * `context: fork` does NOT require `agent`. The docs mark `agent` as `Required: No` --
 * "Which subagent type to use when `context: fork` is set" (docs-baseline/skills.md:241) --
 * and print a `context: fork` skill with no `agent` at skills.md:193. claudelint made it
 * mandatory and rejected that example.
 *
 * The alias is kept so callers importing it keep working, and so a future genuine
 * cross-field rule has somewhere to live.
 */
export const SkillFrontmatterWithRefinements = SkillFrontmatterSchema;

export type SkillFrontmatter = z.infer<typeof SkillFrontmatterSchema>;
export type SkillFrontmatterWithValidations = z.infer<typeof SkillFrontmatterWithRefinements>;
