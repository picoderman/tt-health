import { Box, Text, measureElement } from 'ink';
import {
  type ComponentProps,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { palette } from '../consts.ts';
import { useScrollEvents } from '../hooks/useScrollEvents.ts';

// DO: Move to separate file
const Scrollbar = ({
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

  const rows: Array<{ char: string; color: string }> = [];
  for (let i = 0; i < containerHeight; i++) {
    if (i >= thumbPosition && i < thumbPosition + thumbSize) {
      rows.push({ char: '█', color: palette.accent });
    } else {
      rows.push({ char: '│', color: palette.border });
    }
  }

  return (
    <Box flexDirection="column" width={1} flexShrink={0}>
      {rows.map((row, i) => (
        <Text key={i} color={row.color}>
          {row.char}
        </Text>
      ))}
    </Box>
  );
};

interface ScrollBoxProps extends ComponentProps<typeof Box> {
  focusRow?: number;
  focusPadding?: number;
}

export const ScrollBox = ({
  focusRow,
  focusPadding = 2,
  ...props
}: ScrollBoxProps) => {
  const [scroll, setScroll] = useState(0);
  const [dimensions, setDimensions] = useState<{
    containerHeight: number;
    contentHeight: number;
  } | null>(null);
  const contentRef = useRef(null);
  const containerRef = useRef(null);

  const measure = useCallback(() => {
    if (!contentRef.current || !containerRef.current) return null;
    const ch = measureElement(containerRef.current).height;
    const coh = measureElement(contentRef.current).height;
    setDimensions((prev) => {
      if (prev && prev.containerHeight === ch && prev.contentHeight === coh) {
        return prev;
      }
      return { containerHeight: ch, contentHeight: coh };
    });
    return Math.max(0, coh - ch);
  }, []);

  const onUp = useCallback(() => {
    setScroll((s) => {
      measure();
      return Math.max(0, s - 1);
    });
  }, [measure]);

  const onDown = useCallback(() => {
    setScroll((s) => {
      const max = measure() ?? 0;
      return Math.min(s + 1, max);
    });
  }, [measure]);

  useScrollEvents(onUp, onDown);

  useEffect(() => {
    // DO: Fix all issues by compiler requirements
    // eslint-disable-next-line react-hooks/set-state-in-effect
    measure();
  });

  const maxScroll = dimensions
    ? Math.max(0, dimensions.contentHeight - dimensions.containerHeight)
    : 0;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setScroll((current) => Math.min(current, maxScroll));
  }, [maxScroll]);

  useEffect(() => {
    if (focusRow === undefined || !dimensions) {
      return;
    }

    const max = Math.max(
      0,
      dimensions.contentHeight - dimensions.containerHeight,
    );
    const resolvedPadding = Math.max(
      0,
      Math.min(focusPadding, Math.floor((dimensions.containerHeight - 1) / 2)),
    );

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setScroll((current) => {
      const topLimit = current + resolvedPadding;
      const bottomLimit =
        current + dimensions.containerHeight - 1 - resolvedPadding;
      let next = current;

      if (focusRow < topLimit) {
        next = focusRow - resolvedPadding;
      } else if (focusRow > bottomLimit) {
        next = focusRow - dimensions.containerHeight + 1 + resolvedPadding;
      }

      return Math.max(0, Math.min(next, max));
    });
  }, [dimensions, focusPadding, focusRow]);

  const { children, ...restProps } = props;

  return (
    <Box
      {...restProps}
      flexDirection="row"
      overflow="hidden"
      width="100%"
      height="100%"
    >
      <Box flexGrow={1} overflow="hidden" ref={containerRef}>
        <Box
          position="absolute"
          width="100%"
          marginTop={-scroll}
          ref={contentRef}
          flexDirection="column"
        >
          {children}
        </Box>
      </Box>
      {maxScroll > 0 && dimensions && (
        <Scrollbar
          containerHeight={dimensions.containerHeight}
          contentHeight={dimensions.contentHeight}
          scroll={scroll}
          maxScroll={maxScroll}
        />
      )}
    </Box>
  );
};
