import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { execFile as execFileCallback } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import type {
  DevelopmentHistoryDetail,
  DevelopmentHistoryEntry,
} from '../types/index.js';
import { generateDevelopmentHistoryMarkdown as generateDevelopmentHistoryMarkdownWithLLM } from './llmService.js';

const execFile = promisify(execFileCallback);

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(moduleDir, '../../..');
const historyDir = path.resolve(moduleDir, '../../data/development-history');
const historyIndexPath = path.join(historyDir, 'index.json');
const historyEntriesDir = path.join(historyDir, 'entries');
const changeHashPattern = /^[a-f0-9]{7,40}$/i;
const markdownFallbackSummary =
  'This entry was automatically generated from git commit metadata because summary generation was unavailable.';

type CommandRunner = (command: string, args: string[]) => Promise<string>;

export interface GitCommitMetadata {
  hash: string;
  title: string;
  date: string;
  author: string;
}

interface GitScopeContext {
  repoRoot: string;
  pathSpec: string;
}

interface GitCommitDetails extends GitCommitMetadata {
  body: string;
  files: string[];
}

let gitScopeContextPromise: Promise<GitScopeContext> | null = null;

async function runCommand(command: string, args: string[]): Promise<string> {
  const { stdout } = await execFile(command, args, {
    encoding: 'utf8',
  });

  return stdout.trim();
}

function normalizePathSpec(value: string): string {
  const normalized = value.replace(/\\/g, '/');
  return normalized.length > 0 ? normalized : '.';
}

function parseGitCommitHashes(output: string): string[] {
  return output
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && isValidDevelopmentHistoryHash(line));
}

function filterEntriesByGitHashes(
  entries: DevelopmentHistoryEntry[],
  commitHashes: string[],
): DevelopmentHistoryEntry[] {
  return entries.filter((entry) =>
    commitHashes.some((commit) => commit === entry.hash || commit.startsWith(entry.hash)),
  );
}

async function getGitScopeContext(): Promise<GitScopeContext> {
  if (!gitScopeContextPromise) {
    gitScopeContextPromise = (async () => {
      const repoRoot = (await runCommand('git', ['rev-parse', '--show-toplevel'])).trim();
      return {
        repoRoot,
        pathSpec: normalizePathSpec(path.relative(repoRoot, projectRoot)),
      };
    })();
  }

  return gitScopeContextPromise;
}

async function runRepoGit(args: string[]): Promise<string> {
  const { repoRoot } = await getGitScopeContext();
  const { stdout } = await execFile('git', args, {
    cwd: repoRoot,
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024,
  });

  return stdout.trim();
}

function isFileMissing(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT';
}

function sortEntries(entries: DevelopmentHistoryEntry[]): DevelopmentHistoryEntry[] {
  return [...entries].sort(
    (left, right) => new Date(right.date).getTime() - new Date(left.date).getTime(),
  );
}

function areEntriesEqual(
  left: DevelopmentHistoryEntry[],
  right: DevelopmentHistoryEntry[],
): boolean {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((entry, index) => {
    const other = right[index];
    return (
      entry.hash === other.hash
      && entry.title === other.title
      && entry.date === other.date
      && entry.author === other.author
    );
  });
}

async function writeHistoryIndex(entries: DevelopmentHistoryEntry[]): Promise<void> {
  await mkdir(historyDir, { recursive: true });
  await writeFile(historyIndexPath, `${JSON.stringify(entries, null, 2)}\n`, 'utf8');
}

async function getGitHistoryEntries(): Promise<DevelopmentHistoryEntry[]> {
  const { pathSpec } = await getGitScopeContext();
  const output = await runRepoGit([
    'log',
    '--pretty=format:%H%x1f%s%x1f%cI%x1f%an',
    '--',
    pathSpec,
  ]);

  if (output.length === 0) {
    return [];
  }

  const seenHashes = new Set<string>();
  const entries: DevelopmentHistoryEntry[] = [];

  for (const line of output.split('\n')) {
    const [fullHash, title, date, author] = line.split('\u001f');

    if (!fullHash || !date || !author || !isValidDevelopmentHistoryHash(fullHash)) {
      continue;
    }

    const hash = fullHash.slice(0, 7);

    if (seenHashes.has(hash)) {
      continue;
    }

    seenHashes.add(hash);
    entries.push({
      hash,
      title: title?.trim() || `commit ${hash}`,
      date,
      author,
    });
  }

  return sortEntries(entries);
}

async function filterEntriesBackedByScopedGitCommits(
  entries: DevelopmentHistoryEntry[],
): Promise<DevelopmentHistoryEntry[]> {
  const { pathSpec } = await getGitScopeContext();
  const output = await runRepoGit([
    'log',
    '--pretty=format:%H',
    '--',
    pathSpec,
  ]);

  return sortEntries(filterEntriesByGitHashes(entries, parseGitCommitHashes(output)));
}

