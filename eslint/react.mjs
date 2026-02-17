import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export const reactConfig = [
  {
    ...react.configs.flat.recommended,
    files: ['**/*.jsx', '**/*.tsx'],
    rules: {
      'react/react-in-jsx-scope': 'off',
    },
  },
  {
    ...reactHooks.configs.flat.recommended,
    rules: {
      ...reactHooks.configs.flat.recommended.rules,
      'react-hooks/exhaustive-deps': 'error',
    },
  },
];
