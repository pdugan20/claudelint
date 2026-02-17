/**
 * Invalid custom rule - missing validate function
 * This should fail to load
 */

export const rule = {
  meta: {
    id: 'invalid-rule',
    name: 'Invalid Rule',
    description: 'Missing validate function',
    category: 'CLAUDE.md',
    severity: 'error',
    fixable: false,
    deprecated: false,
  },
  // Missing validate function
};
