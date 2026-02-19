import { useStdout, useApp } from 'ink';
import { useState, useEffect } from 'react';
import useLatestCallback from 'use-latest-callback';

export const useTerminalSize = () => {
  const { stdout } = useStdout();
  const [dimensions, setDimensions] = useState({
    width: stdout.columns,
    height: stdout.rows,
  });

  useEffect(() => {
    const resize = () => {
      setDimensions({
        width: stdout.columns,
        height: stdout.rows,
      });
    };

    stdout.on('resize', resize);
    return () => {
      stdout.off('resize', resize);
    };
  }, [stdout.columns, stdout.rows, stdout]);

  return dimensions;
};

export const useAppExit = () => {
  const { exit } = useApp();

  return useLatestCallback(() => {
    exit();
  });
};
