import { readdirSync, statSync } from 'node:fs';
import { join, basename, dirname, resolve } from 'node:path';

import { Box, Text, useInput } from 'ink';
import { useState, useEffect, useMemo, type FC } from 'react';
import useLatestCallback from 'use-latest-callback';

import { chars, palette } from '../consts.ts';
const DEFAULT_IS_ACTIVE = true as const;

const DEFAULT_DIM_NON_ACTIVE_DEPTH = false as const;
const DEFAULT_SHOW_HIDDEN = false as const;
const DEFAULT_MAX_DEPTH = 10;

export type FileTreeLabel = {
  text: string;
  color: string;
  placement?: 'inline' | 'countColumn';
};

export type FileTreeNode = {
  id: string;
  name: string;
  path: string;
  isDirectory: boolean;
  depth: number;
  isLast: boolean;
  parentIsLast: boolean[];
  labels?: FileTreeLabel[];
};

export type FileTreeSortEntry = {
  name: string;
  path: string;
  isDirectory: boolean;
};

export type OnFocusEvent = {
  node: FileTreeNode;
  index: number;
  total: number;
};

export type FileTreeProps = {
  rootPath: string;
  isActive?: boolean;
  isDimNonActiveDepth?: boolean;
  onSelect?: (node: FileTreeNode) => void;
  onFocus?: (event: OnFocusEvent) => void;
  isShowHidden?: boolean;
  maxDepth?: number;
  getLabels?: (node: FileTreeNode) => FileTreeLabel[];
  /** Filter by file extensions, e.g. ['js', 'ts', 'jsx', 'tsx'] */
  fileExtensions?: string[];
  /** Exclude directories by name, e.g. ['node_modules'] */
  excludeDirs?: string[];
  sortEntries?: (params: {
    left: FileTreeSortEntry;
    right: FileTreeSortEntry;
  }) => number;
};

type ExpandedState = {
  [path: string]: boolean;
};

const COMMENT_COUNT_COLUMN_START = 62;
const MIN_COMMENT_LEADER_LENGTH = 4;

