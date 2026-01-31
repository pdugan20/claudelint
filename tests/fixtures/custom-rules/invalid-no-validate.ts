/**
 * Invalid custom rule - missing validate function
 * This should fail to load
 */

export const rule = {
  meta: {
    id: 'invalid-rule',
    name: 'Invalid Rule',
    description: 'Missing validate function',
    category: 'Custom',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
  },
  // Missing validate function
};
