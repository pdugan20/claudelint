/**
 * Rule: skill-missing-version
 *
 * Warns when skill frontmatter lacks a version field. Version numbers help users
 * and Claude track skill updates and ensure compatibility.
 */

import { Rule } from '../../types/rule';
import { extractFrontmatter } from '../../utils/formats/markdown';
import { SkillFrontmatter } from '../../schemas/skill-frontmatter.schema';

/**
 * Missing version validation rule implementation
 */
export const rule: Rule = {
  meta: {
    id: 'skill-missing-version',
    name: 'Skill Missing Version',
    description: 'Skill frontmatter lacks version field',
    category: 'Skills',
    severity: 'warn',
    fixable: true,
    deprecated: false,
    since: '0.2.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/skills/skill-missing-version.md',
    docs: {
      summary: 'Warns when skill frontmatter is missing a version field.',
      rationale:
        'Without a version, users cannot track updates or ensure compatibility with their setup.',
      details:
        'Version numbers help users and Claude track skill updates and ensure compatibility. ' +
        'This rule checks that the `version` field is present in the SKILL.md frontmatter. ' +
        'Without a version, users cannot tell which iteration of a skill they are running ' +
        'or whether an update has introduced breaking changes.',
      examples: {
        incorrect: [
          {
            description: 'Frontmatter without version field',
            code: '---\nname: deploy\ndescription: Deploys the application\n---',
            language: 'yaml',
          },
        ],
        correct: [
          {
            description: 'Frontmatter with version field',
            code: '---\nname: deploy\ndescription: Deploys the application\nversion: 1.0.0\n---',
            language: 'yaml',
          },
          {
            description: 'Pre-release version',
            code: '---\nname: deploy\ndescription: Deploys the application\nversion: 0.1.0\n---',
            language: 'yaml',
          },
        ],
      },
      howToFix:
        'Add a `version` field to the frontmatter section of your SKILL.md file. ' +
        'Use semantic versioning (e.g., `version: 1.0.0`). ' +
        'Start with `0.1.0` for new skills that are not yet stable.',
      relatedRules: ['skill-missing-changelog'],
    },
  },

  validate: (context) => {
    const { filePath, fileContent } = context;

    // Only check SKILL.md files
    if (!filePath.endsWith('SKILL.md')) {
      return;
    }

    // Check for version field in frontmatter
    const { frontmatter } = extractFrontmatter<SkillFrontmatter>(fileContent);

    if (frontmatter && !frontmatter.version) {
      context.report({
        message: 'Skill frontmatter lacks "version" field',
        fix: 'Add "version: 1.0.0" to the SKILL.md frontmatter',
      });
    }
  },
};
