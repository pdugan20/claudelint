/**
 * Example custom rule: require-version
 *
 * Requires markdown files to have a version field in frontmatter
 * and validates it follows semantic versioning format.
 *
 * Demonstrates: extractFrontmatter, validateSemver, hasHeading helpers
 */

const { extractFrontmatter, validateSemver, hasHeading } = require('claude-code-lint/utils');

module.exports.rule = {
  meta: {
    id: 'require-version',
    name: 'Require Version',
    description: 'Files must have valid semantic version in frontmatter',
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

    // Extract frontmatter
    const result = extractFrontmatter(context.fileContent);

    if (!result.hasFrontmatter || !result.frontmatter) {
      context.report({
        message: 'File must have YAML frontmatter with version field',
        line: 1,
        fix: 'Add frontmatter: ---\\nversion: 1.0.0\\n---',
      });
      return;
    }

    const fm = result.frontmatter;

    // Check version field exists
    if (!fm.version) {
      context.report({
        message: 'Frontmatter must include version field',
        line: 2,
        fix: 'Add "version: 1.0.0" to frontmatter',
      });
      return;
    }

    // Validate semver format
    if (typeof fm.version === 'string' && !validateSemver(fm.version)) {
      context.report({
        message: `Invalid semantic version: ${fm.version}`,
        line: 2,
        fix: 'Use format: major.minor.patch (e.g., 1.0.0, 2.1.3-beta)',
      });
    }

    // If versioned, require changelog section
    if (fm.version && !hasHeading(context.fileContent, 'Changelog', 2)) {
      context.report({
        message: 'Versioned files must have ## Changelog section',
        fix: 'Add ## Changelog section documenting version history',
      });
    }
  },
};
