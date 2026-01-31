/**
 * Example custom rule: enforce-frontmatter
 *
 * Enforces required frontmatter fields and validates their types.
 * Useful for maintaining consistent metadata across documentation.
 *
 * Demonstrates: extractFrontmatter, validateSemver helpers
 */

const { extractFrontmatter, validateSemver } = require('claude-code-lint/utils');

module.exports.rule = {
  meta: {
    id: 'enforce-frontmatter',
    name: 'Enforce Frontmatter',
    description: 'Require and validate frontmatter fields',
    category: 'Custom',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
  },

  validate: async (context) => {
    // Only check markdown files
    if (!context.filePath.endsWith('.md')) {
      return;
    }

    const result = extractFrontmatter(context.fileContent);

    // Require frontmatter
    if (!result.hasFrontmatter || !result.frontmatter) {
      context.report({
        message: 'File must have YAML frontmatter',
        line: 1,
        fix: 'Add frontmatter block at top of file',
      });
      return;
    }

    const fm = result.frontmatter;

    // Required fields
    const requiredFields = {
      name: 'string',
      description: 'string',
      version: 'string',
      category: 'string',
    };

    // Check each required field
    for (const [field, expectedType] of Object.entries(requiredFields)) {
      if (!(field in fm)) {
        context.report({
          message: `Missing required frontmatter field: ${field}`,
          line: 2,
          fix: `Add "${field}: value" to frontmatter`,
        });
        continue;
      }

      const actualType = typeof fm[field];
      if (actualType !== expectedType) {
        context.report({
          message: `Field "${field}" must be ${expectedType}, got ${actualType}`,
          line: 2,
        });
      }
    }

    // Validate version format if present
    if (fm.version && typeof fm.version === 'string' && !validateSemver(fm.version)) {
      context.report({
        message: `Invalid version format: ${fm.version}`,
        line: 2,
        fix: 'Use semantic versioning (e.g., 1.0.0)',
      });
    }

    // Validate category is from allowed list
    const allowedCategories = ['Documentation', 'API', 'Guide', 'Reference', 'Tutorial'];
    if (fm.category && !allowedCategories.includes(fm.category)) {
      context.report({
        message: `Invalid category: ${fm.category}. Must be one of: ${allowedCategories.join(', ')}`,
        line: 2,
      });
    }

    // Check description length
    if (fm.description && typeof fm.description === 'string') {
      if (fm.description.length < 10) {
        context.report({
          message: 'Description too short (minimum 10 characters)',
          line: 2,
        });
      }

      if (fm.description.length > 200) {
        context.report({
          message: 'Description too long (maximum 200 characters)',
          line: 2,
        });
      }
    }

    // Validate deprecated field if present
    if (fm.deprecated === true && !fm.replacedBy) {
      context.report({
        message: 'Deprecated items must specify "replacedBy" field',
        line: 2,
        fix: 'Add "replacedBy: new-item-name" to frontmatter',
      });
    }
  },
};
