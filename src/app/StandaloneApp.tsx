import { Box, Text, useInput } from 'ink';
import type { FC } from 'react';

import { palette } from '../tui-kit/consts.ts';
import { useAppExit, useTerminalSize } from '../tui-kit/hooks/useTerminal.ts';

import { App as FsApp } from './App.tsx';

interface StandaloneAppProps {
  dir: string;
}

// DO: Merge with App. Added as a replacement of TT platform wrapper
export const StandaloneApp: FC<StandaloneAppProps> = ({ dir }) => {
  const { width, height } = useTerminalSize();
  const exit = useAppExit();

  useInput((input, key) => {
    if (input === 'q' || (key.ctrl && input === 'c')) {
      exit();
    }
  });

  return (
    <Box width={width} minHeight={height - 1} flexDirection="column">
      <Box flexGrow={1} />

      <Box width={width} flexDirection="column" alignItems="center" paddingX={2}>
        <FsApp dir={dir} />
      </Box>

      <Box width={width}>
        <Text color={palette.textDim}>{` env: local | q quit`.padEnd(width)}</Text>
      </Box>
    </Box>
  );
};
