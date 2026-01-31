/**
 * Invalid custom rule - missing meta object
 * This should fail to load
 */

export const rule = {
  validate: async (context) => {
    // This rule is missing the meta object
    console.log('This rule is invalid');
  },
};
