import pluginJs from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

import { importConfig } from './eslint/importConfig.mjs';
import { prettierConfig } from './eslint/prettierConfig.mjs';
import { reactConfig } from './eslint/react.mjs';

// eslint-disable-next-line import/no-default-export
export default [
  {
    languageOptions: {
      globals: globals.node,
    },
  },
  prettierConfig,
  importConfig,
  pluginJs.configs.recommended,
  ...reactConfig,

  ...tseslint.configs.recommended,
];
