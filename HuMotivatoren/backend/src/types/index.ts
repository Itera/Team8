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
