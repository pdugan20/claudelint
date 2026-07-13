/**
 * Agent frontmatter schema
 * Based on https://code.claude.com/docs/en/sub-agents#supported-frontmatter-fields
 */

import { z } from 'zod';
import { noXMLTags, lowercaseHyphens } from './refinements';
import { SettingsHooksSchema, MCPServerSchema } from '../validators/schemas';

/**
 * Permission modes for agents
 *
 * `manual` is a documented alias for `default` (Claude Code v2.1.200+).
 */
const PermissionModes = z.enum([
  'default',
  'manual',
  'acceptEdits',
  'auto',
  'dontAsk',
  'bypassPermissions',
  'plan',
]);

/**
 * A tool list, in either documented form.
 *
 * The docs write tool lists as a bare comma-separated string -- `tools: Read, Glob, Grep`
 * is the canonical sub-agent example (docs-baseline/sub-agents.md:247) -- and also accept a
 * YAML list: "Accepts a space- or comma-separated string, or a YAML list"
 * (docs-baseline/skills.md:236).
 *
 * claudelint modelled the array form only, so an agent copied VERBATIM from the official
 * docs failed to lint with "expected array, received string". The skill schema already had
 * this union; the agent fields simply never got it.
 */
const ToolList = z.union([z.string(), z.array(z.string())]);

/**
 * Base agent frontmatter schema without cross-field validations
 */
export const AgentFrontmatterSchema = z.object({
  name: lowercaseHyphens()
    .max(64, 'Agent name must be 64 characters or less')
    .refine(noXMLTags().check, { message: noXMLTags().message }),

  // Note: Agent descriptions conventionally include <example> and <commentary>
  // XML tags and contain dialog with "I"/"you", so noXMLTags and thirdPerson
  // refinements are intentionally omitted (unlike skill descriptions).
  description: z.string().min(10, 'Description must be at least 10 characters'),

  // Accepts aliases (sonnet, opus, haiku, inherit) or full model IDs (e.g. claude-opus-4-6)
  model: z.string().optional(),

  // Note: Uses z.string() instead of ToolNames to allow custom validation with warnings
  tools: ToolList.optional(),

  // Note: Uses z.string() instead of ToolNames to allow custom validation with warnings
  disallowedTools: ToolList.optional(),

  permissionMode: PermissionModes.optional(),

  skills: z.array(z.string()).optional(),

  // Hooks that this agent defines (object format with event name keys)
  hooks: SettingsHooksSchema.optional(),

  maxTurns: z.number().int().positive().optional(),

  // Each entry is either a string reference to a configured server, or an inline
  // definition { serverName: { type, command, ... } } per the MCP server schema
  mcpServers: z.array(z.union([z.string(), z.record(z.string(), MCPServerSchema)])).optional(),

  memory: z.enum(['user', 'project', 'local']).optional(),

  effort: z.enum(['low', 'medium', 'high', 'xhigh', 'max']).optional(),

  // Official enum: red, blue, green, yellow, purple, orange, pink, cyan
  // `magenta` is retained as a claudelint backward-compat extension for older agent files.
  color: z
    .enum(['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'cyan', 'magenta'])
    .optional(),

  background: z.boolean().optional(),

  isolation: z.enum(['worktree']).optional(),

  initialPrompt: z.string().optional(),
});

/**
 * Agent frontmatter schema with cross-field refinements
 *
 * `tools` and `disallowedTools` are NOT mutually exclusive. claudelint rejected configs
 * setting both, but the docs define the combined behavior explicitly: "If both are set,
 * `disallowedTools` is applied first, then `tools` is resolved against the remaining pool.
 * A tool listed in both is removed." (docs-baseline/sub-agents.md:342)
 *
 * The alias is kept so callers importing it keep working, and so a future genuine
 * cross-field rule has somewhere to live.
 */
export const AgentFrontmatterWithRefinements = AgentFrontmatterSchema;

export type AgentFrontmatter = z.infer<typeof AgentFrontmatterSchema>;
export type AgentFrontmatterWithValidations = z.infer<typeof AgentFrontmatterWithRefinements>;
