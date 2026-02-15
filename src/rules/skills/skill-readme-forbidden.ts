/**
 * Rule: skill-readme-forbidden
 *
 * Errors when a README.md file exists in a skill directory.
 * Anthropic explicitly requires skills to use SKILL.md, not README.md.
 */

import * as path from 'path';
import * as fs from 'fs';
import { Rule } from '../../types/rule';

export const rule: Rule = {
  meta: {
    id: 'skill-readme-forbidden',
    name: 'Skill README Forbidden',
    description: 'Skills must use SKILL.md, not README.md',
    category: 'Skills',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '0.3.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/skills/skill-readme-forbidden.md',
    docs: {
      recommended: true,
      summary: 'Errors when a README.md file exists alongside SKILL.md in a skill directory.',
      rationale:
        'Claude Code loads SKILL.md, not README.md; a conflicting README causes confusion about which file is canonical.',
      details:
        'Anthropic explicitly requires skills to use SKILL.md as their primary documentation file, ' +
        'not README.md. Having both files creates ambiguity about which one is the source of truth ' +
        'for the skill definition. This rule checks whether a README.md exists in the same directory ' +
        'as a SKILL.md and reports an error if found. Note that the `skill-multi-script-missing-readme` ' +
        'rule may suggest adding a README for complex skills; in that case you should consolidate ' +
        'documentation into SKILL.md instead.',
      examples: {
        incorrect: [
          {
            description: 'Skill directory containing both SKILL.md and README.md',
            code: 'my-skill/\n' + '  SKILL.md\n' + '  README.md\n' + '  run.sh',
            language: 'text',
          },
        ],
        correct: [
          {
            description: 'Skill directory with only SKILL.md',
            code: 'my-skill/\n' + '  SKILL.md\n' + '  run.sh',
            language: 'text',
          },
        ],
      },
      howToFix:
        'Remove the README.md file from the skill directory. Migrate any useful content ' +
        'from README.md into SKILL.md.',
    },
  },

  validate: (context) => {
    const { filePath } = context;

    // Only check SKILL.md files
    if (!filePath.endsWith('SKILL.md')) {
      return;
    }

    const skillDir = path.dirname(filePath);
    const readmePath = path.join(skillDir, 'README.md');

    if (fs.existsSync(readmePath)) {
      context.report({
        message: 'README.md found; skills must use SKILL.md',
      });
    }
  },
};
