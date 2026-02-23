import { Box, Text, useInput } from 'ink';
import { useEffect, useState } from 'react';
import useLatestCallback from 'use-latest-callback';

import { useAppState } from '../state/useAppState.js';
import {
  FileTree,
  type OnFocusEvent,
} from '../tui-kit/components/FileTree.tsx';
import { HelpText } from '../tui-kit/components/HelpText.tsx';
import { ManagedTextInput } from '../tui-kit/components/ManagedTextInput.tsx';
import { ScrollBox } from '../tui-kit/components/ScrollBox/ScrollBox.tsx';
import { Section } from '../tui-kit/components/Section.tsx';
import { palette } from '../tui-kit/consts.ts';
import { useAreGlobalShortcutsLocked } from '../tui-kit/hooks/useGlobalShortcutLock.ts';

import {
  COMMENT_PATTERNS_STATE_KEY,
  DEFAULT_COMMENT_PATTERNS,
  EXCLUDED_DIRS,
  FILE_EXTENSIONS,
  MAX_COMMENT_PATTERNS,
} from './consts.ts';
import { StatusBar } from './StatusBar.tsx';
import { useFileTree } from './useFileTree.ts';

const TREE_SECTION_FOCUS_OFFSET = 2;

type AppProps = {
  dir: string;
};

const defaultCommentPatterns = [...DEFAULT_COMMENT_PATTERNS].slice(
  0,
  MAX_COMMENT_PATTERNS,
);
export const App = ({ dir }: AppProps) => {
  const [commentPatterns, setCommentPatterns] = useAppState<string[]>(
    COMMENT_PATTERNS_STATE_KEY,
    defaultCommentPatterns,
  );
  const [isEditingPatterns, setIsEditingPatterns] = useState(false);
  const [commentPatternsInput, setCommentPatternsInput] = useState(
    commentPatterns.join(', '),
  );
  const [commentPatternError, setCommentPatternError] = useState<string | null>(
    null,
  );
  const [treeFocus, setTreeFocus] = useState({ index: 0, total: 0 });
  const isGlobalShortcutLocked = useAreGlobalShortcutsLocked();

  useEffect(() => {
    const clampedPatterns = normalizeCommentPatterns(commentPatterns).slice(
      0,
      MAX_COMMENT_PATTERNS,
    );

    if (
      !computeArePatternsEqual({
        left: commentPatterns,
        right: clampedPatterns,
      })
    )
      setCommentPatterns(clampedPatterns);
  }, [commentPatterns, setCommentPatterns]);

  const { selectedFile, onSelect, getLabels, sortEntries } = useFileTree(
    dir,
    commentPatterns,
  );

  const saveCommentPatterns = useLatestCallback((rawValue: string) => {
    const parsedPatterns = parseCommentPatterns(rawValue);
    if (parsedPatterns.length === 0) {
      setCommentPatternError('Add at least one marker.');
      return;
    }

    if (parsedPatterns.length > MAX_COMMENT_PATTERNS) {
      setCommentPatternError(`Max ${MAX_COMMENT_PATTERNS.toString()} markers.`);
      return;
    }

    // DO: It's not calling rerender of the tree 🤔
    setCommentPatterns(parsedPatterns);
    setCommentPatternError(null);
    setIsEditingPatterns(false);
  });

  useInput((input, key) => {
    if (isEditingPatterns) {
      if (key.escape) {
        setCommentPatternsInput(commentPatterns.join(', '));
        setCommentPatternError(null);
        setIsEditingPatterns(false);
      }
      return;
    }

    if (isGlobalShortcutLocked) {
      return;
    }

    const normalizedInput = input.toLowerCase();

    if (normalizedInput === 'c') {
      setCommentPatternsInput(commentPatterns.join(', '));
      setCommentPatternError(null);
      setIsEditingPatterns(true);
    }
  });

  const onFocus = useLatestCallback(({ index, total }: OnFocusEvent) => {
    setTreeFocus((prev) => {
      if (prev.index === index && prev.total === total) {
        return prev;
      }
      return { index, total } as const;
    });
  });

  return (
    <ScrollBox focusRow={treeFocus.index + TREE_SECTION_FOCUS_OFFSET}>
      <Box flexDirection="column" height="100%">
        <Box flexDirection="row" flexGrow={1}>
          <Box flexDirection="column" width="100%">
            <Section title={dir}>
              <FileTree
                rootPath={dir}
                isActive={!isEditingPatterns}
                isDimNonActiveDepth={true}
                onFocus={onFocus}
                onSelect={onSelect}
                isShowHidden={false}
                getLabels={getLabels}
                sortEntries={sortEntries}
                fileExtensions={FILE_EXTENSIONS}
                excludeDirs={EXCLUDED_DIRS}
              />
            </Section>

            {isEditingPatterns && (
              <Box paddingTop={1} flexDirection="column">
                <Text color={palette.textDim}>
                  Comment markers (comma/newline separated, max 4):
                </Text>

                <ManagedTextInput
                  value={commentPatternsInput}
                  onChange={setCommentPatternsInput}
                  onSubmit={saveCommentPatterns}
                  focus={true}
                  placeholder="TODO:, @ts-ignore"
                />

                {commentPatternError && (
                  <Text color={palette.error}>{commentPatternError}</Text>
                )}

                <HelpText text="Enter save | Esc cancel" />
              </Box>
            )}
          </Box>
        </Box>

        <StatusBar
          selectedFile={selectedFile}
          commentPatterns={commentPatterns}
          isEditingPatterns={isEditingPatterns}
        />
      </Box>
    </ScrollBox>
  );
};

const parseCommentPatterns = (rawValue: string) =>
  normalizeCommentPatterns(rawValue.split(/[,\n]/g));

const normalizeCommentPatterns = (patterns: readonly string[]) => {
  const unique: string[] = [];

  for (const pattern of patterns) {
    const normalizedPattern = pattern.trim();
    if (!normalizedPattern || unique.includes(normalizedPattern)) {
      continue;
    }
    unique.push(normalizedPattern);
  }

  return unique;
};

const computeArePatternsEqual = ({
  left,
  right,
}: {
  left: readonly string[];
  right: readonly string[];
}) =>
  left.length === right.length &&
  left.every((item, index) => item === right[index]);
