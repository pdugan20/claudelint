// ESLint config for YAML files in Claude Code projects
module.exports = {
  overrides: [
    {
      files: ['*.yaml', '*.yml'],
      parser: 'yaml-eslint-parser',
      plugins: ['yml'],
      rules: {
        // Prevent duplicate keys
        'yml/no-duplicate-keys': 'error',

        // Sort keys alphabetically (warning - optional)
        'yml/sort-keys': ['warn', 'asc', {
          caseSensitive: true,
          natural: true
        }],

        // No empty mapping values
        'yml/no-empty-mapping-value': 'error',

        // Consistent indentation
        'yml/indent': ['error', 2],

        // Block mapping style
        'yml/block-mapping': 'error',

        // Quote style
        'yml/quotes': ['error', {
          prefer: 'single',
          avoidEscape: true
        }],

        // Spacing
        'yml/block-mapping-colon-indicator-newline': 'error',
        'yml/block-sequence-hyphen-indicator-newline': 'error',

        // Flow style (arrays, objects on one line)
        'yml/flow-mapping-curly-spacing': ['error', 'always'],
        'yml/flow-sequence-bracket-spacing': ['error', 'never']
      }
    }
  ]
};
