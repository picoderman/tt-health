import prettierPlugin from 'eslint-plugin-prettier';

export const prettierConfig = {
  plugins: {
    prettier: prettierPlugin,
  },
  rules: {
    'prettier/prettier': 'error',
  },
};
