import tseslint from 'typescript-eslint';

const TS_FILES = ['**/*.{ts,mts,cts,tsx}'];
const JS_FILES = ['**/*.{js,mjs,cjs,jsx}'];
const CODE_FILES = ['**/*.{js,mjs,cjs,jsx,ts,mts,cts,tsx}'];

export const typescriptConfig = [
  ...tseslint.configs.strictTypeChecked,
  {
    files: TS_FILES,
    languageOptions: {
      parserOptions: {
        project: true,
        projectService: true,
      },
    },
  },
  {
    files: JS_FILES,
    ...tseslint.configs.disableTypeChecked,
  },
  {
    files: CODE_FILES,
    rules: {
      'func-style': ['error', 'expression', { allowArrowFunctions: true }],
    },
  },
];