export const FileTree = ({
  rootPath,
  isActive = DEFAULT_IS_ACTIVE,
  isDimNonActiveDepth = DEFAULT_DIM_NON_ACTIVE_DEPTH,
  onSelect,
  onFocus,
  isShowHidden = DEFAULT_SHOW_HIDDEN,
  maxDepth = DEFAULT_MAX_DEPTH,
  getLabels,
  fileExtensions,
  excludeDirs,
  sortEntries,
}: FileTreeProps) => {
  const canonicalRootPath = resolve(rootPath);
  const defaultExpandedState = useMemo(() => {
    return { [canonicalRootPath]: true } as const;
  }, [canonicalRootPath]);
  const [expanded, setExpanded] = useState<ExpandedState>(defaultExpandedState);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Build flat list of visible nodes
  const visibleNodes = useMemo(() => {
    const nodes: FileTreeNode[] = [];

    const traverse = (
      dirPath: string,
      depth: number,
      parentIsLast: boolean[],
    ) => {
      if (depth > maxDepth) return;

      try {
        const entries = readdirSync(dirPath, { withFileTypes: true });
        const filtered = entries
          .filter((e) => isShowHidden || !e.name.startsWith('.'))
          .filter((e) => {
            // Exclude specified directories
            if (e.isDirectory() && excludeDirs?.includes(e.name)) {
              return false;
            }
            return true;
          })
          .filter((e) => {
            // Filter files by extension (directories always shown for navigation)
            if (e.isDirectory()) return true;
            if (!fileExtensions || fileExtensions.length === 0) return true;

            const ext = e.name.split('.').pop()?.toLowerCase();
            return ext ? fileExtensions.includes(ext) : false;
          });

        const defaultSort = (a: FileTreeSortEntry, b: FileTreeSortEntry) => {
          if (a.isDirectory && !b.isDirectory) return -1;
          if (!a.isDirectory && b.isDirectory) return 1;
          return a.name.localeCompare(b.name);
        };

        const sorted = filtered.sort((a, b) => {
          const left: FileTreeSortEntry = {
            name: a.name,
            path: join(dirPath, a.name),
            isDirectory: a.isDirectory(),
          };
          const right: FileTreeSortEntry = {
            name: b.name,
            path: join(dirPath, b.name),
            isDirectory: b.isDirectory(),
          };
          const customSortResult = sortEntries?.({ left, right }) ?? 0;
          if (customSortResult !== 0) {
            return customSortResult;
          }
          return defaultSort(left, right);
        });

        sorted.forEach((entry, index) => {
          const entryPath = join(dirPath, entry.name);
          const isLast = index === sorted.length - 1;
          const isDir = entry.isDirectory();

          const node: FileTreeNode = {
            id: entryPath,
            name: entry.name,
            path: entryPath,
            isDirectory: isDir,
            depth,
            isLast,
            parentIsLast: [...parentIsLast],
          };
          if (getLabels) {
            node.labels = getLabels(node);
          }
          nodes.push(node);

          if (isDir && expanded[entryPath]) {
            traverse(entryPath, depth + 1, [...parentIsLast, isLast]);
          }
        });
      } catch {
        // Skip
      }
    };

    // Add root node
    try {
      const rootStat = statSync(canonicalRootPath);
      if (rootStat.isDirectory()) {
        const rootNode: FileTreeNode = {
          id: canonicalRootPath,
          name: basename(canonicalRootPath) || canonicalRootPath,
          path: canonicalRootPath,
          isDirectory: true,
          depth: 0,
          isLast: true,
          parentIsLast: [],
        };

        // DO: In case of labels changed, it will not rerender new values
        if (getLabels) {
          rootNode.labels = getLabels(rootNode);
        }
        nodes.push(rootNode);

        if (expanded[canonicalRootPath]) {
          traverse(canonicalRootPath, 1, [true]);
        }
      }
    } catch (error) {
      // DO: Collect logs into a file, because it's a TUI app and we can't show logs in console
      console.error(error);
    }

    return nodes;
  }, [
    canonicalRootPath,
    expanded,
    isShowHidden,
    maxDepth,
    getLabels,
    fileExtensions,
    excludeDirs,
    sortEntries,
  ]);

  const [prevRootPath, setPrevRootPath] = useState<string | null>(null);
  if (prevRootPath !== canonicalRootPath) {
    setPrevRootPath(canonicalRootPath);
    setSelectedIndex(0);
    setExpanded(defaultExpandedState);
    setError(null);
  }

  // Ensure selected index is in bounds
  useEffect(() => {
    if (selectedIndex >= visibleNodes.length) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedIndex(Math.max(0, visibleNodes.length - 1));
    }
  }, [visibleNodes.length, selectedIndex]);

  useEffect(() => {
    const currentNode = visibleNodes[selectedIndex];
    if (!currentNode) {
      return;
    }
    onFocus?.({
      node: currentNode,
      index: selectedIndex,
      total: visibleNodes.length,
    });
  }, [onFocus, selectedIndex, visibleNodes]);

  const toggleExpand = useLatestCallback((path: string) => {
    setExpanded((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  });

  const collapseSubtree = useLatestCallback((path: string) => {
    setExpanded((prev) => {
      const next = { ...prev };
      const childPrefix = `${path}/`;

      for (const key of Object.keys(next)) {
        if (key === path || key.startsWith(childPrefix)) {
          next[key] = false;
        }
      }

      return next;
    });
  });

  const findParentIndex = useLatestCallback((node: FileTreeNode) => {
    const parentPath = dirname(node.path);
    return visibleNodes.findIndex((candidate) => candidate.path === parentPath);
  });

  useInput(
    (_, key) => {
      const currentNode = visibleNodes[selectedIndex];

      // Navigation
      if (key.downArrow) {
        setSelectedIndex(Math.min(selectedIndex + 1, visibleNodes.length - 1));
      } else if (key.upArrow) {
        setSelectedIndex(Math.max(selectedIndex - 1, 0));
      } else if (key.rightArrow && currentNode?.isDirectory) {
        if (!expanded[currentNode.path]) {
          toggleExpand(currentNode.path);
        }
      } else if (key.leftArrow && currentNode) {
        if (currentNode.isDirectory && expanded[currentNode.path]) {
          collapseSubtree(currentNode.path);
        } else {
          const parentIndex = findParentIndex(currentNode);
          if (parentIndex >= 0) {
            setSelectedIndex(parentIndex);
          }
        }
      } else if (key.return && currentNode) {
        if (currentNode.isDirectory) {
          if (!expanded[currentNode.path]) {
            toggleExpand(currentNode.path);
          } else {
            onSelect?.(currentNode);
          }
        } else {
          onSelect?.(currentNode);
        }
      }
    },
    { isActive: isActive && visibleNodes.length > 0 },
  );

  const focusedNode = visibleNodes[selectedIndex];
  const focusedParentPath =
    focusedNode && focusedNode.depth > 0 ? dirname(focusedNode.path) : null;

  const nodesContent = useMemo(() => {
    return visibleNodes.map((node, index) => {
      const isSelected = index === selectedIndex;
      const isExpanded = expanded[node.path] ?? false;
      const isInActiveLayer = focusedNode
        ? focusedNode.depth === 0
          ? node.path === focusedNode.path
          : dirname(node.path) === focusedParentPath
        : false;

      return (
        <FileTreeRow
          key={node.id}
          node={node}
          isSelected={isSelected}
          isExpanded={isExpanded}
          isInActiveLayer={isInActiveLayer}
          isDimNonActiveDepth={isDimNonActiveDepth}
        />
      );
    });
  }, [
    expanded,
    focusedNode,
    focusedParentPath,
    isDimNonActiveDepth,
    selectedIndex,
    visibleNodes,
  ]);

  if (error) {
    return (
      <Box>
        <Text color={palette.error}>{error}</Text>
      </Box>
    );
  }

  if (visibleNodes.length === 0) {
    return (
      <Box>
        <Text color={palette.textDim}>Empty directory</Text>
      </Box>
    );
  }

  return <Box flexDirection="column">{nodesContent}</Box>;
};

type FileTreeRowProps = {
  node: FileTreeNode;
  isSelected: boolean;
  isExpanded: boolean;
  isInActiveLayer: boolean;
  isDimNonActiveDepth: boolean;
};

const FileTreeRow: FC<FileTreeRowProps> = ({
  node,
  isSelected,
  isExpanded,
  isInActiveLayer,
  isDimNonActiveDepth,
}) => {
  // Build prefix for tree lines
  const buildPrefix = useLatestCallback(() => {
    if (node.depth === 0) return '';

    let prefix = '';

    // Add vertical lines for parent levels
    for (let i = 0; i < node.parentIsLast.length; i++) {
      prefix += node.parentIsLast[i] ? '  ' : `${chars.treeVertical} `;
    }

    // Add branch character
    prefix += node.isLast
      ? `${chars.treeLastBranch}${chars.treeHorizontal}`
      : `${chars.treeBranch}${chars.treeHorizontal}`;

    return prefix;
  });

  const prefix = buildPrefix();
  const inlineLabels = useMemo(() => {
    return (
      node.labels?.filter((label) => label.placement !== 'countColumn') ?? []
    );
  }, [node.labels]);
  const countColumnLabels = useMemo(() => {
    return (
      node.labels?.filter((label) => label.placement === 'countColumn') ?? []
    );
  }, [node.labels]);

  // Icon based on type
  const icon = node.isDirectory
    ? isExpanded
      ? chars.folderOpen
      : chars.folderClosed
    : chars.file;

  const isHighlightActiveLayer = isDimNonActiveDepth && isInActiveLayer;
  const isMonoMode = palette.colorMode === 'mono';
  const isColoredActiveLayer = isHighlightActiveLayer && !isMonoMode;

  const marker = isSelected ? '>' : isHighlightActiveLayer ? '•' : ' ';
  const markerColor = isSelected
    ? palette.accent
    : isColoredActiveLayer
      ? palette.info
      : palette.text;
  const markerBold = isSelected || (isHighlightActiveLayer && isMonoMode);

  const rowColor = isSelected
    ? palette.accent
    : isColoredActiveLayer
      ? palette.info
      : palette.text;
  const rowBold = isSelected || (isHighlightActiveLayer && isMonoMode);

  const iconColor = node.isDirectory
    ? isSelected
      ? palette.accentBright
      : rowColor
    : rowColor;

  const inlineLabelTextLength = useMemo(() => {
    return inlineLabels.reduce(
      (total, label) => total + label.text.length + 3,
      0,
    );
  }, [inlineLabels]);

  const rowContentLength =
    prefix.length +
    icon.length +
    1 +
    node.name.length +
    (node.isDirectory ? 1 : 0) +
    inlineLabelTextLength;

  const leaderLength =
    countColumnLabels.length === 0
      ? 0
      : Math.max(
          MIN_COMMENT_LEADER_LENGTH,
          COMMENT_COUNT_COLUMN_START - rowContentLength,
        );
  const leader = leaderLength > 0 ? '·'.repeat(leaderLength) : '';

  const renderedInlineLabels = useMemo(() => {
    return inlineLabels.map((label, i) => {
      const labelColor = isMonoMode ? palette.text : label.color;
      return (
        <Text key={`inline-${i.toString()}`} color={labelColor}>
          {` [${label.text}]`}
        </Text>
      );
    });
  }, [inlineLabels, isMonoMode]);

  const renderedCountColumnLabels = useMemo(() => {
    return countColumnLabels.map((label, i) => {
      const labelColor = isMonoMode ? palette.text : label.color;
      return (
        <Text key={`column-${i.toString()}`} color={labelColor}>
          {i === 0 ? '' : ' '}[{label.text}]
        </Text>
      );
    });
  }, [countColumnLabels, isMonoMode]);

  return (
    <Box flexDirection="row">
      <Text color={markerColor} bold={markerBold}>
        {`${marker} `}
      </Text>

      <Text color={rowColor}>{prefix}</Text>

      <Text color={iconColor}>{icon} </Text>

      <Text color={rowColor} bold={rowBold}>
        {node.name}
      </Text>

      {node.isDirectory && <Text color={rowColor}>/</Text>}

      {renderedInlineLabels}

      {countColumnLabels.length > 0 && (
        <Text color={rowColor} bold={rowBold}>
          {` ${leader} `}
        </Text>
      )}

      {renderedCountColumnLabels}
    </Box>
  );
};
