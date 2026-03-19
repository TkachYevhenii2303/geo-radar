import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig([
  ...tseslint.configs.recommended,
  globalIgnores([
    'dist/**',
    'node_modules/**',
    'coverage/**',
  ]),
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: __dirname,   // вказуємо на apps/api/
        project: './tsconfig.json',
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
]);
