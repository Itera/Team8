import type {
  ChaosWeatherResponse,
  DevelopmentHistoryDetail,
  DevelopmentHistoryEntry,
  MotivationRequest,
  MotivationResponse,
  WordOfYourMouthSignal,
  WordOfYourMouthSignalRequest,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export async function getMotivation(
  task: string,
  personality: MotivationRequest['personality'] = 'silly',
): Promise<MotivationResponse> {
  const res = await fetch(`${API_URL}/api/motivate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task, personality } satisfies MotivationRequest),
  });

  if (!res.ok) {
    throw new Error('Kunne ikke hente motivasjon 😢');
  }

  return res.json();
}

export async function getDevelopmentHistory(): Promise<DevelopmentHistoryEntry[]> {
  const res = await fetch(`${API_URL}/api/development-history`);

  if (!res.ok) {
    throw new Error(`Failed to load development history: ${res.status}`);
  }

  return res.json();
}

export async function getDevelopmentHistoryDetail(
  hash: string,
): Promise<DevelopmentHistoryDetail> {
  const res = await fetch(`${API_URL}/api/development-history/${encodeURIComponent(hash)}`);

  if (!res.ok) {
    throw new Error(`Failed to load change: ${hash}`);
  }

  return res.json();
}

export async function getWordOfYourMouthSignal(
  request: WordOfYourMouthSignalRequest,
): Promise<WordOfYourMouthSignal> {
  const res = await fetch(`${API_URL}/api/word-of-your-mouth/signal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    throw new Error(`Failed to load matrix signal: ${res.status}`);
  }

  return res.json();
}

export async function getChaosWeather(lat?: number, lon?: number): Promise<ChaosWeatherResponse> {
  const params = new URLSearchParams();

  if (typeof lat === 'number') {
    params.set('lat', String(lat));
  }

  if (typeof lon === 'number') {
    params.set('lon', String(lon));
  }

  const query = params.toString();
  const res = await fetch(`${API_URL}/api/weather/chaos${query ? `?${query}` : ''}`);

  if (!res.ok) {
    throw new Error(`Failed to load chaos weather: ${res.status}`);
  }

  return res.json();
}
