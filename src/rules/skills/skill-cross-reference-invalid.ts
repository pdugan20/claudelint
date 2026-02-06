/**
 * Rule: skill-cross-reference-invalid
 *
 * Validates that cross-references between skills (e.g., in See Also sections)
 * point to SKILL.md files that actually exist.
 */

import * as path from 'path';
import * as fs from 'fs';
import { Rule, RuleContext } from '../../types/rule';

export const rule: Rule = {
  meta: {
    id: 'skill-cross-reference-invalid',
    name: 'Skill Cross-Reference Invalid',
    description: 'Cross-reference points to non-existent skill',
    category: 'Skills',
    severity: 'warn',
    fixable: false,
    deprecated: false,
    since: '0.3.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/skills/skill-cross-reference-invalid.md',
  },

  validate: (context: RuleContext) => {
    const { filePath, fileContent } = context;

    // Only validate SKILL.md files
    if (!filePath.endsWith('SKILL.md')) {
      return;
    }

    // Match markdown links that reference other SKILL.md files via relative paths
    const crossRefRegex = /\[([^\]]+)\]\((\.\.\/[^)]*SKILL\.md)\)/g;

    let match;
    while ((match = crossRefRegex.exec(fileContent)) !== null) {
      const refPath = match[2];
      const absolutePath = path.resolve(path.dirname(filePath), refPath);

      if (!fs.existsSync(absolutePath)) {
        context.report({
          message: `Cross-reference to non-existent skill: ${refPath}`,
        });
      }
    }
  },
};
