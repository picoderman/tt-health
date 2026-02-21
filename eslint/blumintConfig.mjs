import blumintPlugin from '@blumintinc/eslint-plugin-blumint';
import { fixupPluginRules } from '@eslint/compat';

const TS_FILES = ['**/*.{ts,mts,cts,tsx}'];
const fixedBlumintPlugin = fixupPluginRules(blumintPlugin);

const RECOMMENDED_RULES = {
  '@blumintinc/blumint/enforce-f-extension-for-entry-points': 'error',
  '@blumintinc/blumint/firestore-transaction-reads-before-writes': 'error',
  '@blumintinc/blumint/prefer-block-comments-for-declarations': 'error',
  '@blumintinc/blumint/key-only-outermost-element': 'error',
  '@blumintinc/blumint/parallelize-async-operations': 'error',
  '@blumintinc/blumint/avoid-utils-directory': 'error',
  '@blumintinc/blumint/enforce-firestore-path-utils': 'error',
  '@blumintinc/blumint/enforce-firestore-rules-get-access': 'error',
  '@blumintinc/blumint/no-jsx-whitespace-literal': 'error',
  '@blumintinc/blumint/array-methods-this-context': 'error',
  '@blumintinc/blumint/class-methods-read-top-to-bottom': 'error',
  '@blumintinc/blumint/dynamic-https-errors': 'error',
  '@blumintinc/blumint/enforce-empty-object-check': 'error',
  '@blumintinc/blumint/enforce-mui-rounded-icons': 'error',
  '@blumintinc/blumint/enforce-identifiable-firestore-type': 'error',
  '@blumintinc/blumint/enforce-callback-memo': 'error',
  '@blumintinc/blumint/react-memoize-literals': 'error',
  '@blumintinc/blumint/enforce-callable-types': 'error',
  '@blumintinc/blumint/enforce-console-error': 'error',
  '@blumintinc/blumint/enforce-dynamic-firebase-imports': 'error',
  '@blumintinc/blumint/enforce-react-type-naming': 'error',
  '@blumintinc/blumint/extract-global-constants': 'error',
  '@blumintinc/blumint/enforce-global-constants': 'error',
  '@blumintinc/blumint/generic-starts-with-t': 'error',
  '@blumintinc/blumint/no-async-array-filter': 'error',
  '@blumintinc/blumint/no-async-foreach': 'error',
  '@blumintinc/blumint/no-console-error': ['error'],
  '@blumintinc/blumint/no-conditional-literals-in-jsx': 'error',
  '@blumintinc/blumint/no-filter-without-return': 'error',
  '@blumintinc/blumint/no-hungarian': 'error',
  '@blumintinc/blumint/no-handler-suffix': 'error',
  '@blumintinc/blumint/no-misused-switch-case': 'error',
  '@blumintinc/blumint/no-unpinned-dependencies': 'error',
  '@blumintinc/blumint/no-unused-props': 'error',
  '@blumintinc/blumint/no-uuidv4-base62-as-key': 'error',
  '@blumintinc/blumint/no-useless-fragment': 'error',
  '@blumintinc/blumint/no-useless-usememo-primitives': 'error',
  '@blumintinc/blumint/prefer-fragment-shorthand': 'error',
  '@blumintinc/blumint/prefer-getter-over-parameterless-method': 'error',
  '@blumintinc/blumint/prefer-type-over-interface': 'error',
  '@blumintinc/blumint/prefer-type-alias-over-typeof-constant': 'error',
  '@blumintinc/blumint/require-memoize-jsx-returners': 'error',
  '@blumintinc/blumint/no-unmemoized-memo-without-props': 'error',
  '@blumintinc/blumint/require-dynamic-firebase-imports': 'error',
  '@blumintinc/blumint/require-https-error': 'error',
  '@blumintinc/blumint/require-https-error-cause': 'error',
  '@blumintinc/blumint/use-custom-router': 'error',
  '@blumintinc/blumint/require-image-optimized': 'error',
  '@blumintinc/blumint/memoize-root-level-hocs': 'error',
  '@blumintinc/blumint/enforce-safe-stringify': 'error',
  '@blumintinc/blumint/enforce-early-destructuring': 'error',
  '@blumintinc/blumint/enforce-storage-context': 'error',
  '@blumintinc/blumint/no-compositing-layer-props': 'error',
  '@blumintinc/blumint/enforce-firestore-doc-ref-generic': 'error',
  '@blumintinc/blumint/semantic-function-prefixes': 'error',
  '@blumintinc/blumint/enforce-mock-firestore': 'error',
  '@blumintinc/blumint/prefer-settings-object': 'error',
  '@blumintinc/blumint/enforce-firestore-set-merge': 'error',
  '@blumintinc/blumint/enforce-verb-noun-naming': 'error',
  '@blumintinc/blumint/no-explicit-return-type': 'error',
  '@blumintinc/blumint/use-custom-memo': 'error',
  '@blumintinc/blumint/use-custom-link': 'error',
  '@blumintinc/blumint/enforce-serializable-params': 'error',
  '@blumintinc/blumint/enforce-realtimedb-path-utils': 'error',
  '@blumintinc/blumint/enforce-memoize-async': 'error',
  '@blumintinc/blumint/enforce-exported-function-types': 'error',
  '@blumintinc/blumint/no-redundant-annotation-assertion': 'error',
  '@blumintinc/blumint/no-redundant-param-types': 'error',
  '@blumintinc/blumint/enforce-memoize-getters': 'error',
  '@blumintinc/blumint/no-class-instance-destructuring': 'error',
  '@blumintinc/blumint/no-firestore-object-arrays': 'error',
  '@blumintinc/blumint/no-memoize-on-static': 'error',
  '@blumintinc/blumint/no-unsafe-firestore-spread': 'error',
  '@blumintinc/blumint/no-jsx-in-hooks': 'error',
  '@blumintinc/blumint/enforce-assert-throws': 'error',
  '@blumintinc/blumint/prefer-batch-operations': 'error',
  '@blumintinc/blumint/prefer-docsetter-setall': 'error',
  '@blumintinc/blumint/no-complex-cloud-params': 'error',
  '@blumintinc/blumint/no-mixed-firestore-transactions': 'error',
  '@blumintinc/blumint/enforce-firestore-facade': 'error',
  '@blumintinc/blumint/sync-onwrite-name-func': 'error',
  '@blumintinc/blumint/prefer-clone-deep': 'error',
  '@blumintinc/blumint/no-firestore-jest-mock': 'error',
  '@blumintinc/blumint/no-mock-firebase-admin': 'error',
  '@blumintinc/blumint/enforce-centralized-mock-firestore': 'error',
  '@blumintinc/blumint/require-hooks-default-params': 'error',
  '@blumintinc/blumint/prefer-destructuring-no-class': 'error',
  '@blumintinc/blumint/enforce-render-hits-memoization': 'error',
  '@blumintinc/blumint/enforce-transform-memoization': 'error',
  '@blumintinc/blumint/react-usememo-should-be-component': 'error',
  '@blumintinc/blumint/no-unnecessary-verb-suffix': 'error',
  '@blumintinc/blumint/enforce-object-literal-as-const': 'error',
  '@blumintinc/blumint/enforce-positive-naming': 'error',
  '@blumintinc/blumint/no-type-assertion-returns': 'error',
  '@blumintinc/blumint/prefer-utility-function-over-private-static': 'error',
  '@blumintinc/blumint/enforce-microdiff': 'error',
  '@blumintinc/blumint/fast-deep-equal-over-microdiff': 'error',
  '@blumintinc/blumint/flatten-push-calls': 'error',
  '@blumintinc/blumint/enforce-timestamp-now': 'error',
  '@blumintinc/blumint/enforce-typescript-markdown-code-blocks': 'error',
  '@blumintinc/blumint/no-always-true-false-conditions': 'error',
  '@blumintinc/blumint/enforce-props-argument-name': 'error',
  '@blumintinc/blumint/enforce-props-naming-consistency': 'error',
  '@blumintinc/blumint/prefer-global-router-state-key': 'error',
  '@blumintinc/blumint/prefer-usememo-over-useeffect-usestate': 'error',
  '@blumintinc/blumint/enforce-dynamic-imports': 'error',
  '@blumintinc/blumint/ensure-pointer-events-none': 'error',
  '@blumintinc/blumint/no-object-values-on-strings': 'error',
  '@blumintinc/blumint/no-unnecessary-destructuring': 'error',
  '@blumintinc/blumint/no-unnecessary-destructuring-rename': 'error',
  '@blumintinc/blumint/enforce-singular-type-names': 'error',
  '@blumintinc/blumint/prevent-children-clobber': 'error',
  '@blumintinc/blumint/enforce-css-media-queries': 'error',
  '@blumintinc/blumint/omit-index-html': 'error',
  '@blumintinc/blumint/enforce-id-capitalization': 'error',
  '@blumintinc/blumint/no-unused-usestate': 'error',
  '@blumintinc/blumint/prefer-usecallback-over-usememo-for-functions': 'error',
  '@blumintinc/blumint/no-usememo-for-pass-by-value': 'error',
  '@blumintinc/blumint/no-margin-properties': 'error',
  '@blumintinc/blumint/enforce-boolean-naming-prefixes': 'error',
  '@blumintinc/blumint/enforce-fieldpath-syntax-in-docsetter': 'error',
  '@blumintinc/blumint/no-undefined-null-passthrough': 'error',
  '@blumintinc/blumint/prefer-nullish-coalescing-boolean-props': 'error',
  '@blumintinc/blumint/no-overridable-method-calls-in-constructor': 'error',
  '@blumintinc/blumint/use-latest-callback': 'error',
  '@blumintinc/blumint/no-empty-dependency-use-callbacks': 'error',
  '@blumintinc/blumint/enforce-querykey-ts': 'error',
  '@blumintinc/blumint/no-stale-state-across-await': 'error',
  '@blumintinc/blumint/no-separate-loading-state': 'error',
  '@blumintinc/blumint/optimize-object-boolean-conditions': 'error',
  '@blumintinc/blumint/prefer-params-over-parent-id': 'error',
  '@blumintinc/blumint/prefer-field-paths-in-transforms': 'warn',
  '@blumintinc/blumint/no-misleading-boolean-prefixes': 'error',
  '@blumintinc/blumint/prefer-url-tostring-over-tojson': 'error',
  '@blumintinc/blumint/prefer-next-dynamic': 'error',
  '@blumintinc/blumint/jsdoc-above-field': 'error',
  '@blumintinc/blumint/no-redundant-usecallback-wrapper': 'error',
  '@blumintinc/blumint/no-redundant-this-params': 'error',
  '@blumintinc/blumint/no-res-error-status-in-onrequest': 'error',
  '@blumintinc/blumint/enforce-stable-hash-spread-props': 'error',
  '@blumintinc/blumint/memo-nested-react-components': 'error',
  '@blumintinc/blumint/memo-compare-deeply-complex-props': 'error',
  '@blumintinc/blumint/no-circular-references': 'error',
  '@blumintinc/blumint/no-try-catch-already-exists-in-transaction': 'error',
  '@blumintinc/blumint/no-curly-brackets-around-commented-properties': 'error',
  '@blumintinc/blumint/no-passthrough-getters': 'error',
  '@blumintinc/blumint/vertically-group-related-functions': 'error',
  '@blumintinc/blumint/no-static-constants-in-dynamic-files': 'error',
  '@blumintinc/blumint/test-file-location-enforcement': 'error',
};

