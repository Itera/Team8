export interface MotivationRequest {
  task: string;
  personality?: string;
}

export interface MotivationResponse {
  motivation: string;
  humor?: string;
  funFact?: string;
  gifUrl?: string;
  source?: string;
}
