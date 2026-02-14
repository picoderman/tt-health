import { Box, Text } from 'ink';
import type { FC } from 'react';

import { palette } from '../consts.ts';

export interface HintProps {
  text: string;
}

export const Hint: FC<HintProps> = ({ text }) => {
  return (
    <Box>
      <Text color={palette.textDim}>{text}</Text>
    </Box>
  );
};
