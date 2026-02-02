import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

// Use the existing .eslintrc.json config via compatibility layer
// This allows ESLint 9 to use the old config format
export default [
  ...compat.extends('./.eslintrc.json'),
];
