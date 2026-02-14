import { Box, Text } from 'ink';
import type { FC, PropsWithChildren } from 'react';

import { palette } from '../consts.ts';

// DO: replace via type
export interface SectionProps {
  title: string;
  borderColor?: string;
  width?: number | string;
  paddingX?: number;
  paddingY?: number;
}

/**
 * Named section with visible borders and title.
 */
export const Section: FC<PropsWithChildren<SectionProps>> = ({
  title,
  children,
  borderColor = palette.border,
  width,
  paddingX = 1,
  paddingY = 0,
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
