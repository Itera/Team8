import { promisify } from 'node:util';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  buildDevelopmentHistoryMarkdown,
  filterEntriesBackedByGitCommits,
  generateDevelopmentHistoryMarkdown,
  getLatestGitCommitMetadata,
  isCommitPresentInGitHistory,
} from '../services/developmentHistoryStore.js';

const REAL_FULL_HASH = 'a1b2c3d4e5f60123456789abcdef0123456789ab';
const OTHER_FULL_HASH = '1111111111111111111111111111111111111111';
const FAKE_HASH = 'deadbee';

const BASE_ENTRY = {
  hash: REAL_FULL_HASH.slice(0, 7),
  title: 'feat: add development history endpoint',
  date: '2026-04-16T12:34:56Z',
  author: 'Marcin',
};

function createMockExecFile(outputs: Array<string | Error>) {
  const promisified = vi.fn(async () => {
    const next = outputs.shift();

    if (next instanceof Error) {
      throw next;
    }

    return {
      stdout: next ?? '',
      stderr: '',
    };
  });

  const execFile = vi.fn();
  execFile[promisify.custom] = promisified;
  return execFile;
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.resetModules();
  vi.unmock('node:fs/promises');
  vi.unmock('node:child_process');
  vi.unmock('../services/llmService.js');
});

describe('developmentHistoryStore git metadata helpers', () => {
  it('parses latest commit metadata from mocked git output', async () => {
    const mockRun = vi
      .fn()
      .mockResolvedValue(`${REAL_FULL_HASH}\u001ffeat: ship history\u001f2026-04-16T08:00:00Z\u001fMarcin`);

    const meta = await getLatestGitCommitMetadata(mockRun);

    expect(mockRun).toHaveBeenCalledWith('git', [
      'log',
      '-1',
      '--pretty=format:%H%x1f%s%x1f%cI%x1f%an',
    ]);
    expect(meta).toEqual({
      hash: REAL_FULL_HASH,
      title: 'feat: ship history',
      date: '2026-04-16T08:00:00Z',
      author: 'Marcin',
    });
  });

  it('rejects malformed git metadata output', async () => {
    const mockRun = vi.fn().mockResolvedValue('missing separators');

    await expect(getLatestGitCommitMetadata(mockRun)).rejects.toThrow(
      'Failed to parse git commit metadata',
    );
  });

  it('accepts only commit hashes that are present in git history', async () => {
    const mockRun = vi.fn().mockResolvedValue(`${REAL_FULL_HASH}\n${OTHER_FULL_HASH}`);

    await expect(isCommitPresentInGitHistory(REAL_FULL_HASH, mockRun)).resolves.toBe(true);
    await expect(isCommitPresentInGitHistory(REAL_FULL_HASH.slice(0, 7), mockRun)).resolves.toBe(true);
    await expect(isCommitPresentInGitHistory(FAKE_HASH, mockRun)).resolves.toBe(false);
  });

  it('filters out entries not backed by git commit history', async () => {
    const mockRun = vi.fn().mockResolvedValue(`${REAL_FULL_HASH}\n${OTHER_FULL_HASH}`);

    const entries = [
      BASE_ENTRY,
      {
        ...BASE_ENTRY,
        hash: FAKE_HASH,
        title: 'chore: hardcoded fake commit id',
      },
    ];

    const filtered = await filterEntriesBackedByGitCommits(entries, mockRun);

    expect(filtered).toEqual([BASE_ENTRY]);
  });
});

describe('developmentHistoryStore markdown generation', () => {
  it('generates markdown using LLM summary when summarizer succeeds', async () => {
    const summarize = vi
      .fn()
      .mockResolvedValue('A clean summary generated from the latest git commit metadata.');

    const result = await generateDevelopmentHistoryMarkdown(BASE_ENTRY, summarize);

    expect(result.source).toBe('llm');
    expect(result.markdown).toContain('# feat: add development history endpoint');
    expect(result.markdown).toContain('## Summary');
    expect(result.markdown).toContain('A clean summary generated from the latest git commit metadata.');
  });

  it('falls back to deterministic markdown summary when summarizer fails', async () => {
    const summarize = vi.fn().mockRejectedValue(new Error('LLM unavailable'));

    const result = await generateDevelopmentHistoryMarkdown(BASE_ENTRY, summarize);

    expect(result.source).toBe('fallback');
    expect(result.markdown).toContain('## Summary');
    expect(result.markdown).toContain(
      'This entry was automatically generated from git commit metadata because summary generation was unavailable.',
    );
  });

  it('buildDevelopmentHistoryMarkdown includes commit metadata fields', () => {
    const markdown = buildDevelopmentHistoryMarkdown(BASE_ENTRY, 'Summarized.');

    expect(markdown).toContain(`**Hash:** ${BASE_ENTRY.hash}`);
    expect(markdown).toContain('**Date:** 2026-04-16');
    expect(markdown).toContain(`**Author:** ${BASE_ENTRY.author}`);
    expect(markdown).toContain('## Commit title');
  });
});

describe('developmentHistoryStore serving path', () => {
  it('returns no entries when git cannot verify the cached index', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const readFile = vi.fn().mockResolvedValueOnce(`${JSON.stringify([BASE_ENTRY])}\n`);
    const writeFile = vi.fn();
    const mkdir = vi.fn();
    const execFile = createMockExecFile([
      '/Users/marcin/Code/Itera/Team8\n',
      new Error('git unavailable'),
      new Error('git unavailable'),
    ]);

    vi.doMock('node:fs/promises', () => ({
      mkdir,
      readFile,
      writeFile,
    }));
    vi.doMock('node:child_process', () => ({ execFile }));
    vi.doMock('../services/llmService.js', () => ({
      generateDevelopmentHistoryMarkdown: vi.fn(),
    }));

    const store = await import('../services/developmentHistoryStore.js');

    await expect(store.getDevelopmentHistoryEntries()).resolves.toEqual([]);
    expect(writeFile).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalled();
  });

  it('does not return cached detail entries that git cannot verify', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const readFile = vi.fn().mockResolvedValueOnce(`${JSON.stringify([BASE_ENTRY])}\n`);
    const writeFile = vi.fn();
    const mkdir = vi.fn();
    const execFile = createMockExecFile([
      '/Users/marcin/Code/Itera/Team8\n',
      new Error('git unavailable'),
      new Error('git unavailable'),
    ]);

    vi.doMock('node:fs/promises', () => ({
      mkdir,
      readFile,
      writeFile,
    }));
    vi.doMock('node:child_process', () => ({ execFile }));
    vi.doMock('../services/llmService.js', () => ({
      generateDevelopmentHistoryMarkdown: vi.fn(),
    }));

    const store = await import('../services/developmentHistoryStore.js');

    await expect(store.getDevelopmentHistoryEntry(BASE_ENTRY.hash)).resolves.toBeNull();
    expect(warn).toHaveBeenCalled();
  });
});
