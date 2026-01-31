/**
 * Example Custom Rule: No Hardcoded Tokens
 *
 * This rule detects potential hardcoded API tokens, keys, or secrets
 * in Claude Code configuration files.
 *
 * Usage:
 * 1. Copy this file to .claude-code-lint/rules/ in your project
 * 2. Customize the patterns array to match your security requirements
 * 3. Run claude-code-lint check-all to validate your files
 */

module.exports.rule = {
  meta: {
    id: 'no-hardcoded-tokens',
    name: 'No Hardcoded Tokens',
    description: 'Prevent hardcoded API tokens and secrets in configuration files',
    category: 'Security',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
  },

  validate: async (context) => {
    // Only check specific file types
    const configFiles = ['.env', 'config.json', 'settings.json', '.claudelintrc.json'];
    const isConfigFile = configFiles.some((file) => context.filePath.endsWith(file));

    if (!isConfigFile && !context.filePath.endsWith('.md')) {
      return; // Skip non-config, non-documentation files
    }

    // Patterns that might indicate hardcoded secrets
    const dangerousPatterns = [
      {
        pattern: /api[_-]?key\s*[:=]\s*["']?[a-zA-Z0-9]{20,}["']?/gi,
        name: 'API Key',
      },
      {
        pattern: /secret[_-]?key\s*[:=]\s*["']?[a-zA-Z0-9]{20,}["']?/gi,
        name: 'Secret Key',
      },
      {
        pattern: /password\s*[:=]\s*["']?[^"\s]{8,}["']?/gi,
        name: 'Password',
      },
      {
        pattern: /token\s*[:=]\s*["']?[a-zA-Z0-9_-]{20,}["']?/gi,
        name: 'Token',
      },
      {
        pattern: /sk-[a-zA-Z0-9]{48}/g,
        name: 'Anthropic API Key',
      },
    ];

    // Split content into lines for better error reporting
    const lines = context.fileContent.split('\n');

    lines.forEach((line, index) => {
      // Skip comments and documentation
      if (line.trim().startsWith('//') || line.trim().startsWith('#')) {
        return;
      }

      // Check each pattern
      dangerousPatterns.forEach((item) => {
        const matches = line.matchAll(item.pattern);

        for (const match of matches) {
          // Skip if it's clearly a placeholder
          const value = match[0];
          const placeholders = [
            'your-api-key',
            'YOUR_API_KEY',
            'xxx',
            '***',
            'example',
            'EXAMPLE',
            'placeholder',
          ];

          const isPlaceholder = placeholders.some((ph) =>
            value.toLowerCase().includes(ph.toLowerCase())
          );

          if (!isPlaceholder) {
            context.report({
              message: `Potential hardcoded ${item.name} detected. Use environment variables instead.`,
              line: index + 1,
              severity: 'error',
            });
          }
        }
      });
    });
  },
};
