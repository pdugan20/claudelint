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
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/skills/skill-unknown-string-substitution.md',
    docs: {
      summary: 'Warns when SKILL.md contains unrecognized string substitution patterns.',
      details:
        'Skills support a limited set of string substitution variables: `$ARGUMENTS`, positional ' +
        'parameters `$0` through `$9`, and `${VARIABLE}` syntax. Other `$UPPERCASE` patterns outside ' +
        'of code blocks may indicate typos or unsupported substitutions that will not be replaced at ' +
        'runtime. This rule strips fenced code blocks and inline code to avoid false positives on ' +
        'shell variables in examples, then scans for `$UPPERCASE_WORDS` patterns that are not in the ' +
        'allowed list.',
      examples: {
        incorrect: [
          {
            description: 'Unknown substitution variable in body text',
            code:
              '---\nname: deploy-app\ndescription: Deploys the application\n---\n\n' +
              'Deploy to $ENVIRONMENT using the configured pipeline.',
            language: 'markdown',
          },
        ],
        correct: [
          {
            description: 'Using the supported $ARGUMENTS substitution',
            code:
              '---\nname: deploy-app\ndescription: Deploys the application\n---\n\n' +
              'Deploy using: ./deploy.sh $ARGUMENTS',
            language: 'markdown',
          },
          {
            description: 'Shell variables inside code blocks are not flagged',
            code:
              '---\nname: deploy-app\ndescription: Deploys the application\n---\n\n' +
              '```bash\nexport ENVIRONMENT="staging"\n```',
            language: 'markdown',
          },
        ],
      },
      howToFix:
        'Use only supported substitution patterns: `$ARGUMENTS` for the full argument string, ' +
        '`$0`-`$9` for positional parameters, or `${VARIABLE}` for named variables. ' +
        'If the variable is part of a shell example, wrap it in a fenced code block.',
      relatedRules: ['skill-arguments-without-hint'],
    },
  },
  validate: (context: RuleContext) => {
    const { filePath, fileContent } = context;

    // Only validate SKILL.md files
    if (!filePath.endsWith('SKILL.md')) {
      return;
    }

    // Strip fenced code blocks and inline code to avoid false positives on shell variables in examples
    const contentWithoutCodeBlocks = fileContent
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`[^`]+`/g, '');

    // Valid substitutions: $ARGUMENTS, $0, $1, etc., ${CLAUDE_SESSION_ID}
    // Pattern matches $UPPERCASE_WORDS that are NOT followed by {
    const invalidSubstitutionRegex = /\$[A-Z_]+(?!\{)/g;
    const validSubstitutions = ['$ARGUMENTS'];

    let match;
    while ((match = invalidSubstitutionRegex.exec(contentWithoutCodeBlocks)) !== null) {
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
