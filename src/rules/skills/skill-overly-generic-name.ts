/**
 * Rule: skill-overly-generic-name
 *
 * Flags skill names that are too generic to describe functionality.
 * Based on Anthropic Skills Guide p11: "Avoid generic names"
 */

import { Rule, RuleContext } from '../../types/rule';
import { extractFrontmatter, getFrontmatterFieldLine } from '../../utils/formats/markdown';

export const rule: Rule = {
  meta: {
    id: 'skill-overly-generic-name',
    name: 'Skill Overly Generic Name',
    description:
      'Skill name should be specific and descriptive, not just generic keywords or single-word verbs',
    category: 'Skills',
    severity: 'warn',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/skills/skill-overly-generic-name.md',
  },
  validate: (context: RuleContext) => {
    // Extract frontmatter
    const { frontmatter } = extractFrontmatter(context.fileContent);

    if (!frontmatter || !frontmatter.name) {
      return; // Field not present - let other rules handle missing fields
    }

    const name = frontmatter.name as string;
    const nameParts = name.split('-');

    // Generic keywords that should not be used alone
    const genericKeywords = [
      'helper',
      'util',
      'utils',
      'tool',
      'tools',
      'script',
      'scripts',
      'manager',
      'handler',
      'processor',
      'service',
      'common',
      'shared',
      'main',
      'core',
      'base',
    ];

    // Single-word verbs that need specificity
    const genericVerbs = [
      'format',
      'validate',
      'test',
      'build',
      'deploy',
      'run',
      'execute',
      'process',
      'handle',
      'manage',
      'create',
      'update',
      'delete',
      'check',
      'analyze',
      'generate',
      'convert',
      'transform',
    ];

    // Check if name is only a single generic verb
    if (nameParts.length === 1 && genericVerbs.includes(nameParts[0].toLowerCase())) {
      const line = getFrontmatterFieldLine(context.fileContent, 'name');
      context.report({
        message: `Skill name "${name}" is too generic (single-word verb). Use descriptive names like "${name}-files" or "${name}-config" that indicate what is being ${name}ed.`,
        line,
      });
      return;
    }

    // Check if name is ONLY generic keywords (no descriptive parts)
    const isOnlyGeneric = nameParts.every((part) =>
      genericKeywords.includes(part.toLowerCase())
    );

    if (isOnlyGeneric) {
      const line = getFrontmatterFieldLine(context.fileContent, 'name');
      context.report({
        message: `Skill name "${name}" is too generic. Use descriptive names that indicate specific functionality (e.g., "project-utils" instead of "utils").`,
        line,
      });
    }
  },
};
