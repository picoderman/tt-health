import { Box, Text, useInput } from 'ink';
import type { FC } from 'react';

import { useAppState } from '../state/useAppState.ts';
import {
  applyTheme,
  palette,
  toggleTheme,
  type AppTheme,
} from '../tui-kit/consts.ts';
import { useAreGlobalShortcutsLocked } from '../tui-kit/hooks/useGlobalShortcutLock.ts';
import { useAppExit, useTerminalSize } from '../tui-kit/hooks/useTerminal.ts';

import { App as FsApp } from './App.tsx';
import { APP_THEME_STATE_KEY } from './consts.ts';

type StandaloneAppProps = {
  dir: string;
};

// DO: Merge with App. Added as a replacement of TT platform wrapper
export const StandaloneApp: FC<StandaloneAppProps> = ({ dir }) => {
  const { width, height } = useTerminalSize();
  const exit = useAppExit();
  const [theme, setTheme] = useAppState<AppTheme>(APP_THEME_STATE_KEY, 'dark');
  const isGlobalShortcutLocked = useAreGlobalShortcutsLocked();

  applyTheme(theme);

  useInput((input, key) => {
    const normalizedInput = input.toLowerCase();

    if (key.ctrl && normalizedInput === 'c') {
      exit();
      return;
    }

    if (isGlobalShortcutLocked) {
      return;
    }

    if (normalizedInput === 'q') {
      exit();
      return;
    }

    if (normalizedInput === 't') {
      setTheme(toggleTheme(theme));
    }
  });

  return (
    <Box width={width} minHeight={height - 1} flexDirection="column">
      <Box flexGrow={1} />

      <Box
        width={width}
        flexDirection="column"
        alignItems="center"
        paddingX={2}
      >
        <FsApp dir={dir} />
      </Box>

      <Box width={width}>
        <Text color={palette.text} dimColor>
          {` q quit`.padEnd(width)}
        </Text>
      </Box>
    </Box>
  );
};
