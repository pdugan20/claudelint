/**
 * Rule: skill-body-missing-usage-section
 *
 * Warns when SKILL.md body lacks a ## Usage or ## Instructions section.
 * A dedicated section helps users understand how to invoke and interact with the skill.
 */

import { Rule, RuleContext } from '../../types/rule';
import { extractBodyContent } from '../../utils/formats/markdown';

export const rule: Rule = {
  meta: {
    id: 'skill-body-missing-usage-section',
    name: 'Skill Body Missing Usage Section',
    description: 'SKILL.md body lacks a usage/instructions section',
    category: 'Skills',
    severity: 'warn',
    fixable: false,
    deprecated: false,
    since: '0.2.0',
    docUrl: 'https://claudelint.com/rules/skills/skill-body-missing-usage-section',
    docs: {
      recommended: true,
      summary: 'Warns when a SKILL.md body lacks a usage or instructions heading.',
      rationale:
        'A missing usage section leaves users and the AI model without clear invocation instructions.',
      details:
        'A dedicated usage/instructions section helps users and AI models understand how to ' +
        'invoke and interact with the skill. This rule checks the body content of SKILL.md files for a ' +
        'level-2 heading matching common conventions: "Usage", "Instructions", "Quick Start", ' +
        '"Quick Workflow", "Getting Started", "How to Use", or "Examples". Without such a section, ' +
        'users must read through the entire file to figure out how to use the skill.',
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
          {
            description: 'SKILL.md body with an Instructions section',
            code: '---\nname: deploy\ndescription: Deploys the application\n---\n\n# Deploy\n\n## Instructions\n\n### Step 1: Configure environment\nSet the target environment variable.\n\n### Step 2: Run deployment\nExecute the deploy command.',
            language: 'markdown',
          },
        ],
      },
      howToFix:
        'Add a section like `## Usage`, `## Instructions`, `## Quick Start`, `## Getting Started`, ' +
        '`## How to Use`, or `## Examples` to the body of your SKILL.md file. Include invocation examples, ' +
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

    const hasUsageSection =
      /^##\s+(Usage|Instructions|Quick\s+Start|Quick\s+Workflow|Getting\s+Started|How\s+to\s+Use|Examples)/im.test(
        body
      );

    if (!hasUsageSection) {
      context.report({
        message: 'Missing usage/instructions section',
        fix: 'Add a "## Usage", "## Instructions", "## Quick Start", or similar section',
      });
    }
  },
};
