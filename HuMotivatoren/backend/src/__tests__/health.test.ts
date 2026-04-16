import request from 'supertest';
import app from '../app.js';

describe('GET /api/health', () => {
  it('should return 200 with status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('should include a friendly message', async () => {
    const res = await request(app).get('/api/health');
    expect(res.body.message).toBeDefined();
    expect(typeof res.body.message).toBe('string');
  });
});
