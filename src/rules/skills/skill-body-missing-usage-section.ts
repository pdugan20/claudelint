/**
 * Rule: skill-body-missing-usage-section
 *
 * Warns when SKILL.md body lacks a ## Usage section. A dedicated usage
 * section helps users understand how to invoke and interact with the skill.
 */

import { Rule, RuleContext } from '../../types/rule';
import { extractBodyContent } from '../../utils/formats/markdown';

export const rule: Rule = {
  meta: {
    id: 'skill-body-missing-usage-section',
    name: 'Skill Body Missing Usage Section',
    description: 'SKILL.md body lacks a ## Usage section',
    category: 'Skills',
    severity: 'warn',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/skills/skill-body-missing-usage-section.md',
    docs: {
      summary: 'Warns when a SKILL.md body lacks a "## Usage" section.',
      details:
        'A dedicated `## Usage` section helps users and AI models understand how to invoke and interact ' +
        'with the skill. This rule checks the body content of SKILL.md files for a level-2 heading that ' +
        'starts with "Usage". Without this section, users must read through the entire file to figure out ' +
        'how to use the skill, reducing discoverability and usability.',
      examples: {
        incorrect: [
          {
            description: 'SKILL.md body without a Usage section',
            code: '---\nname: deploy\ndescription: Deploys the application\n---\n\n# Deploy\n\nThis skill deploys the app.\n\n## Configuration\n\nSet environment variables.',
            language: 'markdown',
          },
        ],
        correct: [
          {
            description: 'SKILL.md body with a Usage section',
            code: '---\nname: deploy\ndescription: Deploys the application\n---\n\n# Deploy\n\n## Usage\n\nRun `/deploy staging` to deploy to the staging environment.\n\n## Configuration\n\nSet environment variables.',
            language: 'markdown',
          },
        ],
      },
      howToFix:
        'Add a `## Usage` section to the body of your SKILL.md file. Include invocation examples, ' +
        'expected arguments, and any flags or options the skill supports.',
      relatedRules: ['skill-body-too-long', 'skill-body-word-count'],
    },
  },

  validate: (context: RuleContext) => {
    const { filePath, fileContent } = context;

    // Only check SKILL.md files
    if (!filePath.endsWith('SKILL.md')) {
      return;
    }

    const body = extractBodyContent(fileContent);

    if (!body) {
      return; // No body to check (handled by other rules)
    }

    const hasUsageSection = /^##\s+Usage/im.test(body);

    if (!hasUsageSection) {
      context.report({
        message:
          'SKILL.md body lacks a "## Usage" section. ' +
          'Add a usage section to help users understand how to invoke this skill.',
        fix: 'Add a "## Usage" section with invocation examples',
      });
    }
  },
};
