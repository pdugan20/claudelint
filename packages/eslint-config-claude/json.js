// ESLint config for JSON files in Claude Code projects
module.exports = {
  overrides: [
    {
      files: ['*.json', '*.jsonc'],
      parser: 'jsonc-eslint-parser',
      plugins: ['jsonc'],
      rules: {
        // Enforce consistent key naming
        'jsonc/key-name-casing': ['error', {
          camelCase: true,
          PascalCase: false,
          SCREAMING_SNAKE_CASE: false,
          'kebab-case': true
        }],

        // Prevent duplicate keys
        'jsonc/no-duplicate-keys': 'error',

        // Sort keys alphabetically (warning - optional)
        'jsonc/sort-keys': ['warn', 'asc', {
          caseSensitive: true,
          natural: true
        }],

        // No trailing commas in JSON
        'jsonc/no-trailing-comma': 'error',

        // Consistent quote style
        'jsonc/quote-props': ['error', 'always'],
        'jsonc/quotes': ['error', 'double'],

        // Indentation
        'jsonc/indent': ['error', 2],

        // Spacing
        'jsonc/object-curly-spacing': ['error', 'always'],
        'jsonc/array-bracket-spacing': ['error', 'never'],
        'jsonc/comma-spacing': ['error', { before: false, after: true }],

        // No comments in pure JSON (allow in JSONC)
        'jsonc/no-comments': 'off'
      }
    }
  ]
};
