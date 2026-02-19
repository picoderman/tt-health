import { Box, Text } from 'ink';
import type { FC } from 'react';

import { useAppState } from '../state/useAppState.ts';
import type { FileTreeNode } from '../tui-kit/components/FileTree.tsx';
import { palette, type AppTheme } from '../tui-kit/consts.ts';

import { APP_THEME_STATE_KEY, FILTER_SUMMARY, HINT_TEXT } from './consts.ts';

type StatusBarProps = {
  selectedFile: FileTreeNode | null;
  commentPatterns: readonly string[];
  isEditingPatterns: boolean;
};

export const StatusBar: FC<StatusBarProps> = ({
  selectedFile,
  commentPatterns,
  isEditingPatterns,
}) => {
  const [theme] = useAppState<AppTheme>(APP_THEME_STATE_KEY, 'dark');

  return (
    <>
      {/* DO: Add wrapper with gap/padding? */}
      {/* eslint-disable-next-line @blumintinc/blumint/no-margin-properties */}
      <Box marginTop={1}>
        <Text color={palette.text} dimColor>
          {HINT_TEXT}
        </Text>
        <Text color={palette.info} bold dimColor>
          {theme === 'dark'
            ? ' | T to Switch to Light Theme'
            : ' | T to Switch to Dark Theme'}
        </Text>
      </Box>

      {/* eslint-disable-next-line @blumintinc/blumint/no-margin-properties */}
      <Box marginTop={1}>
        <Text color={palette.text} dimColor>
          {FILTER_SUMMARY}
        </Text>
      </Box>

      {/* eslint-disable-next-line @blumintinc/blumint/no-margin-properties */}
      <Box marginTop={1}>
        <Text color={palette.text} dimColor>
          {`Comment markers: `}
        </Text>
        <Text color={palette.info} dimColor>
          {commentPatterns.join(', ')}
        </Text>
        {isEditingPatterns && (
          <Text color={palette.accent} dimColor>
            {` (editing: Enter save, Esc cancel)`}
          </Text>
        )}
      </Box>

      {selectedFile && (
        // eslint-disable-next-line @blumintinc/blumint/no-margin-properties
        <Box marginTop={1}>
          <Text color={palette.text}>Selected: </Text>
          <Text color={palette.accent}>{selectedFile.path}</Text>
        </Box>
      )}
    </>
  );
};
