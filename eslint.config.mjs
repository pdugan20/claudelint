import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import tseslint from '@typescript-eslint/parser';
import tsdocPlugin from 'eslint-plugin-tsdoc';
import jsdocPlugin from 'eslint-plugin-jsdoc';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

// Scope the legacy .eslintrc.json config to only TypeScript source files
// Only add files to base configs; preserve files from overrides so they keep their scoping
const tsConfigs = compat.extends('./.eslintrc.json').map((config) => {
  if (config.files) return config;
  return { ...config, files: ['src/**/*.ts'] };
});

export default [
  // TypeScript config scoped to src/
  ...tsConfigs,

  // Vue component linting for VitePress theme
  ...pluginVue.configs['flat/recommended'].map((config) => ({
    ...config,
    files: ['website/.vitepress/**/*.vue'],
  })),
  {
    files: ['website/.vitepress/**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint,
      },
    },
    rules: {
      // Relax rules that conflict with VitePress patterns
      'vue/multi-word-component-names': 'off',
      'vue/no-v-html': 'warn',
      // Disable formatting rules that conflict with prettier
      'vue/singleline-html-element-content-newline': 'off',
      'vue/max-attributes-per-line': 'off',
      'vue/html-closing-bracket-newline': 'off',
      'vue/html-indent': 'off',
      'vue/html-self-closing': 'off',
    },
  },

  // TSDoc syntax validation on public API files
  {
    files: ['src/api/**/*.ts', 'src/index.ts'],
    plugins: { tsdoc: tsdocPlugin },
    rules: {
      'tsdoc/syntax': 'error',
    },
  },

  // JSDoc completeness: require doc comments on public exports
  {
    files: ['src/api/**/*.ts', 'src/index.ts'],
    plugins: { jsdoc: jsdocPlugin },
    rules: {
      'jsdoc/require-jsdoc': [
        'error',
        {
          publicOnly: true,
          require: {
            ClassDeclaration: true,
            FunctionDeclaration: true,
            MethodDefinition: true,
          },
        },
      ],
    },
  },
];
