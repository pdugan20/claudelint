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
    docs: {
      summary:
        'Warns when skills with side-effect tools do not set `disable-model-invocation` to true.',
      details:
        'Skills that include side-effect tools (Bash, Write, Edit, NotebookEdit) in their ' +
        '`allowed-tools` list can potentially execute destructive operations. Setting ' +
        '`disable-model-invocation: true` prevents Claude from automatically invoking the skill, ' +
        'requiring explicit user action instead. This rule checks for the presence of side-effect ' +
        'tools in `allowed-tools` (including scoped variants like `Bash(scope:*)`) and verifies ' +
        'that `disable-model-invocation` is set to `true` when they are present.',
      examples: {
        incorrect: [
          {
            description: 'Side-effect tools without disable-model-invocation',
            code:
              '---\nname: deploy-app\ndescription: Deploys the application\n' +
              'allowed-tools:\n  - Bash\n  - Read\n---',
          },
          {
            description: 'Scoped Bash tool without disable-model-invocation',
            code:
              '---\nname: format-code\ndescription: Formats source files\n' +
              'allowed-tools:\n  - Bash(prettier:*)\n  - Write\n---',
          },
        ],
        correct: [
          {
            description: 'Side-effect tools with disable-model-invocation enabled',
            code:
              '---\nname: deploy-app\ndescription: Deploys the application\n' +
              'disable-model-invocation: true\n' +
              'allowed-tools:\n  - Bash\n  - Read\n---',
          },
          {
            description: 'No side-effect tools (disable-model-invocation not needed)',
            code:
              '---\nname: analyze-code\ndescription: Analyzes source code\n' +
              'allowed-tools:\n  - Read\n  - Glob\n---',
          },
        ],
      },
      howToFix:
        'Add `disable-model-invocation: true` to the SKILL.md frontmatter. This prevents the model ' +
        'from auto-invoking the skill, requiring explicit user confirmation for side-effect operations.',
      relatedRules: ['skill-allowed-tools', 'skill-disallowed-tools', 'skill-dangerous-command'],
    },
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
