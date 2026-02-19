import { Box, type DOMElement, measureElement } from 'ink';
import { type ComponentProps, useEffect, useRef, useState } from 'react';
import useLatestCallback from 'use-latest-callback';

import { useScrollEvents } from '../../hooks/useScrollEvents.ts';

import { Scrollbar } from './Scrollbar.tsx';
const DEFAULT_FOCUS_PADDING = 2;

type ScrollBoxProps = ComponentProps<typeof Box> & {
  focusRow?: number;
  focusPadding?: number;
};

export const ScrollBox = ({
  focusRow,
  focusPadding = DEFAULT_FOCUS_PADDING,
  ...props
}: ScrollBoxProps) => {
  const [scroll, setScroll] = useState(0);
  const [dimensions, setDimensions] = useState<{
    containerHeight: number;
    contentHeight: number;
  } | null>(null);
  const contentRef = useRef<DOMElement>(null);
  const containerRef = useRef<DOMElement>(null);

  const measure = useLatestCallback(() => {
    if (!contentRef.current || !containerRef.current) return null;

    const ch = measureElement(containerRef.current).height;
    const coh = measureElement(contentRef.current).height;
    setDimensions((prev) => {
      if (prev && prev.containerHeight === ch && prev.contentHeight === coh) {
        return prev;
      }
      return { containerHeight: ch, contentHeight: coh } as const;
    });
    return Math.max(0, coh - ch);
  });

  const onUp = useLatestCallback(() => {
    setScroll((s) => {
      measure();
      return Math.max(0, s - 1);
    });
  });

  const onDown = useLatestCallback(() => {
    setScroll((s) => {
      const max = measure() ?? 0;
      return Math.min(s + 1, max);
    });
  });

  useScrollEvents(onUp, onDown);

  useEffect(() => {
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
          // eslint-disable-next-line @blumintinc/blumint/no-margin-properties
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
