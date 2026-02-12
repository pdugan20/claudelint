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
    since: '0.2.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/skills/skill-arguments-without-hint.md',
    docs: {
      summary:
        'Warns when a skill uses $ARGUMENTS or positional parameters but lacks an argument-hint in frontmatter.',
      details:
        'The `argument-hint` frontmatter field provides placeholder text that helps users understand ' +
        'what arguments a skill expects when invoked. This rule detects when the skill body references ' +
        '`$ARGUMENTS`, `$0`, `$1`, or other positional parameters but the frontmatter does not include ' +
        'an `argument-hint`. Without the hint, users have no guidance on what input the skill expects.',
      examples: {
        incorrect: [
          {
            description: 'Body uses $ARGUMENTS but frontmatter has no argument-hint',
            code: '---\nname: greet\ndescription: Greets a user by name\n---\n\nSay hello to $ARGUMENTS.',
            language: 'markdown',
          },
        ],
        correct: [
          {
            description: 'argument-hint provided for skill that uses $ARGUMENTS',
            code: '---\nname: greet\ndescription: Greets a user by name\nargument-hint: "<user name>"\n---\n\nSay hello to $ARGUMENTS.',
            language: 'markdown',
          },
          {
            description: 'Skill without argument references needs no hint',
            code: '---\nname: status\ndescription: Shows project status\n---\n\nCheck the current project status.',
            language: 'markdown',
          },
        ],
      },
      howToFix:
        'Add `argument-hint: "<description of expected arguments>"` to the SKILL.md frontmatter. ' +
        'Use angle brackets or descriptive placeholder text so users know what to provide, ' +
        'for example: `argument-hint: "<file path> [--verbose]"`.',
      relatedRules: ['skill-description'],
    },
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
