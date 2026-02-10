/**
 * Rule: skill-allowed-tools-not-used
 *
 * Warns when tools declared in the allowed-tools frontmatter are never
 * referenced anywhere in the skill body. Unused tool declarations add
 * unnecessary permissions and may indicate stale configuration.
 */

import { Rule, RuleContext } from '../../types/rule';
import {
  extractFrontmatter,
  extractBodyContent,
  getFrontmatterFieldLine,
} from '../../utils/formats/markdown';

/**
 * Extract the base tool name from an allowed-tools entry.
 * "Bash(pattern)" -> "Bash"
 * "mcp__server__tool" -> "mcp__server__tool"
 * "Read" -> "Read"
 */
function getBaseToolName(entry: string): string {
  const parenIndex = entry.indexOf('(');
  if (parenIndex !== -1) {
    return entry.substring(0, parenIndex);
  }
  return entry;
}

/**
 * Check if a tool name is referenced in the body content.
 * Uses case-insensitive word boundary matching.
 */
function isToolReferencedInBody(toolName: string, body: string): boolean {
  // For MCP tools (mcp__server__tool), also check for the tool part after last __
  if (toolName.startsWith('mcp__')) {
    const parts = toolName.split('__');
    const shortName = parts[parts.length - 1];
    if (shortName && body.toLowerCase().includes(shortName.toLowerCase())) {
      return true;
    }
  }

  // Check for the tool name itself (case-insensitive)
  const escapedName = toolName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`\\b${escapedName}\\b`, 'i');
  return pattern.test(body);
}

export const rule: Rule = {
  meta: {
    id: 'skill-allowed-tools-not-used',
    name: 'Skill Allowed Tools Not Used',
    description: 'Tools listed in allowed-tools are never referenced in the skill body',
    category: 'Skills',
    severity: 'warn',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/skills/skill-allowed-tools-not-used.md',
  },

  validate: (context: RuleContext) => {
    const { frontmatter } = extractFrontmatter(context.fileContent);

    if (!frontmatter || !frontmatter['allowed-tools']) {
      return;
    }

    const allowedTools = frontmatter['allowed-tools'];
    if (!Array.isArray(allowedTools) || allowedTools.length === 0) {
      return;
    }

    const body = extractBodyContent(context.fileContent);
    if (!body) {
      return; // No body to check against
    }

    const line = getFrontmatterFieldLine(context.fileContent, 'allowed-tools');

    for (const tool of allowedTools) {
      if (typeof tool !== 'string') continue;

      const baseName = getBaseToolName(tool);
      if (!isToolReferencedInBody(baseName, body)) {
        context.report({
          message:
            `Tool "${tool}" is listed in allowed-tools but never referenced in the skill body. ` +
            'Remove unused tools or add usage instructions.',
          line,
        });
      }
    }
  },
};
