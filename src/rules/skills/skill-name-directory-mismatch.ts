/**
 * Rule: skill-name-directory-mismatch
 *
 * Validates that skill name in frontmatter matches parent directory name
 *
 * The skill name must match the directory name for proper organization and discovery.
 * This ensures consistency between file structure and skill configuration.
 */

import { Rule, RuleContext } from '../../types/rule';
import { extractFrontmatter } from '../../utils/formats/markdown';
import { getParentDirectoryName } from '../../utils/filesystem/paths';
import { isString } from '../../utils/type-guards';

export const rule: Rule = {
  meta: {
    id: 'skill-name-directory-mismatch',
    name: 'Skill Name Directory Mismatch',
    description: 'Skill name must match parent directory name',
    category: 'Skills',
    severity: 'error',
    fixable: true,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/skills/skill-name-directory-mismatch.md',
  },
  validate: (context: RuleContext) => {
    const { filePath, fileContent } = context;

    // Only validate SKILL.md files
    if (!filePath.endsWith('SKILL.md')) {
      return;
    }

    const { frontmatter } = extractFrontmatter(fileContent);

    if (!frontmatter || !frontmatter.name || !isString(frontmatter.name)) {
      return; // Missing name handled by skill-name rule
    }

    const dirName = getParentDirectoryName(filePath);

    if (frontmatter.name !== dirName) {
      const oldName = frontmatter.name;
      context.report({
        message: `Skill name "${oldName}" does not match directory name "${dirName}"`,
        fix: `Change name from "${oldName}" to "${dirName}"`,
        autoFix: {
          ruleId: 'skill-name-directory-mismatch',
          description: `Update skill name to "${dirName}"`,
          filePath,
          apply: (content) => content.replace(`name: ${oldName}`, `name: ${dirName}`),
        },
      });
    }
  },
};
