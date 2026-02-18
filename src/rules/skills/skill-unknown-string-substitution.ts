/**
 * Rule: skill-unknown-string-substitution
 *
 * Validates that string substitutions use valid patterns
 *
 * Skills can use string substitutions like $ARGUMENTS, $0-$9, or ${VARIABLE}.
 * This rule warns about unknown substitution patterns that may not work correctly.
 */

import { Rule, RuleContext } from '../../types/rule';
import { stripCodeBlocks } from '../../utils/formats/markdown';

export const rule: Rule = {
  meta: {
    id: 'skill-unknown-string-substitution',
    name: 'Skill Unknown String Substitution',
    description: 'Unknown string substitution pattern detected',
    category: 'Skills',
    severity: 'warn',
    fixable: false,
    deprecated: false,
    since: '0.2.0',
    docUrl: 'https://claudelint.com/rules/skills/skill-unknown-string-substitution',
    docs: {
      strict: true,
      summary: 'Warns when SKILL.md contains unrecognized string substitution patterns.',
      rationale:
        'Unrecognized substitutions are passed through literally, producing broken commands at runtime.',
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
    const contentWithoutCodeBlocks = stripCodeBlocks(fileContent);

    // P3-1: Two-pass approach to avoid matching partial tokens inside ${...}
    // First strip ${...} braced substitutions (these are always valid)
    const withoutBraced = contentWithoutCodeBlocks.replace(/\$\{[^}]*\}/g, '');

    // Then find bare $UPPERCASE tokens
    const bareVarRegex = /\$[A-Z_]+\b/g;
    const validSubstitutions = ['$ARGUMENTS'];

    for (const match of withoutBraced.matchAll(bareVarRegex)) {
      const substitution = match[0];
      // Allow $ARGUMENTS and $0-$9 patterns
      if (!validSubstitutions.includes(substitution) && !/^\$\d+$/.test(substitution)) {
        context.report({
          message: `Unknown string substitution: ${substitution}`,
        });
      }
    }
  },
};
