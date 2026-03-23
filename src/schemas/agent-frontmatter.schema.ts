/**
 * Agent frontmatter schema
 * Based on https://code.claude.com/docs/en/sub-agents#supported-frontmatter-fields
 */

import { z } from 'zod';
import { noXMLTags, lowercaseHyphens } from './refinements';
import { SettingsHooksSchema, MCPServerSchema } from '../validators/schemas';

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

  // Note: Agent descriptions conventionally include <example> and <commentary>
  // XML tags and contain dialog with "I"/"you", so noXMLTags and thirdPerson
  // refinements are intentionally omitted (unlike skill descriptions).
  description: z.string().min(10, 'Description must be at least 10 characters'),

  // Accepts aliases (sonnet, opus, haiku, inherit) or full model IDs (e.g. claude-opus-4-6)
  model: z.string().optional(),

  // Note: Uses z.string() instead of ToolNames to allow custom validation with warnings
  tools: z.array(z.string()).optional(),

  // Note: Uses z.string() instead of ToolNames to allow custom validation with warnings
  disallowedTools: z.array(z.string()).optional(),

  permissionMode: PermissionModes.optional(),

  skills: z.array(z.string()).optional(),

  // Hooks that this agent defines (object format with event name keys)
  hooks: SettingsHooksSchema.optional(),

  maxTurns: z.number().int().positive().optional(),

  // Each entry is either a string reference to a configured server, or an inline
  // definition { serverName: { type, command, ... } } per the MCP server schema
  mcpServers: z.array(z.union([z.string(), z.record(z.string(), MCPServerSchema)])).optional(),

  memory: z.enum(['user', 'project', 'local']).optional(),

  effort: z.enum(['low', 'medium', 'high', 'max']).optional(),

  // claudelint extension: not in official Claude Code docs, but used by /agents UI color picker
  color: z.enum(['blue', 'cyan', 'green', 'yellow', 'magenta', 'red', 'pink']).optional(),

  background: z.boolean().optional(),

  isolation: z.enum(['worktree']).optional(),
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
