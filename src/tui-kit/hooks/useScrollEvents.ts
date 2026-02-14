import { useStdin } from 'ink';
import { useEffect } from 'react';

// SGR mouse scroll pattern: ESC[<btn;col;rowM
const ESC = String.fromCharCode(0x1b);
const SGR_MOUSE_RE = new RegExp(`${ESC}\\[<(\\d+);\\d+;\\d+M`, 'g');

const SCROLL_UP_BTN = 64;
const SCROLL_DOWN_BTN = 65;

export function useScrollEvents(
  onUp: () => void,
  onDown: () => void,
  isActive = true,
): void {
  const { stdin } = useStdin();

  useEffect(() => {
    if (!isActive || !stdin) return;

    const handler = (data: Buffer) => {
      const str = data.toString('utf-8');
      for (const match of str.matchAll(SGR_MOUSE_RE)) {
        const btn = Number(match[1]);
        if (btn === SCROLL_UP_BTN) onUp();
        else if (btn === SCROLL_DOWN_BTN) onDown();
      }
    };

    stdin.on('data', handler);
    return () => {
      stdin.off('data', handler);
    };
  }, [stdin, onUp, onDown, isActive]);
}
