import pluginJs from '@eslint/js';
import globals from 'globals';

import { blumintConfig } from './eslint/blumintConfig.mjs';
import { importConfig } from './eslint/importConfig.mjs';
import { prettierConfig } from './eslint/prettierConfig.mjs';
import { reactConfig } from './eslint/react.mjs';
import { typescriptConfig } from './eslint/typescriptConfig.mjs';

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
  ...typescriptConfig,
  ...blumintConfig,
];
