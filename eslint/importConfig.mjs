import importPlugin from 'eslint-plugin-import';

export const importConfig = {
  plugins: {
    import: importPlugin,
  },
  rules: {
    'import/order': [
      'error',
      {
        'newlines-between': 'always',
        pathGroupsExcludedImportTypes: ['builtin'],
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
        ],
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    'import/export': 'error',
    'import/no-empty-named-blocks': 'error',
    'import/no-extraneous-dependencies': 'error',
    'import/no-cycle': 'error',
    'import/no-relative-packages': 'error',
    'import/no-restricted-paths': 'error',
    'import/no-self-import': 'error',
    'import/no-useless-path-segments': 'error',
    'import/first': 'error',
    'import/no-default-export': 'error',
    'import/no-duplicates': 'error',
  },
};
