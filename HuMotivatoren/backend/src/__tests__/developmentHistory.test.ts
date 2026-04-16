import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const developmentHistoryStoreMocks = vi.hoisted(() => ({
  getDevelopmentHistoryEntries: vi.fn(),
  getDevelopmentHistoryEntry: vi.fn(),
  isValidDevelopmentHistoryHash: vi.fn(),
}));

vi.mock('cowsay', () => ({
  default: {
    say: vi.fn(() => 'stubbed cowsay'),
  },
}));

vi.mock('../services/developmentHistoryStore.js', () => ({
  getDevelopmentHistoryEntries: developmentHistoryStoreMocks.getDevelopmentHistoryEntries,
  getDevelopmentHistoryEntry: developmentHistoryStoreMocks.getDevelopmentHistoryEntry,
  isValidDevelopmentHistoryHash: developmentHistoryStoreMocks.isValidDevelopmentHistoryHash,
}));

import app from '../app.js';

const MOCK_ENTRY = {
  hash: 'a1b2c3d',
  title: 'feat: scaffold HuMotivatoren project structure',
  date: '2026-04-01T10:00:00Z',
  author: 'marcin',
};

beforeEach(() => {
  vi.clearAllMocks();
  developmentHistoryStoreMocks.getDevelopmentHistoryEntries.mockResolvedValue([MOCK_ENTRY]);
  developmentHistoryStoreMocks.getDevelopmentHistoryEntry.mockResolvedValue({
    ...MOCK_ENTRY,
    content: '# feat: scaffold HuMotivatoren project structure',
  });
  developmentHistoryStoreMocks.isValidDevelopmentHistoryHash.mockReturnValue(true);
});

describe('GET /api/development-history', () => {
  it('should return the development history manifest', async () => {
    const res = await request(app).get('/api/development-history');

    expect(res.status).toBe(200);
    expect(developmentHistoryStoreMocks.getDevelopmentHistoryEntries).toHaveBeenCalledTimes(1);
    expect(res.body).toEqual([MOCK_ENTRY]);
  });

  it('should return an empty manifest when the store falls back to no history', async () => {
    developmentHistoryStoreMocks.getDevelopmentHistoryEntries.mockResolvedValueOnce([]);

    const res = await request(app).get('/api/development-history');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe('GET /api/development-history/:hash', () => {
  it('should return a single history entry with content', async () => {
    const res = await request(app).get('/api/development-history/a1b2c3d');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      hash: 'a1b2c3d',
      title: 'feat: scaffold HuMotivatoren project structure',
      date: '2026-04-01T10:00:00Z',
      author: 'marcin',
      content: expect.any(String),
    });
    expect(developmentHistoryStoreMocks.getDevelopmentHistoryEntry).toHaveBeenCalledWith('a1b2c3d');
    expect(res.body.content).toContain('# feat: scaffold HuMotivatoren project structure');
  });

  it('should return 404 when the hash is valid but the store falls back to no entry', async () => {
    developmentHistoryStoreMocks.getDevelopmentHistoryEntry.mockResolvedValueOnce(null);

    const res = await request(app).get('/api/development-history/deadbee');

    expect(res.status).toBe(404);
    expect(res.body.code).toBe('CHANGE_NOT_FOUND');
  });

  it('should return 400 when the hash format is invalid', async () => {
    developmentHistoryStoreMocks.isValidDevelopmentHistoryHash.mockReturnValueOnce(false);

    const res = await request(app).get('/api/development-history/not-a-valid-hash');

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('INVALID_CHANGE_HASH');
    expect(developmentHistoryStoreMocks.getDevelopmentHistoryEntry).not.toHaveBeenCalled();
  });
});
