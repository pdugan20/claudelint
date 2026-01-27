// ESLint configuration for Claude Code projects
// This shows Tier 2 (Recommended) advanced JSON/YAML linting

export default [
  // Your existing project ESLint config would go here
  // {
  //   files: ["**/*.js"],
  //   rules: { ... }
  // },

  // Claude-specific JSON linting
  {
    files: [".claude/**/*.json", ".mcp.json", ".claude-plugin/**/*.json"],
    languageOptions: {
      parser: require("jsonc-eslint-parser")
    },
    plugins: {
      jsonc: require("eslint-plugin-jsonc")
    },
    rules: {
      "jsonc/key-name-casing": "error",
      "jsonc/no-duplicate-keys": "error",
      "jsonc/sort-keys": "warn",
      "jsonc/no-trailing-comma": "error"
    }
  },

  // Claude-specific YAML linting
  {
    files: [".claude/**/*.{yaml,yml}"],
    languageOptions: {
      parser: require("yaml-eslint-parser")
    },
    plugins: {
      yml: require("eslint-plugin-yml")
    },
    rules: {
      "yml/no-duplicate-keys": "error",
      "yml/sort-keys": "warn",
      "yml/no-empty-mapping-value": "error"
    }
  }
];
