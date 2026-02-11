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
    docs: {
      summary: 'Warns when tools declared in allowed-tools are never referenced in the skill body.',
      details:
        'This rule checks each tool listed in the `allowed-tools` frontmatter array against the SKILL.md body content. ' +
        'If a tool name is never mentioned in the body, it is likely stale configuration left over from a previous version. ' +
        'Unused tool declarations grant unnecessary permissions and make the skill harder to audit. ' +
        'The rule supports both plain tool names and MCP-qualified names (e.g., `mcp__server__tool`), ' +
        'checking for the short name portion of MCP tools as well.',
      examples: {
        incorrect: [
          {
            description: 'Tool listed in allowed-tools but never mentioned in body',
            code: '---\nname: build\ndescription: Builds the project\nallowed-tools:\n  - Bash\n  - Read\n  - WebFetch\n---\n\n## Usage\n\nRun `Bash` to execute the build.\nUse `Read` to check config.',
          },
        ],
        correct: [
          {
            description: 'All allowed tools are referenced in the body',
            code: '---\nname: build\ndescription: Builds the project\nallowed-tools:\n  - Bash\n  - Read\n---\n\n## Usage\n\nUse `Bash` to run the build command.\nUse `Read` to inspect configuration files.',
          },
        ],
      },
      howToFix:
        'Remove unused tools from the `allowed-tools` list, or add instructions in the skill body ' +
        'that reference the tool so the AI model knows when and how to use it.',
      relatedRules: ['skill-allowed-tools', 'skill-mcp-tool-qualified-name'],
    },
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
