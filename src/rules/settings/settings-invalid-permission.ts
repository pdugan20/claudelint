/**
 * Rule: settings-invalid-permission
 *
 * Validates permission tool names in settings.json and settings.local.json.
 *
 * Permission rules use Tool or Tool(pattern) syntax. The valid names are `VALID_TOOLS`
 * (src/schemas/constants.ts), or `mcp__*` for MCP servers.
 *
 * This file used to restate the tool list in prose, in two places. Both went stale, and the
 * rule then reported real tools as invalid (#122). The list is now derived from the single
 * source of truth so it cannot drift again.
 */

import { Rule } from '../../types/rule';
import { VALID_TOOLS } from '../../schemas/constants';
import {
  permissionEntries,
  parsePermissionRule,
  PermissionList,
} from '../../utils/validators/settings';

/** Validate names and globs in the permission list where they are used. */
function isValidTool(tool: string, list: PermissionList): boolean {
  const hasGlob = /[*?[\]{}]/.test(tool);
  if (list !== 'allow' && (hasGlob || tool.includes('_'))) return true;
  if (hasGlob) {
    return /^mcp__[^*?[\]{}]+__[^()]+$/.test(tool);
  }
  // Cd is a permission target for /cd, not a model-invocable tool.
  return (
    tool === 'Cd' || /^mcp__[^()]+$/.test(tool) || (VALID_TOOLS as readonly string[]).includes(tool)
  );
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
        'permissions.ask arrays in settings.json and settings.local.json are recognized Claude Code tools. Valid tools include ' +
        'Bash, Edit, Glob, Grep, Read, Write, and others, as well as MCP server references prefixed ' +
        'with mcp__. Deny and ask lists also accept tool-name globs; allow globs must name a literal MCP server. ' +
        'Cd is accepted as the permission target for /cd. Using an invalid tool name means the permission rule will have no effect, which ' +
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
        `Check the tool name against the list of valid tools: ${VALID_TOOLS.join(', ')}. ` +
        'For MCP servers, use the mcp__ prefix followed by the server name.',
      relatedRules: ['settings-permission-invalid-rule'],
    },
  },

  validate: (context) => {
    const { filePath, fileContent } = context;

    for (const { name, rule: ruleString } of permissionEntries(filePath, fileContent)) {
      const parsed = parsePermissionRule(ruleString);
      if (!parsed) continue; // Syntax is reported by settings-permission-invalid-rule.
      if (!isValidTool(parsed.tool.trim(), name)) {
        context.report({ message: `Invalid tool name: "${parsed.tool.trim()}"` });
      }
    }
  },
};
