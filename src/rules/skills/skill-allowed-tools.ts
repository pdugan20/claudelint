/**
 * Rule: skill-allowed-tools
 *
 * Skill allowed-tools must be an array of tool names, cannot be used with disallowed-tools
 *
 * Uses thin wrapper pattern: delegates to SkillFrontmatterWithRefinements for cross-field validation
 */

import { Rule, RuleContext } from '../../types/rule';
import {
  SkillFrontmatterSchema,
  SkillFrontmatterWithRefinements,
} from '../../schemas/skill-frontmatter.schema';
import { extractFrontmatter, getFrontmatterFieldLine } from '../../utils/formats/markdown';

export const rule: Rule = {
  meta: {
    id: 'skill-allowed-tools',
    name: 'Skill Allowed Tools Format',
    description:
      'Skill allowed-tools must be an array of tool names, cannot be used with disallowed-tools',
    category: 'Skills',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/skills/skill-allowed-tools.md',
    docs: {
      recommended: true,
      summary:
        'Validates that allowed-tools is a proper array and is not used alongside disallowed-tools.',
      details:
        'This rule enforces two constraints on the `allowed-tools` frontmatter field. ' +
        'First, it must be an array of valid tool name strings. ' +
        'Second, `allowed-tools` and `disallowed-tools` are mutually exclusive -- ' +
        'specifying both creates an ambiguous permission model. ' +
        'The rule delegates to the Zod schema for format validation and uses cross-field refinements ' +
        'to check mutual exclusivity.',
      examples: {
        incorrect: [
          {
            description: 'allowed-tools is not an array',
            code: '---\nname: deploy\ndescription: Deploys the app\nallowed-tools: Bash\n---',
          },
          {
            description: 'Both allowed-tools and disallowed-tools specified',
            code: '---\nname: deploy\ndescription: Deploys the app\nallowed-tools:\n  - Bash\n  - Read\ndisallowed-tools:\n  - WebFetch\n---',
          },
        ],
        correct: [
          {
            description: 'Valid allowed-tools array',
            code: '---\nname: deploy\ndescription: Deploys the app\nallowed-tools:\n  - Bash\n  - Read\n  - Write\n---',
          },
          {
            description: 'Using only disallowed-tools (no conflict)',
            code: '---\nname: deploy\ndescription: Deploys the app\ndisallowed-tools:\n  - WebFetch\n---',
          },
        ],
      },
      howToFix:
        'Ensure `allowed-tools` is a YAML array of tool name strings. ' +
        'If you also have `disallowed-tools`, remove one of the two fields. ' +
        'Use `allowed-tools` for an allowlist approach or `disallowed-tools` for a denylist approach, but not both.',
      relatedRules: [
        'skill-disallowed-tools',
        'skill-allowed-tools-not-used',
        'skill-mcp-tool-qualified-name',
      ],
    },
  },
  validate: (context: RuleContext) => {
    const { frontmatter } = extractFrontmatter(context.fileContent);

    if (!frontmatter || !frontmatter['allowed-tools']) {
      return;
    }

    // First validate the array itself
    const allowedToolsSchema = SkillFrontmatterSchema.shape['allowed-tools'];
    const result = allowedToolsSchema.safeParse(frontmatter['allowed-tools']);

    if (!result.success) {
      const line = getFrontmatterFieldLine(context.fileContent, 'allowed-tools');
      context.report({
        message: result.error.issues[0].message,
        line,
      });
      return;
    }

    // Then check cross-field validation (mutual exclusivity with disallowed-tools)
    const crossFieldResult = SkillFrontmatterWithRefinements.safeParse(frontmatter);

    if (!crossFieldResult.success) {
      const allowedToolsError = crossFieldResult.error.issues.find((issue) =>
        issue.path.includes('allowed-tools')
      );

      if (allowedToolsError) {
        const line = getFrontmatterFieldLine(context.fileContent, 'allowed-tools');
        context.report({
          message: allowedToolsError.message,
          line,
        });
      }
    }
  },
};
