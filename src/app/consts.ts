import type { FileTreeLabel } from '../tui-kit/components/FileTree.tsx';
import { palette } from '../tui-kit/consts.ts';

export const FILE_EXTENSIONS = ['js', 'ts', 'jsx', 'tsx'];
export const EXCLUDED_DIRS = ['node_modules'];
export const DEFAULT_COMMENT_PATTERNS = ['@ts-expect-error'] as const;
// DO: Add an ability to add/remove and switch between multiple patterns
export const MAX_COMMENT_PATTERNS = 4;

export const HINT_TEXT = '↑/↓/→/← | Press C to edit patterns';
export const FILTER_SUMMARY = `Filters: ${FILE_EXTENSIONS.map((e) => `*.${e}`).join(', ')} | Excluded: ${EXCLUDED_DIRS.join(', ')} | Sort: comment count desc`;

export const COMMENT_PATTERNS_STATE_KEY = 'ttFsCommentPatterns';
export const APP_THEME_STATE_KEY = 'ttFsTheme';

export type LabelRule = {
  test: (name: string, isDirectory: boolean) => boolean;
  label: FileTreeLabel;
};

export const labelRules: LabelRule[] = [
  {
    test: (name, isDirectory) => isDirectory && /^src$/.test(name),
    label: { text: 'source', color: palette.success },
  },
];
