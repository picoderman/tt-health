import { Box, Text } from 'ink';
import type { FC, PropsWithChildren } from 'react';

import { palette } from '../consts.ts';

const DEFAULT_PADDING_X = 1;
const DEFAULT_PADDING_Y = 0;

// DO: replace via type
export type SectionProps = {
  title: string;
  borderColor?: string;
  width?: number | string;
  paddingX?: number;
  paddingY?: number;
};

/**
 * Named section with visible borders and title.
 */
export const Section: FC<PropsWithChildren<SectionProps>> = ({
  title,
  children,
  borderColor = palette.border,
  width,
  paddingX = DEFAULT_PADDING_X,
  paddingY = DEFAULT_PADDING_Y,
}) => {
  return (
    <Box
      flexDirection="column"
      width={width}
      borderStyle="round"
      borderColor={borderColor}
      paddingX={paddingX}
      paddingY={paddingY}
    >
      <Text color={palette.secondary} bold>
        {title}
      </Text>

      {children}
    </Box>
  );
};
