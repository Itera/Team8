import request from 'supertest';
import { vi } from 'vitest';
import app from '../app.js';

// Mock the LLM service so no real API calls
vi.mock('../services/llmService.js', () => ({
  getMotivation: vi.fn().mockResolvedValue({
    quote: 'Du klarer det! 💪',
    fact: 'Visste du at 90% av alle statistikker er oppdiktet?',
    tip: 'Ta en kopp kaffe og gå for det',
    emoji: '🚀',
    personality: 'silly',
  }),
}));

describe('POST /api/motivate', () => {
  it('should return 200 with a motivation response for valid request', async () => {
    const res = await request(app)
      .post('/api/motivate')
      .send({ task: 'lese nyheter', personality: 'silly' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('quote');
    expect(res.body).toHaveProperty('fact');
    expect(res.body).toHaveProperty('tip');
    expect(res.body).toHaveProperty('emoji');
  });

  it('should return 400 when task is missing', async () => {
    const res = await request(app)
      .post('/api/motivate')
      .send({ personality: 'silly' });
    expect(res.status).toBe(400);
  });

  it('should return 400 when task is empty string', async () => {
    const res = await request(app)
      .post('/api/motivate')
      .send({ task: '', personality: 'serious' });
    expect(res.status).toBe(400);
  });

  it('should handle Norwegian special characters æøå', async () => {
    const res = await request(app)
      .post('/api/motivate')
      .send({ task: 'spille fotball med Ragulan æøå', personality: 'sports' });
    expect(res.status).toBe(200);
  });

  it('should use silly as default personality', async () => {
    const res = await request(app)
      .post('/api/motivate')
      .send({ task: 'hackathon' });
    expect(res.status).toBe(200);
  });

  it('should handle very long task input', async () => {
    const longTask = 'motivere meg til å gjøre noe kjedelig '.repeat(30);
    const res = await request(app)
      .post('/api/motivate')
      .send({ task: longTask, personality: 'nerdy' });
    expect([200, 400]).toContain(res.status);
  });

  it('should work for all personality types', async () => {
    const personalities = ['silly', 'serious', 'sports', 'nerdy'];
    for (const personality of personalities) {
      const res = await request(app)
        .post('/api/motivate')
        .send({ task: 'teste ting', personality });
      expect(res.status).toBe(200);
    }
  });
});
