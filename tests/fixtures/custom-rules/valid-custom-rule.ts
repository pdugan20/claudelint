/**
 * Example valid custom rule
 * This rule checks for forbidden keywords in file content
 */

import type { Rule } from '../../../src/types/rule';

export const rule: Rule = {
  meta: {
    id: 'no-forbidden-keywords',
    name: 'No Forbidden Keywords',
    description: 'Disallow forbidden keywords in files',
    category: 'CLAUDE.md',
    severity: 'error',
    fixable: false,
    deprecated: false,
  },

  validate: async (context) => {
    const { fileContent } = context;
    const forbiddenKeywords = ['FORBIDDEN', 'DEPRECATED_API', 'DO_NOT_USE'];

    for (const keyword of forbiddenKeywords) {
      if (fileContent.includes(keyword)) {
        const lines = fileContent.split('\n');
        const lineNumber = lines.findIndex((line) => line.includes(keyword)) + 1;

        context.report({
          message: `Found forbidden keyword: ${keyword}`,
          line: lineNumber,
          fix: `Remove or replace the ${keyword} keyword`,
        });
      }
    }
  },
};