async function syncHistoryIndexWithGit(): Promise<DevelopmentHistoryEntry[]> {
  const currentEntries = await loadHistoryIndex();

  try {
    const gitEntries = await getGitHistoryEntries();

    if (!areEntriesEqual(currentEntries, gitEntries)) {
      await writeHistoryIndex(gitEntries);
    }

    return gitEntries;
  } catch (error) {
    try {
      const verifiedCachedEntries = await filterEntriesBackedByScopedGitCommits(currentEntries);

      if (!areEntriesEqual(currentEntries, verifiedCachedEntries)) {
        await writeHistoryIndex(verifiedCachedEntries);
      }

      return verifiedCachedEntries;
    } catch (fallbackError) {
      console.warn(
        'Unable to verify development history from git, hiding cached entries',
        fallbackError instanceof Error ? fallbackError : error,
      );
      return [];
    }
  }
}

async function getGitCommitDetails(hash: string): Promise<GitCommitDetails | null> {
  const { pathSpec } = await getGitScopeContext();

  try {
    const metadataOutput = await runRepoGit([
      'show',
      '--quiet',
      '--format=%H%x1f%s%x1f%cI%x1f%an%x1f%b',
      hash,
      '--',
      pathSpec,
    ]);
    const [fullHash, title, date, author, body = ''] = metadataOutput.split('\u001f', 5);

    if (!fullHash || !title || !date || !author || !isValidDevelopmentHistoryHash(fullHash)) {
      return null;
    }

    const fileOutput = await runRepoGit([
      'show',
      '--pretty=format:',
      '--name-only',
      fullHash,
      '--',
      pathSpec,
    ]);

    const files = fileOutput
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    return {
      hash: fullHash.slice(0, 7),
      title: title.trim(),
      date,
      author,
      body: body.trim(),
      files,
    };
  } catch {
    return null;
  }
}

async function loadOrGenerateHistoryMarkdown(entry: DevelopmentHistoryEntry): Promise<string> {
  const entryPath = path.join(historyEntriesDir, `${entry.hash}.md`);

  try {
    return await readFile(entryPath, 'utf8');
  } catch (error) {
    if (!isFileMissing(error)) {
      throw new Error(`Failed to load development history entry: ${entry.hash}`);
    }
  }

  const details = await getGitCommitDetails(entry.hash);
  const markdown = await generateDevelopmentHistoryMarkdownWithLLM({
    hash: entry.hash,
    title: details?.title ?? entry.title,
    date: details?.date ?? entry.date,
    author: details?.author ?? entry.author,
    body: details?.body ?? '',
    files: details?.files ?? [],
  });

  await mkdir(historyEntriesDir, { recursive: true });
  await writeFile(entryPath, markdown, 'utf8');
  return markdown;
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

export async function getLatestGitCommitMetadata(
  run: CommandRunner = runCommand,
): Promise<GitCommitMetadata> {
  const output = await run('git', ['log', '-1', '--pretty=format:%H%x1f%s%x1f%cI%x1f%an']);
  const [hash, title, date, author] = output.split('\u001f');

  if (!hash || !title || !date || !author || !isValidDevelopmentHistoryHash(hash)) {
    throw new Error('Failed to parse git commit metadata');
  }

  return {
    hash,
    title,
    date,
    author,
  };
}

export async function isCommitPresentInGitHistory(
  hash: string,
  run: CommandRunner = runCommand,
): Promise<boolean> {
  if (!isValidDevelopmentHistoryHash(hash)) {
    return false;
  }

  const output = await run('git', ['log', '--pretty=format:%H']);
  const commits = output
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  return commits.some((commit) => commit === hash || commit.startsWith(hash));
}

export async function filterEntriesBackedByGitCommits(
  entries: DevelopmentHistoryEntry[],
  run: CommandRunner = runCommand,
): Promise<DevelopmentHistoryEntry[]> {
  const output = await run('git', ['log', '--pretty=format:%H']);

  return filterEntriesByGitHashes(entries, parseGitCommitHashes(output));
}

export function buildDevelopmentHistoryMarkdown(
  entry: DevelopmentHistoryEntry,
  summary: string,
): string {
  const shortDate = entry.date.slice(0, 10);

  return `# ${entry.title}

**Hash:** ${entry.hash}
**Date:** ${shortDate}
**Author:** ${entry.author}

## Summary

${summary}

## Commit title

${entry.title}

## Details

Review the full diff on GitHub to see all files changed in this merge.
`;
}

export async function generateDevelopmentHistoryMarkdown(
  entry: DevelopmentHistoryEntry,
  summarize: (entry: DevelopmentHistoryEntry) => Promise<string>,
): Promise<{ markdown: string; source: 'llm' | 'fallback' }> {
  try {
    const summary = (await summarize(entry)).trim();

    if (!summary) {
      return {
        markdown: buildDevelopmentHistoryMarkdown(entry, markdownFallbackSummary),
        source: 'fallback',
      };
    }

    return {
      markdown: buildDevelopmentHistoryMarkdown(entry, summary),
      source: 'llm',
    };
  } catch {
    return {
      markdown: buildDevelopmentHistoryMarkdown(entry, markdownFallbackSummary),
      source: 'fallback',
    };
  }
}

export async function getDevelopmentHistoryEntries(): Promise<DevelopmentHistoryEntry[]> {
  return syncHistoryIndexWithGit();
}

export async function getDevelopmentHistoryEntry(
  hash: string,
): Promise<DevelopmentHistoryDetail | null> {
  const entries = await syncHistoryIndexWithGit();
  const entry = entries.find((item) => item.hash === hash);

  if (!entry) {
    return null;
  }

  const content = await loadOrGenerateHistoryMarkdown(entry);
  return {
    ...entry,
    content,
  };
}
