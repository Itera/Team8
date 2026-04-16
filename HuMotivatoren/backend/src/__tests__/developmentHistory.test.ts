import request from 'supertest';
import { vi } from 'vitest';

vi.mock('cowsay', () => ({
  default: {
    say: vi.fn(() => 'stubbed cowsay'),
  },
}));

import app from '../app.js';

describe('GET /api/development-history', () => {
  it('should return the development history manifest', async () => {
    const res = await request(app).get('/api/development-history');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toMatchObject({
      hash: expect.any(String),
      title: expect.any(String),
      date: expect.any(String),
      author: expect.any(String),
    });
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
    expect(res.body.content).toContain('# feat: scaffold HuMotivatoren project structure');
  });

  it('should return 404 when the hash is valid but not found', async () => {
    const res = await request(app).get('/api/development-history/deadbee');

    expect(res.status).toBe(404);
    expect(res.body.code).toBe('CHANGE_NOT_FOUND');
  });

  it('should return 400 when the hash format is invalid', async () => {
    const res = await request(app).get('/api/development-history/not-a-valid-hash');

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('INVALID_CHANGE_HASH');
  });
});
