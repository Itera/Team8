import { generateMouthWord } from './llm.js';
import type { MouthWordRequest, MouthWordResponse } from '../types/index.js';

function getDeterministicFallback(request: MouthWordRequest): string {
  if (!request.mouthMoving) {
    return 'Mic check: even my silence needs a subtitle.';
  }

  if (typeof request.confidence !== 'number') {
    return 'My lips moved, my script improvised a tiny punchline.';
  }

  if (request.confidence >= 0.8) {
    return 'High confidence: my joke landed before I finished speaking.';
  }

  if (request.confidence >= 0.5) {
    return 'Medium signal: this joke buffering icon is my co-host.';
  }

  return 'Low signal: even my whisper is trying stand-up tonight.';
}

export async function getMouthWord(request: MouthWordRequest): Promise<MouthWordResponse> {
  if (!request.mouthMoving) {
    return {
      text: getDeterministicFallback(request),
      source: 'fallback',
    };
  }

  const generated = await generateMouthWord(request);

  if (generated) {
    return {
      text: generated,
      source: 'llm',
    };
  }

  return {
    text: getDeterministicFallback(request),
    source: 'fallback',
  };
}