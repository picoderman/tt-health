import { useStdout, useApp } from 'ink';
import { useState, useEffect, useCallback } from 'react';

export interface TerminalDimensions {
  width: number;
  height: number;
}

/**
 * Hook for getting terminal dimensions with auto-resize.
 */
export function useTerminalSize(): TerminalDimensions {
  const { stdout } = useStdout();
  const [dimensions, setDimensions] = useState<TerminalDimensions>({
    width: stdout?.columns ?? 80,
    height: stdout?.rows ?? 24,
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: stdout?.columns ?? 80,
        height: stdout?.rows ?? 24,
      });
    };

    stdout?.on('resize', handleResize);
    return () => {
      stdout?.off('resize', handleResize);
    };
  }, [stdout]);

  return dimensions;
}

/**
 * Hook for app lifecycle control.
 */
export function useAppExit(): () => void {
  const { exit } = useApp();

  return useCallback(() => exit(), [exit]);
}
