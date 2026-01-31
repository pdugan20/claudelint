/**
 * Rule: skill-unknown-string-substitution
 *
 * Validates that string substitutions use valid patterns
 *
 * Skills can use string substitutions like $ARGUMENTS, $0-$9, or ${VARIABLE}.
 * This rule warns about unknown substitution patterns that may not work correctly.
 */

import { Rule, RuleContext } from '../../types/rule';

export const rule: Rule = {
  meta: {
    id: 'skill-unknown-string-substitution',
    name: 'Skill Unknown String Substitution',
    description: 'Unknown string substitution pattern detected',
    category: 'Skills',
    severity: 'warn',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claude-code-lint/blob/main/docs/rules/skills/skill-unknown-string-substitution.md',
  },
  validate: (context: RuleContext) => {
    const { filePath, fileContent } = context;

    // Only validate SKILL.md files
    if (!filePath.endsWith('SKILL.md')) {
      return;
    }

    // Valid substitutions: $ARGUMENTS, $0, $1, etc., ${CLAUDE_SESSION_ID}
    // Pattern matches $UPPERCASE_WORDS that are NOT followed by {
    const invalidSubstitutionRegex = /\$[A-Z_]+(?!\{)/g;
    const validSubstitutions = ['$ARGUMENTS'];

    let match;
    while ((match = invalidSubstitutionRegex.exec(fileContent)) !== null) {
      const substitution = match[0];
      // Allow $ARGUMENTS and $0-$9 patterns
      if (!validSubstitutions.includes(substitution) && !/^\$\d+$/.test(substitution)) {
        context.report({
          message:
            `Unknown string substitution: ${substitution}. ` +
            `Valid substitutions: $ARGUMENTS, $0-$9, \${VARIABLE}`,
        });
      }
    }
  },
};
