/**
 * Rule: skill-description-missing-trigger
 *
 * Warns when skill description lacks trigger phrases.
 * Per Anthropic guide, descriptions should include "Use when" / "Use for" /
 * quoted trigger phrases so the model knows when to load the skill.
 */

import { Rule, RuleContext } from '../../types/rule';
import { extractFrontmatter, getFrontmatterFieldLine } from '../../utils/formats/markdown';

export const rule: Rule = {
  meta: {
    id: 'skill-description-missing-trigger',
    name: 'Skill Description Missing Trigger',
    description:
      'Skill description should include trigger phrases so the model knows when to load the skill',
    category: 'Skills',
    severity: 'warn',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/skills/skill-description-missing-trigger.md',
  },
  validate: (context: RuleContext) => {
    const { frontmatter } = extractFrontmatter(context.fileContent);

    if (
      !frontmatter ||
      !frontmatter['description'] ||
      typeof frontmatter['description'] !== 'string'
    ) {
      return; // No description to check (handled by skill-description rule)
    }

    const description = frontmatter['description'];

    // Check for trigger phrase patterns
    const hasUseWhen = /use\s+when\b/i.test(description);
    const hasUseFor = /use\s+(this\s+)?(skill\s+)?for\b/i.test(description);
    const hasQuotedPhrases = /["'].*["']/.test(description);
    const hasUseToOrThis = /use\s+(this|to)\b/i.test(description);

    if (!hasUseWhen && !hasUseFor && !hasQuotedPhrases && !hasUseToOrThis) {
      const line = getFrontmatterFieldLine(context.fileContent, 'description');
      context.report({
        message:
          'Skill description should include trigger phrases (e.g., "Use when...", "Use for...", or quoted trigger phrases) so the model knows when to load the skill',
        line,
        fix: 'Add trigger phrases like "Use when the user asks to..." or "Use for validating..."',
      });
    }
  },
};
