import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type {
  DevelopmentHistoryDetail,
  DevelopmentHistoryEntry,
} from '../types/index.js';

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const historyDir = path.resolve(moduleDir, '../../data/development-history');
const historyIndexPath = path.join(historyDir, 'index.json');
const historyEntriesDir = path.join(historyDir, 'entries');
const changeHashPattern = /^[a-f0-9]{7,40}$/i;

function isFileMissing(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT';
}

function sortEntries(entries: DevelopmentHistoryEntry[]): DevelopmentHistoryEntry[] {
  return [...entries].sort(
    (left, right) => new Date(right.date).getTime() - new Date(left.date).getTime(),
  );
}

async function loadHistoryIndex(): Promise<DevelopmentHistoryEntry[]> {
  try {
    const raw = await readFile(historyIndexPath, 'utf8');
    const entries = JSON.parse(raw) as DevelopmentHistoryEntry[];
    return sortEntries(entries);
  } catch (error) {
    if (isFileMissing(error)) {
      return [];
    }

    throw new Error('Failed to load development history index');
  }
}

export function isValidDevelopmentHistoryHash(hash: string): boolean {
  return changeHashPattern.test(hash);
}

export async function getDevelopmentHistoryEntries(): Promise<DevelopmentHistoryEntry[]> {
  return loadHistoryIndex();
}

export async function getDevelopmentHistoryEntry(
  hash: string,
): Promise<DevelopmentHistoryDetail | null> {
  const entries = await loadHistoryIndex();
  const entry = entries.find((item) => item.hash === hash);

  if (!entry) {
    return null;
  }

  try {
    const content = await readFile(path.join(historyEntriesDir, `${hash}.md`), 'utf8');
    return {
      ...entry,
      content,
    };
  } catch (error) {
    if (isFileMissing(error)) {
      return null;
    }

    throw new Error(`Failed to load development history entry: ${hash}`);
  }
}
