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
    docUrl: 'https://claudelint.com/rules/skills/skill-cross-reference-invalid',
    docs: {
      recommended: true,
      summary: 'Validates that cross-references between skills point to SKILL.md files that exist.',
      rationale:
        'Broken cross-references lead to dead links and confuse users trying to navigate between skills.',
      details:
        'Skills can link to other skills using relative markdown links (e.g., `[Other Skill](../other/SKILL.md)`). ' +
        'This rule checks that each cross-reference target actually exists on disk. Broken cross-references ' +
        'mislead users and the AI model, leading to confusion when referenced skills cannot be found. ' +
        'The rule matches markdown link syntax with relative paths ending in `SKILL.md`.',
      examples: {
        incorrect: [
          {
            description: 'Link to a skill that does not exist',
            code: '---\nname: deploy\ndescription: Deploys the application\n---\n\n## See Also\n\n- [Build Skill](../build/SKILL.md)',
            language: 'markdown',
          },
        ],
        correct: [
          {
            description: 'Link to a skill that exists on disk',
            code: '---\nname: deploy\ndescription: Deploys the application\n---\n\n## See Also\n\n- [Test Skill](../test/SKILL.md)',
            language: 'markdown',
          },
        ],
      },
      howToFix:
        'Verify the relative path in the markdown link points to an existing SKILL.md file. ' +
        'Fix any typos in the path or remove the link if the referenced skill was deleted.',
      relatedRules: ['skill-dependencies'],
    },
  },

  validate: (context: RuleContext) => {
    const { filePath, fileContent } = context;

    // Only validate SKILL.md files
    if (!filePath.endsWith('SKILL.md')) {
      return;
    }

    // Match markdown links that reference other SKILL.md files via relative paths
    const crossRefRegex = /\[([^\]]+)\]\((\.\.\/[^)]*SKILL\.md)\)/g;

    for (const match of fileContent.matchAll(crossRefRegex)) {
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
