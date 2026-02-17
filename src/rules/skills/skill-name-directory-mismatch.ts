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
    since: '0.2.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/skills/skill-name-directory-mismatch.md',
    docs: {
      recommended: true,
      summary: 'Enforces that the skill `name` in frontmatter matches its parent directory name.',
      rationale:
        'A name/directory mismatch causes confusion and may break skill discovery and cross-referencing.',
      details:
        'The skill name declared in SKILL.md frontmatter must match the directory the skill lives in. ' +
        'A mismatch between the two causes confusion when browsing skills on disk versus invoking them ' +
        'by name. This rule compares the `name` field against the parent directory name and reports ' +
        'an error if they differ. The rule provides an auto-fix that updates the frontmatter name ' +
        'to match the directory.',
      examples: {
        incorrect: [
          {
            description: 'Name does not match directory (directory is "deploy-app")',
            code: '---\nname: deploy-application\ndescription: Deploys the application\n---',
          },
          {
            description: 'Name uses different casing than directory "my-tool"',
            code: '---\nname: my-Tool\ndescription: Runs the tool\n---',
          },
        ],
        correct: [
          {
            description: 'Name matches directory "deploy-app"',
            code: '---\nname: deploy-app\ndescription: Deploys the application\n---',
          },
        ],
      },
      howToFix:
        'Update the `name` field in SKILL.md frontmatter to exactly match the parent directory name, ' +
        'or rename the directory to match the desired skill name. The auto-fixer updates the frontmatter name.',
      relatedRules: ['skill-name', 'skill-overly-generic-name'],
    },
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
        autoFix: (() => {
          const needle = `name: ${oldName}`;
          const idx = fileContent.indexOf(needle);
          return {
            ruleId: 'skill-name-directory-mismatch' as const,
            description: `Update skill name to "${dirName}"`,
            filePath,
            range: [idx, idx + needle.length] as [number, number],
            text: `name: ${dirName}`,
          };
        })(),
      });
    }
  },
};
