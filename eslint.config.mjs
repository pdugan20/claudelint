import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import tseslint from '@typescript-eslint/parser';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

// Scope the legacy .eslintrc.json config to only TypeScript source files
const tsConfigs = compat.extends('./.eslintrc.json').map((config) => ({
  ...config,
  files: ['src/**/*.ts'],
}));

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
    },
  },
];
