/**
 * Rule: skill-side-effects-without-disable-model
 *
 * Warns when allowed-tools includes Bash or Write but disable-model-invocation
 * is not set to true. Skills with side-effect tools should explicitly control
 * whether the model can auto-invoke them.
 */

import { Rule, RuleContext } from '../../types/rule';
import { extractFrontmatter, getFrontmatterFieldLine } from '../../utils/formats/markdown';

const SIDE_EFFECT_TOOLS = ['Bash', 'Write', 'Edit', 'NotebookEdit'];

export const rule: Rule = {
  meta: {
    id: 'skill-side-effects-without-disable-model',
    name: 'Skill Side Effects Without Disable Model',
    description:
      'Skills with side-effect tools (Bash, Write) should set disable-model-invocation to control auto-invocation',
    category: 'Skills',
    severity: 'warn',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/skills/skill-side-effects-without-disable-model.md',
  },
  validate: (context: RuleContext) => {
    const { frontmatter } = extractFrontmatter(context.fileContent);

    if (!frontmatter) {
      return;
    }

    const allowedTools = frontmatter['allowed-tools'];

    // Skip if no allowed-tools
    if (!allowedTools || !Array.isArray(allowedTools) || allowedTools.length === 0) {
      return;
    }

    // Check if any side-effect tools are present
    // Match both exact names (e.g., "Bash") and scoped names (e.g., "Bash(claudelint:*)")
    const hasSideEffectTool = allowedTools.some((tool) => {
      if (typeof tool !== 'string') return false;
      return SIDE_EFFECT_TOOLS.some((seTool) => tool === seTool || tool.startsWith(`${seTool}(`));
    });

    if (!hasSideEffectTool) {
      return;
    }

    // Check if disable-model-invocation is set
    if (frontmatter['disable-model-invocation'] !== true) {
      const line = getFrontmatterFieldLine(context.fileContent, 'allowed-tools');
      context.report({
        message:
          'Skill has side-effect tools in allowed-tools but disable-model-invocation is not set to true',
        line,
        fix: 'Add disable-model-invocation: true to frontmatter to prevent automatic model invocation',
      });
    }
  },
};
