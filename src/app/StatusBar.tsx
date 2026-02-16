import { Box, Text } from 'ink';
import type { FC } from 'react';

import { useAppState } from '../state/useAppState.ts';
import type { FileTreeNode } from '../tui-kit/components/FileTree.tsx';
import { palette, type AppTheme } from '../tui-kit/consts.ts';

import {
  APP_THEME_STATE_KEY,
  FILTER_SUMMARY,
  getThemeHintText,
  HINT_TEXT,
} from './consts.ts';

interface StatusBarProps {
  selectedFile: FileTreeNode | null;
  commentPatterns: readonly string[];
  isEditingPatterns: boolean;
}

export const StatusBar: FC<StatusBarProps> = ({
  selectedFile,
  commentPatterns,
  isEditingPatterns,
}) => {
  const [theme] = useAppState<AppTheme>(APP_THEME_STATE_KEY, 'dark');

  return (
    <>
      <Box marginTop={1}>
        <Text color={palette.text}>{HINT_TEXT}</Text>
        <Text color={palette.info} bold>
          {getThemeHintText(theme)}
        </Text>
      </Box>

      <Box marginTop={1}>
        <Text color={palette.text}>{FILTER_SUMMARY}</Text>
      </Box>

      <Box marginTop={1}>
        <Text color={palette.text}>Comment markers: </Text>
        <Text color={palette.info}>{commentPatterns.join(', ')}</Text>
        {isEditingPatterns && (
          <Text color={palette.accent}> (editing: Enter save, Esc cancel)</Text>
        )}
      </Box>

      {selectedFile && (
        <Box marginTop={1}>
          <Text color={palette.text}>Selected: </Text>
          <Text color={palette.accent}>{selectedFile.path}</Text>
        </Box>
      )}
    </>
  );
};
