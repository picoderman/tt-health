import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { useState, useMemo, useRef } from 'react';
import useLatestCallback from 'use-latest-callback';

import type {
  FileTreeLabel,
  FileTreeNode,
  FileTreeSortEntry,
} from '../tui-kit/components/FileTree.tsx';
import { palette } from '../tui-kit/consts.ts';

import { EXCLUDED_DIRS, FILE_EXTENSIONS, labelRules } from './consts.ts';

type PatternCount = Record<string, number>;
type CountMap = Map<string, PatternCount>;

type FileCommentCacheEntry = {
  hash: string;
  size: number;
  mtimeMs: number;
  patternCounts: Record<string, number>;
};

type RootFileCommentCache = Record<string, FileCommentCacheEntry>;

const FILE_EXTENSION_SET = new Set<string>(FILE_EXTENSIONS);
const EXCLUDED_DIR_SET = new Set<string>(EXCLUDED_DIRS);

export const useFileTree = (
  rootPath: string | undefined,
  commentPatterns: readonly string[],
) => {
  const [selectedFile, setSelectedFile] = useState<FileTreeNode | null>(null);
  const cacheByRootRef = useRef<Record<string, RootFileCommentCache>>({});

  const { commentCountMap } = useMemo(() => {
    if (!rootPath || commentPatterns.length === 0) {
      return {
        commentCountMap: new Map<string, PatternCount>(),
      } as const;
    }

    // eslint-disable-next-line react-hooks/refs
    const currentRootCache = cacheByRootRef.current[rootPath] ?? {};
    // eslint-disable-next-line react-hooks/refs
    const buildResult = buildCommentCountMap({
      rootPath,
      patterns: commentPatterns,
      // eslint-disable-next-line react-hooks/refs
      rootCache: currentRootCache,
    });

    // eslint-disable-next-line react-hooks/refs
    cacheByRootRef.current[rootPath] = buildResult.nextRootCache;

    return {
      commentCountMap: buildResult.countMap,
    } as const;
  }, [rootPath, commentPatterns]);

  const onSelect = useLatestCallback((node: FileTreeNode) => {
    setSelectedFile(node);
    if (node.isDirectory) {
      return;
    }

    const child = spawn('open', [node.path], {
      detached: true,
      stdio: 'ignore',
    });
    child.once('error', () => {
      // Intentionally ignore OS open errors to keep the TUI responsive.
    });
    child.unref();
  });

  const getLabels = useLatestCallback((node: FileTreeNode) => {
    const labels: FileTreeLabel[] = [];

    for (const rule of labelRules) {
      if (rule.test(node.name, node.isDirectory)) {
        labels.push(rule.label);
      }
    }

    const nodeCounts = commentCountMap.get(node.path);
    if (!nodeCounts || Object.keys(nodeCounts).length === 0) {
      return labels;
    }

    for (const pattern of commentPatterns) {
      const count = nodeCounts[pattern] ?? 0;
      if (count <= 0) {
        continue;
      }

      labels.push({
        text: `${pattern}: ${count.toString()}`,
        color: palette.info,
        placement: 'countColumn',
      });
    }

    return labels;
  });

  const getTotalCommentCount = useLatestCallback((nodePath: string) => {
    const counts = commentCountMap.get(nodePath);
    if (!counts || Object.keys(counts).length === 0) {
      return 0;
    }
    return commentPatterns.reduce(
      (total, pattern) => total + (counts[pattern] ?? 0),
      0,
    );
  });

  const sortEntries = useLatestCallback(
    ({
      left,
      right,
    }: {
      left: FileTreeSortEntry;
      right: FileTreeSortEntry;
    }) => {
      // Keep directories grouped first for easier tree navigation.
      if (left.isDirectory && !right.isDirectory) return -1;
      if (!left.isDirectory && right.isDirectory) return 1;

      const leftCount = getTotalCommentCount(left.path);
      const rightCount = getTotalCommentCount(right.path);
      if (leftCount !== rightCount) {
        return rightCount - leftCount;
      }

      return left.name.localeCompare(right.name);
    },
  );

  return useMemo(() => {
    return { selectedFile, onSelect, getLabels, sortEntries } as const;
  }, [getLabels, onSelect, selectedFile, sortEntries]);
};

const isJsTsFile = (name: string) => {
  const extension = name.split('.').pop()?.toLowerCase();
  return extension ? FILE_EXTENSION_SET.has(extension) : false;
};

const createEmptyCounts = (patterns: readonly string[]) =>
  Object.fromEntries(patterns.map((pattern) => [pattern, 0]));

const sumCounts = ({
  left,
  right,
  patterns,
}: {
  left: PatternCount;
  right: PatternCount;
  patterns: readonly string[];
}) => {
  return patterns.reduce<PatternCount>((counts, pattern) => {
    counts[pattern] = (left[pattern] ?? 0) + (right[pattern] ?? 0);
    return counts;
  }, createEmptyCounts(patterns));
};

