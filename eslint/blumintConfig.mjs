import blumintPlugin from '@blumintinc/eslint-plugin-blumint';
import { fixupPluginRules } from '@eslint/compat';

const { rules: recommendedRules, overrides: recommendedOverrides = [] } =
  blumintPlugin.configs.recommended;

const TS_FILES = ['**/*.{ts,mts,cts,tsx}'];
const fixedBlumintPlugin = fixupPluginRules(blumintPlugin);

export const blumintConfig = [
  {
    files: TS_FILES,
    plugins: {
      '@blumintinc/blumint': fixedBlumintPlugin,
    },
    rules: {
      ...recommendedRules,
      // DO: Reverse rules: add all enabled rules + remove all disabled:
      '@blumintinc/blumint/enforce-unique-cursor-headers': 'off',
      '@blumintinc/blumint/no-entire-object-hook-deps': 'off',
      '@blumintinc/blumint/export-if-in-doubt': 'off',
      '@blumintinc/blumint/enforce-assert-safe-object-key': 'off',
      '@blumintinc/blumint/logical-top-to-bottom-grouping': 'off',
      '@blumintinc/blumint/global-const-style': 'off',
      '@blumintinc/blumint/require-memo': 'off',
      '@blumintinc/blumint/prefer-use-deep-compare-memo': 'off',
      '@blumintinc/blumint/no-array-length-in-deps': 'off',
      '@blumintinc/blumint/consistent-callback-naming': 'off',
    },
  },
  ...recommendedOverrides.map(({ files, rules }) => ({ files, rules })),
];