const RECOMMENDED_OVERRIDES = [
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      '@blumintinc/blumint/enforce-date-ttime': 'error',
    },
  },
  {
    files: ['functions/*.f.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../src/**'],
              message:
                'Backend Cloud Functions (.f.ts under functions/) must not import frontend modules from the repo root src/**. Frontend code can depend on browser-only APIs and bundling it into Cloud Functions breaks server execution; move shared logic into functions/src or a shared package.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['functions/*/*.f.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../../src/**'],
              message:
                'Backend Cloud Functions (.f.ts under functions/) must not import frontend modules from the repo root src/**. Frontend code can depend on browser-only APIs and bundling it into Cloud Functions breaks server execution; move shared logic into functions/src or a shared package.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['functions/*/*/*.f.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../../../src/**'],
              message:
                'Backend Cloud Functions (.f.ts under functions/) must not import frontend modules from the repo root src/**. Frontend code can depend on browser-only APIs and bundling it into Cloud Functions breaks server execution; move shared logic into functions/src or a shared package.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['functions/*/*/*/*.f.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../../../../src/**'],
              message:
                'Backend Cloud Functions (.f.ts under functions/) must not import frontend modules from the repo root src/**. Frontend code can depend on browser-only APIs and bundling it into Cloud Functions breaks server execution; move shared logic into functions/src or a shared package.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['functions/*/*/*/*/*.f.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../../../../../src/**'],
              message:
                'Backend Cloud Functions (.f.ts under functions/) must not import frontend modules from the repo root src/**. Frontend code can depend on browser-only APIs and bundling it into Cloud Functions breaks server execution; move shared logic into functions/src or a shared package.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['functions/*/*/*/*/*/*.f.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../../../../../../src/**'],
              message:
                'Backend Cloud Functions (.f.ts under functions/) must not import frontend modules from the repo root src/**. Frontend code can depend on browser-only APIs and bundling it into Cloud Functions breaks server execution; move shared logic into functions/src or a shared package.',
            },
          ],
        },
      ],
    },
  },
];

export const blumintConfig = [
  {
    files: TS_FILES,
    plugins: {
      '@blumintinc/blumint': fixedBlumintPlugin,
    },
    rules: RECOMMENDED_RULES,
  },
  ...RECOMMENDED_OVERRIDES,
];
