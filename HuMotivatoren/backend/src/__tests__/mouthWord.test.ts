import request from 'supertest';
import { vi } from 'vitest';

vi.mock('cowsay', () => ({
  default: {
    say: vi.fn(() => 'stubbed cowsay'),
  },
}));

vi.mock('../services/llm.js', () => ({
  generateMouthWord: vi.fn(),
}));

import app from '../app.js';
import { generateMouthWord } from '../services/llm.js';

describe('POST /api/word-of-your-mouth/signal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return generated text when the LLM helper succeeds', async () => {
    vi.mocked(generateMouthWord).mockResolvedValueOnce('Neo heard a green whisper.');

    const res = await request(app)
      .post('/api/word-of-your-mouth/signal')
      .send({ mouthMoving: true, confidence: 0.91 });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      transmission: 'Neo heard a green whisper.',
      source: 'llm',
      insight: 'High-confidence mouth motion produced a strong matrix transmission.',
    });
    expect(typeof res.body.receivedAt).toBe('string');
  });

  it('should fall back deterministically when the LLM helper is unavailable', async () => {
    vi.mocked(generateMouthWord).mockResolvedValueOnce(null);

    const res = await request(app)
      .post('/api/word-of-your-mouth/signal')
      .send({ mouthMoving: true, confidence: 0.55 });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      transmission: 'Medium signal: this joke buffering icon is my co-host.',
      source: 'fallback',
      insight: 'Moderate mouth motion detected. The matrix signal is unstable but readable.',
    });
    expect(typeof res.body.receivedAt).toBe('string');
  });

  it('should return the idle fallback without calling the LLM when no mouth movement is detected', async () => {
    const res = await request(app)
      .post('/api/word-of-your-mouth/signal')
      .send({ mouthMoving: false, confidence: 0.99 });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      transmission: 'Mic check: even my silence needs a subtitle.',
      source: 'fallback',
      insight: 'No visible mouth motion yet. The matrix is still observing your face for a live transmission.',
    });
    expect(typeof res.body.receivedAt).toBe('string');
    expect(generateMouthWord).not.toHaveBeenCalled();
  });

  it('should return 400 when mouthMoving is missing', async () => {
    const res = await request(app)
      .post('/api/word-of-your-mouth/signal')
      .send({ confidence: 0.7 });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('INVALID_MOUTH_SIGNAL');
  });

  it('should return 400 when confidence is outside the accepted range', async () => {
    const res = await request(app)
      .post('/api/word-of-your-mouth/signal')
      .send({ mouthMoving: true, confidence: 1.5 });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('INVALID_CONFIDENCE');
  });
});