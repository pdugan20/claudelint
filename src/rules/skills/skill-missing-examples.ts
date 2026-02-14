/**
 * Rule: skill-missing-examples
 *
 * Warns when SKILL.md lacks usage examples. Skills should include code blocks or
 * an "Example" section to help users understand how to use the skill.
 */

import { Rule } from '../../types/rule';

/**
 * Missing examples validation rule implementation
 */
export const rule: Rule = {
  meta: {
    id: 'skill-missing-examples',
    name: 'Skill Missing Examples',
    description: 'SKILL.md lacks usage examples',
    category: 'Skills',
    severity: 'warn',
    fixable: false,
    deprecated: false,
    since: '0.2.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/skills/skill-missing-examples.md',
    docs: {
      recommended: true,
      summary:
        'Warns when SKILL.md lacks usage examples such as code blocks or an Example section.',
      rationale:
        'Skills without examples are harder for both users and the AI model to understand and use correctly.',
      details:
        'Skills should include concrete usage examples so users understand how to invoke them ' +
        'and what to expect. This rule checks for the presence of fenced code blocks (```) or ' +
        'a markdown section titled "Example", "Examples", or "Usage". Without examples, users ' +
        'must read the entire skill to figure out how to use it, which slows adoption.',
      examples: {
        incorrect: [
          {
            description: 'SKILL.md with no code blocks or example section',
            code:
              '---\nname: deploy-app\ndescription: Deploys the application\n---\n\n' +
              'This skill deploys the application to production.\n\n' +
              'It uses the deploy script to push changes.',
            language: 'markdown',
          },
        ],
        correct: [
          {
            description: 'SKILL.md with a code block example',
            code:
              '---\nname: deploy-app\ndescription: Deploys the application\n---\n\n' +
              '## Usage\n\n' +
              '```bash\n/deploy-app staging\n```',
            language: 'markdown',
          },
          {
            description: 'SKILL.md with an Example section heading',
            code:
              '---\nname: deploy-app\ndescription: Deploys the application\n---\n\n' +
              '## Example\n\nRun the skill with the target environment as the argument.',
            language: 'markdown',
          },
        ],
      },
      howToFix:
        'Add a fenced code block showing how to invoke the skill, or add a section headed ' +
        '"## Example", "## Examples", or "## Usage" with usage instructions.',
      relatedRules: ['skill-body-missing-usage-section', 'skill-body-word-count'],
    },
  },

  validate: (context) => {
    const { filePath, fileContent } = context;

    // Only check SKILL.md files
    if (!filePath.endsWith('SKILL.md')) {
      return;
    }

    // Check for code blocks or example sections
    const hasCodeBlocks = /```[\s\S]*?```/.test(fileContent);
    const hasExampleSection = /##?\s+(Example|Usage|Examples)/i.test(fileContent);

    if (!hasCodeBlocks && !hasExampleSection) {
      context.report({
        message: 'Missing usage examples',
      });
    }
  },
};
