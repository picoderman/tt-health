import { Box, Text } from 'ink';
import { useMemo } from 'react';

import { palette } from '../../consts.ts';

const thumbRow = { char: '█', color: palette.accent };
const nonThumbRow = { char: '│', color: palette.border };

/** DO: Move to separate file */
export const Scrollbar = ({
  containerHeight,
  contentHeight,
  scroll,
  maxScroll,
}: {
  containerHeight: number;
  contentHeight: number;
  scroll: number;
  maxScroll: number;
}) => {
  const thumbSize = Math.max(
    1,
    Math.round((containerHeight * containerHeight) / contentHeight),
  );

  const thumbPosition = Math.round(
    (scroll / maxScroll) * (containerHeight - thumbSize),
  );

  const content = useMemo(() => {
    const rows = [];
    for (let i = 0; i < containerHeight; i++) {
      if (i >= thumbPosition && i < thumbPosition + thumbSize) {
        rows.push(thumbRow);
      } else {
        rows.push(nonThumbRow);
      }
    }

    return rows.map((row, i) => (
      <Text key={i} color={row.color}>
        {row.char}
      </Text>
    ));
  }, [containerHeight, thumbPosition, thumbSize]);

  return (
    <Box flexDirection="column" width={1} flexShrink={0}>
      {content}
    </Box>
  );
};