const countMatches = ({
  content,
  pattern,
}: {
  content: string;
  pattern: string;
}) => {
  const regex = new RegExp(escapePattern(pattern), 'g');
  return (content.match(regex) ?? []).length;
};

const escapePattern = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const selectPatternCounts = (
  allPatternCounts: Record<string, number>,
  patterns: readonly string[],
) =>
  patterns.reduce<PatternCount>((counts, pattern) => {
    counts[pattern] = allPatternCounts[pattern] ?? 0;
    return counts;
  }, createEmptyCounts(patterns));

const hasPatternCounts = (
  allPatternCounts: Record<string, number>,
  patterns: readonly string[],
) =>
  patterns.every(
    (pattern) =>
      typeof allPatternCounts[pattern] === 'number' &&
      Number.isFinite(allPatternCounts[pattern]),
  );

const buildCommentCountMap = ({
  rootPath,
  patterns,
  rootCache,
}: {
  rootPath: string;
  patterns: readonly string[];
  rootCache: RootFileCommentCache;
}) => {
  const countMap: CountMap = new Map();
  const nextRootCache: RootFileCommentCache = {};

  const walk = (path: string) => {
    let counts = createEmptyCounts(patterns);

    try {
      const entries = readdirSync(path, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.name.startsWith('.')) {
          continue;
        }

        if (entry.isDirectory() && EXCLUDED_DIR_SET.has(entry.name)) {
          continue;
        }

        const entryPath = join(path, entry.name);

        if (entry.isDirectory()) {
          counts = sumCounts({
            left: counts,
            right: walk(entryPath),
            patterns,
          });
          continue;
        }

        if (!isJsTsFile(entry.name)) {
          continue;
        }

        const previousEntry = rootCache[entryPath];
        const { counts: fileCount, cacheEntry: nextCacheEntry } =
          computeFileCommentCounts({
            path: entryPath,
            patterns,
            cachedEntry: previousEntry,
          });

        if (nextCacheEntry) {
          nextRootCache[entryPath] = nextCacheEntry;
        }

        countMap.set(entryPath, fileCount);
        counts = sumCounts({
          left: counts,
          right: fileCount,
          patterns,
        });
      }
    } catch {
      return counts;
    }

    countMap.set(path, counts);
    return counts;
  };

  walk(rootPath);

  return {
    countMap,
    nextRootCache,
  } as const;
};

const computeFileCommentCounts = ({
  path,
  patterns,
  cachedEntry,
}: {
  path: string;
  patterns: readonly string[];
  cachedEntry?: FileCommentCacheEntry;
}) => {
  try {
    const stats = statSync(path);
    if (!stats.isFile()) {
      return {
        counts: createEmptyCounts(patterns),
      } as const;
    }

    if (
      cachedEntry &&
      cachedEntry.size === stats.size &&
      cachedEntry.mtimeMs === stats.mtimeMs &&
      hasPatternCounts(cachedEntry.patternCounts, patterns)
    ) {
      return {
        counts: selectPatternCounts(cachedEntry.patternCounts, patterns),
        cacheEntry: cachedEntry,
      } as const;
    }

    const content = readFileSync(path, 'utf8');
    const contentHash = computeContentHash(content);

    if (cachedEntry && cachedEntry.hash === contentHash) {
      const nextPatternCounts = { ...cachedEntry.patternCounts };
      let shouldUpdateCache =
        cachedEntry.size !== stats.size ||
        cachedEntry.mtimeMs !== stats.mtimeMs;

      for (const pattern of patterns) {
        if (typeof nextPatternCounts[pattern] === 'number') {
          continue;
        }
        nextPatternCounts[pattern] = countMatches({ content, pattern });
        shouldUpdateCache = true;
      }

      const nextCacheEntry = shouldUpdateCache
        ? {
            hash: contentHash,
            size: stats.size,
            mtimeMs: stats.mtimeMs,
            patternCounts: nextPatternCounts,
          }
        : cachedEntry;

      return {
        counts: selectPatternCounts(nextPatternCounts, patterns),
        cacheEntry: nextCacheEntry,
      } as const;
    }

    const nextPatternCounts: Record<string, number> = {};
    for (const pattern of patterns) {
      nextPatternCounts[pattern] = countMatches({ content, pattern });
    }

    return {
      counts: selectPatternCounts(nextPatternCounts, patterns),
      cacheEntry: {
        hash: contentHash,
        size: stats.size,
        mtimeMs: stats.mtimeMs,
        patternCounts: nextPatternCounts,
      },
    } as const;
  } catch {
    if (!cachedEntry) {
      return {
        counts: createEmptyCounts(patterns),
      } as const;
    }

    return {
      counts: selectPatternCounts(cachedEntry.patternCounts, patterns),
      cacheEntry: cachedEntry,
    } as const;
  }
};

const computeContentHash = (content: string) =>
  createHash('sha1').update(content).digest('hex');
