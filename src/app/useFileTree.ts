import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { useState, useCallback, useMemo, useRef } from 'react';

import type {
  FileTreeLabel,
  FileTreeNode,
  FileTreeSortEntry,
} from '../tui-kit/components/FileTree.tsx';
import { palette } from '../tui-kit/consts.ts';

import { EXCLUDED_DIRS, FILE_EXTENSIONS, getLabelRules } from './consts.ts';

type PatternCounts = Record<string, number>;
type CountMap = Map<string, PatternCounts>;

interface FileCommentCacheEntry {
  hash: string;
  size: number;
  mtimeMs: number;
  patternCounts: Record<string, number>;
}

type RootFileCommentCache = Record<string, FileCommentCacheEntry>;

interface BuildCommentCountMapResult {
  countMap: CountMap;
  nextRootCache: RootFileCommentCache;
}

interface FileCommentCountResult {
  counts: PatternCounts;
  cacheEntry?: FileCommentCacheEntry;
}

const FILE_EXTENSION_SET = new Set<string>(FILE_EXTENSIONS);
const EXCLUDED_DIR_SET = new Set<string>(EXCLUDED_DIRS);

const isJsTsFile = (name: string): boolean => {
  const extension = name.split('.').pop()?.toLowerCase();
  return extension ? FILE_EXTENSION_SET.has(extension) : false;
};

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const countMatches = (content: string, pattern: string): number => {
  const regex = new RegExp(escapeRegExp(pattern), 'g');
  return (content.match(regex) ?? []).length;
};

const createEmptyCounts = (patterns: readonly string[]): PatternCounts =>
  Object.fromEntries(patterns.map((pattern) => [pattern, 0]));

const selectPatternCounts = (
  allPatternCounts: Record<string, number>,
  patterns: readonly string[],
): PatternCounts =>
  patterns.reduce<PatternCounts>((counts, pattern) => {
    counts[pattern] = allPatternCounts[pattern] ?? 0;
    return counts;
  }, createEmptyCounts(patterns));

const hasPatternCounts = (
  allPatternCounts: Record<string, number>,
  patterns: readonly string[],
): boolean =>
  patterns.every(
    (pattern) =>
      typeof allPatternCounts[pattern] === 'number' &&
      Number.isFinite(allPatternCounts[pattern]),
  );

const getContentHash = (content: string): string =>
  createHash('sha1').update(content).digest('hex');

const getFileCommentCounts = (
  path: string,
  patterns: readonly string[],
  cachedEntry?: FileCommentCacheEntry,
): FileCommentCountResult => {
  try {
    const stats = statSync(path);
    if (!stats.isFile()) {
      return {
        counts: createEmptyCounts(patterns),
      };
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
      };
    }

    const content = readFileSync(path, 'utf8');
    const contentHash = getContentHash(content);

    if (cachedEntry && cachedEntry.hash === contentHash) {
      const nextPatternCounts = { ...cachedEntry.patternCounts };
      let shouldUpdateCache =
        cachedEntry.size !== stats.size ||
        cachedEntry.mtimeMs !== stats.mtimeMs;

      for (const pattern of patterns) {
        if (typeof nextPatternCounts[pattern] === 'number') {
          continue;
        }
        nextPatternCounts[pattern] = countMatches(content, pattern);
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
      };
    }

    const nextPatternCounts: Record<string, number> = {};
    for (const pattern of patterns) {
      nextPatternCounts[pattern] = countMatches(content, pattern);
    }

    return {
      counts: selectPatternCounts(nextPatternCounts, patterns),
      cacheEntry: {
        hash: contentHash,
        size: stats.size,
        mtimeMs: stats.mtimeMs,
        patternCounts: nextPatternCounts,
      },
    };
  } catch {
    if (!cachedEntry) {
      return {
        counts: createEmptyCounts(patterns),
      };
    }

    return {
      counts: selectPatternCounts(cachedEntry.patternCounts, patterns),
      cacheEntry: cachedEntry,
    };
  }
};

const sumCounts = (
  left: PatternCounts,
  right: PatternCounts,
  patterns: readonly string[],
): PatternCounts => {
  return patterns.reduce<PatternCounts>((counts, pattern) => {
    counts[pattern] = (left[pattern] ?? 0) + (right[pattern] ?? 0);
    return counts;
  }, createEmptyCounts(patterns));
};

const buildCommentCountMap = (
  rootPath: string,
  patterns: readonly string[],
  rootCache: RootFileCommentCache,
): BuildCommentCountMapResult => {
  const countMap: CountMap = new Map();
  const nextRootCache: RootFileCommentCache = {};

  const walk = (path: string): PatternCounts => {
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
          counts = sumCounts(counts, walk(entryPath), patterns);
          continue;
        }

        if (!isJsTsFile(entry.name)) {
          continue;
        }

        const previousEntry = rootCache[entryPath];
        const { counts: fileCount, cacheEntry: nextCacheEntry } =
          getFileCommentCounts(entryPath, patterns, previousEntry);

        if (nextCacheEntry) {
          nextRootCache[entryPath] = nextCacheEntry;
        }

        countMap.set(entryPath, fileCount);
        counts = sumCounts(counts, fileCount, patterns);
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
  };
};

export function useFileTree(
  rootPath: string | undefined,
  commentPatterns: readonly string[],
) {
  const [selectedFile, setSelectedFile] = useState<FileTreeNode | null>(null);
  const cacheByRootRef = useRef<Record<string, RootFileCommentCache>>({});

  const { commentCountMap } = useMemo(() => {
    if (!rootPath || commentPatterns.length === 0) {
      return {
        commentCountMap: new Map<string, PatternCounts>(),
      };
    }

    // eslint-disable-next-line react-hooks/refs
    const currentRootCache = cacheByRootRef.current[rootPath] ?? {};
    const buildResult = buildCommentCountMap(
      rootPath,
      commentPatterns,
      // eslint-disable-next-line react-hooks/refs
      currentRootCache,
    );

    // eslint-disable-next-line react-hooks/refs
    cacheByRootRef.current[rootPath] = buildResult.nextRootCache;

    return {
      commentCountMap: buildResult.countMap,
    };
  }, [rootPath, commentPatterns]);

  const handleSelect = useCallback((node: FileTreeNode) => {
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
  }, []);

  const getLabels = useCallback(
    (node: FileTreeNode): FileTreeLabel[] => {
      const labels: FileTreeLabel[] = [];

      for (const rule of getLabelRules()) {
        if (rule.test(node.name, node.isDirectory)) {
          labels.push(rule.label);
        }
      }

      const nodeCounts = commentCountMap.get(node.path);
      if (!nodeCounts) {
        return labels;
      }

      for (const pattern of commentPatterns) {
        const count = nodeCounts[pattern] ?? 0;
        if (count <= 0) {
          continue;
        }

        labels.push({
          text: `${pattern}: ${count}`,
          color: palette.info,
          placement: 'countColumn',
        });
      }

      return labels;
    },
    [commentCountMap, commentPatterns],
  );

  const getTotalCommentCount = useCallback(
    (nodePath: string): number => {
      const counts = commentCountMap.get(nodePath);
      if (!counts) {
        return 0;
      }
      return commentPatterns.reduce(
        (total, pattern) => total + (counts[pattern] ?? 0),
        0,
      );
    },
    [commentCountMap, commentPatterns],
  );

  const sortEntries = useCallback(
    (left: FileTreeSortEntry, right: FileTreeSortEntry): number => {
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
    [getTotalCommentCount],
  );

  return { selectedFile, handleSelect, getLabels, sortEntries } as const;
}
