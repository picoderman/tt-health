import { readdirSync, statSync } from 'node:fs';
import { join, basename, dirname, resolve } from 'node:path';

import { Box, Text, useInput } from 'ink';
import { useState, useEffect, useCallback, useMemo, type FC } from 'react';

import { chars, palette } from '../consts.ts';

export interface FileTreeLabel {
  text: string;
  color: string;
  placement?: 'inline' | 'countColumn';
}

export interface FileTreeNode {
  id: string;
  name: string;
  path: string;
  isDirectory: boolean;
  depth: number;
  isLast: boolean;
  parentIsLast: boolean[];
  labels?: FileTreeLabel[];
}

export interface FileTreeSortEntry {
  name: string;
  path: string;
  isDirectory: boolean;
}

export interface FileTreeProps {
  rootPath: string;
  isActive?: boolean;
  dimNonActiveDepth?: boolean;
  onSelect?: (node: FileTreeNode) => void;
  onFocus?: (node: FileTreeNode, index: number, total: number) => void;
  showHidden?: boolean;
  maxDepth?: number;
  getLabels?: (node: FileTreeNode) => FileTreeLabel[];
  fileExtensions?: string[]; // Filter by file extensions, e.g. ['js', 'ts', 'jsx', 'tsx']
  excludeDirs?: string[]; // Exclude directories by name, e.g. ['node_modules']
  sortEntries?: (left: FileTreeSortEntry, right: FileTreeSortEntry) => number;
}

interface ExpandedState {
  [path: string]: boolean;
}

const COMMENT_COUNT_COLUMN_START = 62;
const MIN_COMMENT_LEADER_LENGTH = 4;

export const FileTree: FC<FileTreeProps> = ({
  rootPath,
  isActive = true,
  dimNonActiveDepth = false,
  onSelect,
  onFocus,
  showHidden = false,
  maxDepth = 10,
  getLabels,
  fileExtensions,
  excludeDirs,
  sortEntries,
}) => {
  const canonicalRootPath = resolve(rootPath);
  const [expanded, setExpanded] = useState<ExpandedState>({
    [canonicalRootPath]: true,
  });
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
          .filter((e) => showHidden || !e.name.startsWith('.'))
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
          const customSortResult = sortEntries?.(left, right) ?? 0;
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
        if (getLabels) {
          rootNode.labels = getLabels(rootNode);
        }
        nodes.push(rootNode);

        if (expanded[canonicalRootPath]) {
          traverse(canonicalRootPath, 1, [true]);
        }
      }
    } catch (error) {
      console.error(error);
    }

    return nodes;
  }, [
    canonicalRootPath,
    expanded,
    showHidden,
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
    setExpanded({ [canonicalRootPath]: true });
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
    onFocus?.(currentNode, selectedIndex, visibleNodes.length);
  }, [onFocus, selectedIndex, visibleNodes]);

  const toggleExpand = useCallback((path: string) => {
    setExpanded((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  }, []);

  const collapseSubtree = useCallback((path: string) => {
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
  }, []);

  const findParentIndex = useCallback(
    (node: FileTreeNode): number => {
      const parentPath = dirname(node.path);
      return visibleNodes.findIndex(
        (candidate) => candidate.path === parentPath,
      );
    },
    [visibleNodes],
  );

  useInput(
    (_, key) => {
      const currentNode = visibleNodes[selectedIndex];

      // Navigation
      if (key.downArrow) {
        setSelectedIndex((prev) => Math.min(prev + 1, visibleNodes.length - 1));
      } else if (key.upArrow) {
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
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

  const focusedNode = visibleNodes[selectedIndex];
  const focusedParentPath =
    focusedNode && focusedNode.depth > 0 ? dirname(focusedNode.path) : null;

  return (
    <Box flexDirection="column">
      {visibleNodes.map((node, index) => {
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
            dimNonActiveDepth={dimNonActiveDepth}
          />
        );
      })}
    </Box>
  );
};

interface FileTreeRowProps {
  node: FileTreeNode;
  isSelected: boolean;
  isExpanded: boolean;
  isInActiveLayer: boolean;
  dimNonActiveDepth: boolean;
}

const FileTreeRow: FC<FileTreeRowProps> = ({
  node,
  isSelected,
  isExpanded,
  isInActiveLayer,
  dimNonActiveDepth,
}) => {
  // Build prefix for tree lines
  const buildPrefix = (): string => {
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
  };

  const prefix = buildPrefix();
  const inlineLabels =
    node.labels?.filter((label) => label.placement !== 'countColumn') ?? [];
  const countColumnLabels =
    node.labels?.filter((label) => label.placement === 'countColumn') ?? [];

  // Icon based on type
  const icon = node.isDirectory
    ? isExpanded
      ? chars.folderOpen
      : chars.folderClosed
    : chars.file;

  const highlightActiveLayer = dimNonActiveDepth && isInActiveLayer;
  const isMonoMode = palette.colorMode === 'mono';
  const isColoredActiveLayer = highlightActiveLayer && !isMonoMode;

  const marker = isSelected ? '>' : highlightActiveLayer ? '•' : ' ';
  const markerColor = isSelected
    ? palette.accent
    : isColoredActiveLayer
      ? palette.info
      : palette.text;
  const markerBold = isSelected || (highlightActiveLayer && isMonoMode);

  const rowColor = isSelected
    ? palette.accent
    : isColoredActiveLayer
      ? palette.info
      : palette.text;
  const rowBold = isSelected || (highlightActiveLayer && isMonoMode);

  const iconColor = node.isDirectory
    ? isSelected
      ? palette.accentBright
      : rowColor
    : rowColor;

  const inlineLabelTextLength = inlineLabels.reduce(
    (total, label) => total + label.text.length + 3,
    0,
  );

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

  return (
    <Box flexDirection="row">
      <Text color={markerColor} bold={markerBold}>
        {marker}{' '}
      </Text>

      <Text color={rowColor}>
        {prefix}
      </Text>

      <Text color={iconColor}>{icon} </Text>

      <Text color={rowColor} bold={rowBold}>
        {node.name}
      </Text>

      {node.isDirectory && <Text color={rowColor}>/</Text>}

      {inlineLabels.map((label, i) => {
        const labelColor = isMonoMode ? palette.text : label.color;
        return (
          <Text key={`inline-${i}`} color={labelColor}>
            {' '}
            [{label.text}]
          </Text>
        );
      })}

      {countColumnLabels.length > 0 && (
        <Text color={rowColor} bold={rowBold}>
          {' '}{leader}{' '}
        </Text>
      )}

      {countColumnLabels.map((label, i) => {
        const labelColor = isMonoMode ? palette.text : label.color;
        return (
          <Text key={`column-${i}`} color={labelColor}>
            {i === 0 ? '' : ' '}[{label.text}]
          </Text>
        );
      })}
    </Box>
  );
};
