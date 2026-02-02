/**
 * Rule: settings-invalid-permission
 *
 * Validates permission tool names in settings.json.
 *
 * Permission rules use Tool or Tool(pattern) syntax.
 * Valid tools: Bash, Edit, ExitPlanMode, Glob, Grep, KillShell, NotebookEdit,
 * Read, Skill, Task, TodoWrite, WebFetch, WebSearch, Write, or mcp__* for MCP servers.
 */

import { Rule } from '../../types/rule';
import { SettingsSchema } from '../../validators/schemas';
import { z } from 'zod';

type SettingsConfig = z.infer<typeof SettingsSchema>;

// Valid Claude Code tools based on official schema
const VALID_TOOLS = [
  'Bash',
  'Edit',
  'ExitPlanMode',
  'Glob',
  'Grep',
  'KillShell',
  'NotebookEdit',
  'Read',
  'Skill',
  'Task',
  'TodoWrite',
  'WebFetch',
  'WebSearch',
  'Write',
] as const;

/**
 * Extract tool name from permission rule string
 * "Bash(npm run *)" -> "Bash"
 * "Read" -> "Read"
 * "mcp__myserver" -> "mcp__myserver"
 */
function extractToolName(rule: string): string {
  const match = rule.match(/^([^(]+)/);
  return match ? match[1].trim() : rule;
}

/**
 * Check if tool name is valid
 */
function isValidTool(tool: string): boolean {
  // MCP server references start with mcp__
  if (tool.startsWith('mcp__')) {
    return true;
  }
  // Check against known tools
  return VALID_TOOLS.includes(tool as (typeof VALID_TOOLS)[number]);
}

/**
 * Validates that permission tool names are valid
 */
export const rule: Rule = {
  meta: {
    id: 'settings-invalid-permission',
    name: 'Settings Invalid Permission',
    description: 'Permission rules must use valid tool names',
    category: 'Settings',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/settings/settings-invalid-permission.md',
  },

  validate: (context) => {
    const { filePath, fileContent } = context;

    // Only validate settings.json files
    if (!filePath.endsWith('settings.json')) {
      return;
    }

    let config: SettingsConfig;
    try {
      config = JSON.parse(fileContent) as SettingsConfig;
    } catch {
      return; // JSON parse errors handled by schema validation
    }

    if (!config.permissions) {
      return;
    }

    // Validate tool names in allow, deny, and ask arrays
    const arrays = [
      { name: 'allow', rules: config.permissions.allow || [] },
      { name: 'deny', rules: config.permissions.deny || [] },
      { name: 'ask', rules: config.permissions.ask || [] },
    ];

    for (const { name, rules } of arrays) {
      for (const ruleString of rules) {
        const tool = extractToolName(ruleString);
        if (!isValidTool(tool)) {
          context.report({
            message: `Invalid tool name in permissions.${name}: "${tool}". Valid tools: ${VALID_TOOLS.join(', ')}, or mcp__* for MCP servers`,
          });
        }
      }
    }
  },
};
