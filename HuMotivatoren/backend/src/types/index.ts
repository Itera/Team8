export interface MotivationRequest {
  task: string;
  personality?: 'serious' | 'silly' | 'sports' | 'nerdy';
}

export interface MotivationResponse {
  quote: string;
  fact: string;
  tip: string;
  gifUrl?: string;
  emoji: string;
  personality: string;
}

export interface MouthWordRequest {
  mouthMoving: boolean;
  confidence?: number;
}

export interface MouthWordResponse {
  text: string;
  source: 'llm' | 'fallback';
}

export interface WordOfYourMouthSignal {
  transmission: string;
  insight: string;
  source: 'llm' | 'fallback';
  receivedAt: string;
}

export interface DevelopmentHistoryEntry {
  hash: string;
  title: string;
  date: string;
  author: string;
}

export interface DevelopmentHistoryDetail extends DevelopmentHistoryEntry {
  content: string;
}

export interface ChaosWeatherResponse {
  locationName: string;
  latitude: number;
  longitude: number;
  temperature: number;
  windSpeed: number;
  precipitation: number;
  weatherCode: number;
  summary: string;
  chaosLevel: number;
  verdict: string;
  recommendedAction: string;
}
