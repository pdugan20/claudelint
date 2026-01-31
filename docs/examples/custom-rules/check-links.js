/**
 * Example custom rule: check-links
 *
 * Validates that local file links in markdown actually exist.
 * Helps catch broken documentation links before they're published.
 *
 * Demonstrates: fileExists, findLinesMatching helpers
 */

const { fileExists, findLinesMatching } = require('claude-code-lint/utils');
const { join, dirname } = require('path');

module.exports.rule = {
  meta: {
    id: 'check-links',
    name: 'Check Local Links',
    description: 'Verify local file links exist',
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

    // Find all markdown links: [text](path)
    const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
    const matches = findLinesMatching(context.fileContent, linkPattern);

    const fileDir = dirname(context.filePath);

    for (const match of matches) {
      // Extract the URL from the match
      const linkMatch = match.text.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (!linkMatch) continue;

      const url = linkMatch[2];

      // Skip external URLs and anchors
      if (url.startsWith('http://') ||
          url.startsWith('https://') ||
          url.startsWith('#') ||
          url.startsWith('mailto:')) {
        continue;
      }

      // Remove anchor from path
      const [filePath] = url.split('#');
      if (!filePath) continue;

      // Resolve relative path
      const absolutePath = join(fileDir, filePath);

      // Check if file exists (async)
      if (!(await fileExists(absolutePath))) {
        context.report({
          message: `Broken link: ${url} does not exist`,
          line: match.line,
          fix: 'Update or remove the broken link',
        });
      }
    }
  },
};
