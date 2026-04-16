import request from 'supertest';
import { vi } from 'vitest';
import app from '../app.js';

describe('GET /api/weather/chaos', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns weather data with Gran Canaria fallback', async () => {
    const fetchMock = vi.mocked(globalThis.fetch);
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        current: {
          temperature_2m: 27,
          precipitation: 0,
          wind_speed_10m: 12,
          weather_code: 1,
        },
      }),
    });

    const res = await request(app).get('/api/weather/chaos');

    expect(res.status).toBe(200);
    expect(res.body.locationName).toBe('Gran Canaria');
    expect(res.body.summary).toBeDefined();
    expect(res.body.chaosLevel).toBeGreaterThan(0);
  });

  it('uses supplied coordinates and reverse geocoding', async () => {
    const fetchMock = vi.mocked(globalThis.fetch);
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          current: {
            temperature_2m: 18,
            precipitation: 0.5,
            wind_speed_10m: 30,
            weather_code: 95,
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: [
            {
              name: 'Oslo',
              admin1: 'Oslo',
              country: 'Norway',
            },
          ],
        }),
      });

    const res = await request(app).get('/api/weather/chaos?lat=59.91&lon=10.75');

    expect(res.status).toBe(200);
    expect(res.body.locationName).toContain('Oslo');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
