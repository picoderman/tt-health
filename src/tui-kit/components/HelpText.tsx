import { Box, Text } from 'ink';

import { palette } from '../consts.ts';

export type HelpTextProps = {
  text: string;
};

export const HelpText = ({ text }: HelpTextProps) => {
  return (
    <Box>
      <Text color={palette.textDim}>{text}</Text>
    </Box>
  );
};
