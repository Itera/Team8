import type { MotivationRequest, MotivationResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export async function getMotivation(
  task: string, 
  personality: MotivationRequest['personality'] = 'silly'
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
