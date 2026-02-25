/**
 * Rule: skill-allowed-tools
 *
 * Skill allowed-tools must be an array of tool names
 *
 * Uses thin wrapper pattern: delegates to SkillFrontmatterSchema.shape for validation
 */

import { Rule, RuleContext } from '../../types/rule';
import { SkillFrontmatterSchema } from '../../schemas/skill-frontmatter.schema';
import { extractFrontmatter, getFrontmatterFieldLine } from '../../utils/formats/markdown';

export const rule: Rule = {
  meta: {
    id: 'skill-allowed-tools',
    name: 'Skill Allowed Tools Format',
    description: 'Skill allowed-tools must be an array of tool names',
    category: 'Skills',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '0.2.0',
    docUrl: 'https://claudelint.com/rules/skills/skill-allowed-tools',
    docs: {
      recommended: true,
      summary: 'Validates that allowed-tools is a proper array of tool name strings.',
      rationale:
        'A malformed allowed-tools field is silently ignored, leaving all tools accessible.',
      details:
        'This rule validates that the `allowed-tools` frontmatter field is an array of valid tool name strings. ' +
        'Malformed values (e.g., a single string or non-string entries) will cause validation errors. ' +
        'The rule delegates to the Zod schema for format validation.',
      examples: {
        incorrect: [
          {
            description: 'allowed-tools is not an array',
            code: '---\nname: deploy\ndescription: Deploys the app\nallowed-tools: Bash\n---',
          },
        ],
        correct: [
          {
            description: 'Valid allowed-tools array',
            code: '---\nname: deploy\ndescription: Deploys the app\nallowed-tools:\n  - Bash\n  - Read\n  - Write\n---',
          },
        ],
      },
      howToFix: 'Ensure `allowed-tools` is a YAML array of tool name strings.',
      relatedRules: ['skill-allowed-tools-not-used', 'skill-mcp-tool-qualified-name'],
    },
  },
  validate: (context: RuleContext) => {
    const { frontmatter } = extractFrontmatter(context.fileContent);

    if (!frontmatter || !frontmatter['allowed-tools']) {
      return;
    }

    const allowedToolsSchema = SkillFrontmatterSchema.shape['allowed-tools'];
    const result = allowedToolsSchema.safeParse(frontmatter['allowed-tools']);

    if (!result.success) {
      const line = getFrontmatterFieldLine(context.fileContent, 'allowed-tools');
      context.report({
        message: result.error.issues[0].message,
        line,
      });
    }
  },
};
