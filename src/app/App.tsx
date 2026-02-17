import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import { useEffect, useState, type FC } from 'react';

import { useAppState } from '../state/useAppState.js';
import { FileTree } from '../tui-kit/components/FileTree.tsx';
import { Hint } from '../tui-kit/components/Hint.tsx';
import { ScrollBox } from '../tui-kit/components/ScrollBox.tsx';
import { Section } from '../tui-kit/components/Section.tsx';
import { palette } from '../tui-kit/consts.ts';

import {
  COMMENT_PATTERNS_STATE_KEY,
  DEFAULT_COMMENT_PATTERNS,
  EXCLUDED_DIRS,
  FILE_EXTENSIONS,
  MAX_COMMENT_PATTERNS,
} from './consts.ts';
import { StatusBar } from './StatusBar.tsx';
import { useFileTree } from './useFileTree.ts';

const normalizeCommentPatterns = (patterns: readonly string[]): string[] => {
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

const parseCommentPatterns = (rawValue: string): string[] =>
  normalizeCommentPatterns(rawValue.split(/[,\n]/g));

const areEqual = (left: readonly string[], right: readonly string[]): boolean =>
  left.length === right.length &&
  left.every((item, index) => item === right[index]);

const TREE_SECTION_FOCUS_OFFSET = 2;

interface AppProps {
  dir: string;
}

export const App: FC<AppProps> = ({ dir }) => {
  const [commentPatterns, setCommentPatterns] = useAppState<string[]>(
    COMMENT_PATTERNS_STATE_KEY,
    [...DEFAULT_COMMENT_PATTERNS].slice(0, MAX_COMMENT_PATTERNS),
  );
  const [isEditingPatterns, setIsEditingPatterns] = useState(false);
  const [commentPatternsInput, setCommentPatternsInput] = useState(
    commentPatterns.join(', '),
  );
  const [commentPatternError, setCommentPatternError] = useState<string | null>(
    null,
  );
  const [treeFocus, setTreeFocus] = useState({ index: 0, total: 0 });

  useEffect(() => {
    const clampedPatterns = normalizeCommentPatterns(commentPatterns).slice(
      0,
      MAX_COMMENT_PATTERNS,
    );

    if (!areEqual(commentPatterns, clampedPatterns))
      setCommentPatterns(clampedPatterns);
  }, [commentPatterns, setCommentPatterns]);

  const { selectedFile, handleSelect, getLabels, sortEntries } = useFileTree(
    dir,
    commentPatterns,
  );

  const saveCommentPatterns = (rawValue: string) => {
    const parsedPatterns = parseCommentPatterns(rawValue);
    if (parsedPatterns.length === 0) {
      setCommentPatternError('Add at least one marker.');
      return;
    }

    if (parsedPatterns.length > MAX_COMMENT_PATTERNS) {
      setCommentPatternError(`Max ${MAX_COMMENT_PATTERNS} markers.`);
      return;
    }

    setCommentPatterns(parsedPatterns);
    setCommentPatternError(null);
    setIsEditingPatterns(false);
  };

  useInput((input, key) => {
    if (isEditingPatterns) {
      if (key.escape) {
        setCommentPatternsInput(commentPatterns.join(', '));
        setCommentPatternError(null);
        setIsEditingPatterns(false);
      }
      return;
    }

    const normalizedInput = input.toLowerCase();

    if (normalizedInput === 'c') {
      setCommentPatternsInput(commentPatterns.join(', '));
      setCommentPatternError(null);
      setIsEditingPatterns(true);
    }
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
                dimNonActiveDepth={true}
                onFocus={(_, index, total) => {
                  setTreeFocus((prev) => {
                    if (prev.index === index && prev.total === total) {
                      return prev;
                    }
                    return { index, total };
                  });
                }}
                onSelect={handleSelect}
                showHidden={false}
                getLabels={getLabels}
                sortEntries={sortEntries}
                fileExtensions={[...FILE_EXTENSIONS]}
                excludeDirs={[...EXCLUDED_DIRS]}
              />
            </Section>

            {isEditingPatterns && (
              <Box marginTop={1} flexDirection="column">
                <Text color={palette.textDim}>
                  Comment markers (comma/newline separated, max 4):
                </Text>

                <TextInput
                  value={commentPatternsInput}
                  onChange={setCommentPatternsInput}
                  onSubmit={saveCommentPatterns}
                  focus={true}
                  placeholder="TODO:, @ts-ignore"
                />

                {commentPatternError && (
                  <Text color={palette.error}>{commentPatternError}</Text>
                )}

                <Hint text="Enter save | Esc cancel" />
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
