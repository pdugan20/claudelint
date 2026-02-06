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
        message:
          'Skills must use SKILL.md, not README.md. Remove README.md from the skill directory.',
      });
    }
  },
};
