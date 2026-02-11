/**
 * Rule: skill-mcp-tool-qualified-name
 *
 * Warns when allowed-tools entries appear to be MCP tools but don't use the
 * qualified mcp__server__tool format. Unqualified MCP tool names can be
 * ambiguous when multiple servers provide tools with similar names.
 */

import { Rule, RuleContext } from '../../types/rule';
import { extractFrontmatter, getFrontmatterFieldLine } from '../../utils/formats/markdown';
import { VALID_TOOLS } from '../../schemas/constants';

/**
 * Built-in tool names (and common aliases) that are NOT MCP tools.
 * These should not trigger the qualified name warning.
 */
const BUILT_IN_TOOLS = new Set<string>(VALID_TOOLS);

/**
 * Check if a tool entry is a built-in tool (possibly with a scope).
 * "Bash" -> true
 * "Bash(pattern)" -> true
 * "custom_tool" -> false
 */
function isBuiltInTool(entry: string): boolean {
  const parenIndex = entry.indexOf('(');
  const baseName = parenIndex !== -1 ? entry.substring(0, parenIndex) : entry;
  return BUILT_IN_TOOLS.has(baseName);
}

/**
 * Check if a tool entry already uses the qualified MCP format.
 * "mcp__server__tool" -> true
 * "custom_tool" -> false
 */
function isQualifiedMcpTool(entry: string): boolean {
  return entry.startsWith('mcp__');
}

export const rule: Rule = {
  meta: {
    id: 'skill-mcp-tool-qualified-name',
    name: 'Skill MCP Tool Qualified Name',
    description:
      'MCP tools in allowed-tools should use qualified mcp__server__tool format for clarity',
    category: 'Skills',
    severity: 'warn',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/skills/skill-mcp-tool-qualified-name.md',
    docs: {
      summary:
        'Warns when allowed-tools entries appear to be MCP tools but lack the qualified mcp__server__tool format.',
      details:
        'MCP (Model Context Protocol) tools should use the fully qualified `mcp__<server>__<tool>` naming format ' +
        'in the `allowed-tools` list. Unqualified tool names can be ambiguous when multiple MCP servers ' +
        'provide tools with similar names. This rule skips recognized built-in tools (e.g., Bash, Read, Write) ' +
        'and tools already using the `mcp__` prefix. Any remaining unrecognized tool name triggers a warning, ' +
        'as it is likely an MCP tool reference that should be fully qualified.',
      examples: {
        incorrect: [
          {
            description: 'Unqualified MCP tool name in allowed-tools',
            code: '---\nname: search\ndescription: Searches across repositories\nallowed-tools:\n  - Bash\n  - search_code\n---',
          },
        ],
        correct: [
          {
            description: 'Fully qualified MCP tool name',
            code: '---\nname: search\ndescription: Searches across repositories\nallowed-tools:\n  - Bash\n  - mcp__github__search_code\n---',
          },
          {
            description: 'Only built-in tools (no MCP tools)',
            code: '---\nname: lint\ndescription: Runs linting checks\nallowed-tools:\n  - Bash\n  - Read\n  - Write\n---',
          },
        ],
      },
      howToFix:
        'Replace the unqualified tool name with the fully qualified MCP format: `mcp__<server>__<tool>`. ' +
        'For example, change `search_code` to `mcp__github__search_code`.',
      relatedRules: ['skill-allowed-tools', 'skill-allowed-tools-not-used'],
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

    const line = getFrontmatterFieldLine(context.fileContent, 'allowed-tools');

    for (const tool of allowedTools) {
      if (typeof tool !== 'string') continue;

      // Skip built-in tools and already-qualified MCP tools
      if (isBuiltInTool(tool) || isQualifiedMcpTool(tool)) {
        continue;
      }

      // This tool entry is not a recognized built-in and not in mcp__ format.
      // It's likely an unqualified MCP tool reference.
      context.report({
        message:
          `Tool "${tool}" is not a recognized built-in tool. ` +
          'If this is an MCP tool, use the qualified format: mcp__<server>__<tool>',
        line,
      });
    }
  },
};
