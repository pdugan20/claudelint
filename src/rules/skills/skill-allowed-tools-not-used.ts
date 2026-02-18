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
    since: '0.2.0',
    docUrl: 'https://claudelint.com/rules/skills/skill-allowed-tools-not-used',
    docs: {
      strict: true,
      summary:
        'Warns when none of the tools declared in allowed-tools are referenced in the skill body.',
      rationale:
        'A tool list with zero references in the body suggests a copy-pasted or stale configuration.',
      details:
        'This rule checks the `allowed-tools` frontmatter array against the SKILL.md body content. ' +
        'If none of the listed tools are referenced anywhere in the body, the entire list is likely ' +
        'copy-pasted or stale. If at least one tool is referenced, the list is considered intentional ' +
        '(tools may be needed for autonomy without being mentioned by name). ' +
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

    // Check if ANY tool is referenced in the body
    const hasAnyReference = allowedTools.some((tool) => {
      if (typeof tool !== 'string') return false;
      const baseName = getBaseToolName(tool);
      return isToolReferencedInBody(baseName, body);
    });

    // If at least one tool is referenced, the list is intentional — skip
    if (hasAnyReference) {
      return;
    }

    // None of the tools are referenced — report the whole list
    context.report({
      message: `None of the ${allowedTools.length} allowed-tools are referenced in the skill body`,
      line,
    });
  },
};
