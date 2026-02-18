/**
 * Rule: settings-invalid-permission
 *
 * Validates permission tool names in settings.json.
 *
 * Permission rules use Tool or Tool(pattern) syntax.
 * Valid tools: Bash, Read, Write, Edit, Glob, Grep, Task, WebFetch, WebSearch,
 * LSP, AskUserQuestion, EnterPlanMode, ExitPlanMode, Skill, TaskCreate, TaskUpdate,
 * TaskGet, TaskList, TaskOutput, TaskStop, NotebookEdit, or mcp__* for MCP servers.
 */

import { Rule } from '../../types/rule';
import { VALID_TOOLS } from '../../schemas/constants';
import { SettingsSchema } from '../../validators/schemas';
import { z } from 'zod';

type SettingsConfig = z.infer<typeof SettingsSchema>;

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
  return (VALID_TOOLS as readonly string[]).includes(tool);
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
    since: '0.2.0',
    docUrl: 'https://claudelint.com/rules/settings/settings-invalid-permission',
    docs: {
      recommended: true,
      summary: 'Ensures permission rules reference valid Claude Code tool names.',
      rationale:
        'Permissions referencing non-existent tools have no effect, giving a false sense of security.',
      details:
        'This rule validates that tool names used in the permissions.allow, permissions.deny, and ' +
        'permissions.ask arrays in settings.json are recognized Claude Code tools. Valid tools include ' +
        'Bash, Edit, Glob, Grep, Read, Write, and others, as well as MCP server references prefixed ' +
        'with mcp__. Using an invalid tool name means the permission rule will have no effect, which ' +
        'can leave unintended access open or block expected functionality.',
      examples: {
        incorrect: [
          {
            description: 'Permission referencing a non-existent tool name',
            code: '{\n  "permissions": {\n    "allow": ["Bassh(npm run build)"]\n  }\n}',
            language: 'json',
          },
        ],
        correct: [
          {
            description: 'Permission using valid tool names',
            code: '{\n  "permissions": {\n    "allow": ["Bash(npm run build)", "Read", "mcp__myserver"]\n  }\n}',
            language: 'json',
          },
        ],
      },
      howToFix:
        'Check the tool name against the list of valid tools: Bash, Read, Write, Edit, Glob, Grep, ' +
        'Task, WebFetch, WebSearch, LSP, AskUserQuestion, EnterPlanMode, ExitPlanMode, Skill, ' +
        'TaskCreate, TaskUpdate, TaskGet, TaskList, TaskOutput, TaskStop, NotebookEdit. For MCP ' +
        'servers, use the mcp__ prefix followed by the server name.',
      relatedRules: ['settings-permission-invalid-rule'],
    },
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

    for (const { rules } of arrays) {
      for (const ruleString of rules) {
        const tool = extractToolName(ruleString);
        if (!isValidTool(tool)) {
          context.report({
            message: `Invalid tool name: "${tool}"`,
          });
        }
      }
    }
  },
};
