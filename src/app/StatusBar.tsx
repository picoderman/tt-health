import { Box, Text } from 'ink';
import type { FC } from 'react';

import type { FileTreeNode } from '../tui-kit/components/FileTree.tsx';
import { Hint } from '../tui-kit/components/Hint.tsx';
import { palette } from '../tui-kit/consts.ts';

import { FILTER_SUMMARY, HINT_TEXT } from './consts.ts';

interface StatusBarProps {
  selectedFile: FileTreeNode | null;
  commentPatterns: readonly string[];
  isEditingPatterns: boolean;
}

export const StatusBar: FC<StatusBarProps> = ({
  selectedFile,
  commentPatterns,
  isEditingPatterns,
}) => (
  <>
    <Box marginTop={1}>
      <Hint text={HINT_TEXT} />
    </Box>

    <Box marginTop={1}>
      <Text color={palette.textDim}>{FILTER_SUMMARY}</Text>
    </Box>

    <Box marginTop={1}>
      <Text color={palette.textDim}>Comment markers: </Text>
      <Text color={palette.info}>{commentPatterns.join(', ')}</Text>
      {isEditingPatterns && (
        <Text color={palette.accent}> (editing: Enter save, Esc cancel)</Text>
      )}
    </Box>

    {selectedFile && (
      <Box marginTop={1}>
        <Text color={palette.textDim}>Selected: </Text>
        <Text color={palette.accent}>{selectedFile.path}</Text>
      </Box>
    )}
  </>
);
