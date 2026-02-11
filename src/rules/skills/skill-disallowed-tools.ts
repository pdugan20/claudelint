/**
 * Rule: skill-disallowed-tools
 *
 * Skill disallowed-tools must be an array of tool names
 *
 * Uses thin wrapper pattern: delegates to SkillFrontmatterSchema.shape for validation
 */

import { Rule, RuleContext } from '../../types/rule';
import { SkillFrontmatterSchema } from '../../schemas/skill-frontmatter.schema';
import { extractFrontmatter, getFrontmatterFieldLine } from '../../utils/formats/markdown';

export const rule: Rule = {
  meta: {
    id: 'skill-disallowed-tools',
    name: 'Skill Disallowed Tools Format',
    description: 'Skill disallowed-tools must be an array of tool names',
    category: 'Skills',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/skills/skill-disallowed-tools.md',
    docs: {
      recommended: true,
      summary:
        'Validates that the disallowed-tools field in SKILL.md frontmatter is a proper array of tool names.',
      details:
        'The `disallowed-tools` field specifies tools that the skill must not use during execution. ' +
        'It must be a YAML array of valid tool name strings. Malformed values (e.g., a single string or ' +
        'non-string entries) will cause validation errors. This rule delegates to the Zod schema for validation. ' +
        'Note that `disallowed-tools` and `allowed-tools` are mutually exclusive; ' +
        'that constraint is enforced by the skill-allowed-tools rule.',
      examples: {
        incorrect: [
          {
            description: 'disallowed-tools as a single string instead of an array',
            code: '---\nname: read-only\ndescription: Read-only analysis skill\ndisallowed-tools: Write\n---',
          },
        ],
        correct: [
          {
            description: 'Valid disallowed-tools array',
            code: '---\nname: read-only\ndescription: Read-only analysis skill\ndisallowed-tools:\n  - Write\n  - Bash\n---',
          },
          {
            description: 'No disallowed-tools field (optional)',
            code: '---\nname: deploy\ndescription: Deploys the application\n---',
          },
        ],
      },
      howToFix:
        'Ensure the `disallowed-tools` field is a YAML array where each entry is a string tool name. ' +
        'Remove the field entirely if no tools need to be denied.',
      relatedRules: ['skill-allowed-tools', 'skill-mcp-tool-qualified-name'],
    },
  },
  validate: (context: RuleContext) => {
    const { frontmatter } = extractFrontmatter(context.fileContent);

    if (!frontmatter || !frontmatter['disallowed-tools']) {
      return;
    }

    const disallowedToolsSchema = SkillFrontmatterSchema.shape['disallowed-tools'];
    const result = disallowedToolsSchema.safeParse(frontmatter['disallowed-tools']);

    if (!result.success) {
      const line = getFrontmatterFieldLine(context.fileContent, 'disallowed-tools');
      context.report({
        message: result.error.issues[0].message,
        line,
      });
    }
  },
};
