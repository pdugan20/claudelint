/**
 * Rule: skill-version
 *
 * Skill version must follow semantic versioning format (e.g., 1.0.0)
 *
 * Uses thin wrapper pattern: delegates to SkillFrontmatterSchema.shape.version for validation
 */

import { Rule, RuleContext } from '../../types/rule';
import { SkillFrontmatterSchema } from '../../schemas/skill-frontmatter.schema';
import { extractFrontmatter, getFrontmatterFieldLine } from '../../utils/formats/markdown';

export const rule: Rule = {
  meta: {
    id: 'skill-version',
    name: 'Skill Version Format',
    description: 'Skill version must follow semantic versioning format (e.g., 1.0.0)',
    category: 'Skills',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl: 'https://github.com/pdugan20/claudelint/blob/main/docs/rules/skills/skill-version.md',
  },
  validate: (context: RuleContext) => {
    // Extract frontmatter
    const { frontmatter } = extractFrontmatter(context.fileContent);

    if (!frontmatter || !frontmatter.version) {
      return; // Field not present or optional - version is optional
    }

    // Delegate to Zod schema validator for 'version' field
    const versionSchema = SkillFrontmatterSchema.shape.version;
    const result = versionSchema.safeParse(frontmatter.version);

    if (!result.success) {
      // Report first error with proper context
      const line = getFrontmatterFieldLine(context.fileContent, 'version');
      context.report({
        message: result.error.issues[0].message,
        line,
      });
    }
  },
};
