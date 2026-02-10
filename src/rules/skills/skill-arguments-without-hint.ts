/**
 * Rule: skill-arguments-without-hint
 *
 * Warns when SKILL.md body contains $ARGUMENTS/$0/$1 but frontmatter lacks argument-hint.
 * The argument-hint field provides placeholder text that helps users understand
 * what arguments the skill expects.
 */

import { Rule, RuleContext } from '../../types/rule';
import {
  extractFrontmatter,
  extractBodyContent,
  getFrontmatterFieldLine,
} from '../../utils/formats/markdown';

export const rule: Rule = {
  meta: {
    id: 'skill-arguments-without-hint',
    name: 'Skill Arguments Without Hint',
    description:
      'Skills using $ARGUMENTS or positional parameters should include an argument-hint in frontmatter',
    category: 'Skills',
    severity: 'warn',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/skills/skill-arguments-without-hint.md',
  },
  validate: (context: RuleContext) => {
    const { frontmatter } = extractFrontmatter(context.fileContent);
    const body = extractBodyContent(context.fileContent);

    if (!frontmatter || !body) {
      return;
    }

    // Check if body references argument variables
    const hasArguments = /\$ARGUMENTS|\$\d+/.test(body);

    if (!hasArguments) {
      return;
    }

    // Check if argument-hint is defined in frontmatter
    if (!frontmatter['argument-hint']) {
      const line = getFrontmatterFieldLine(context.fileContent, 'name') || 2;
      context.report({
        message:
          'Skill uses $ARGUMENTS or positional parameters but is missing argument-hint in frontmatter',
        line,
        fix: 'Add argument-hint: "<description of expected arguments>" to frontmatter',
      });
    }
  },
};
