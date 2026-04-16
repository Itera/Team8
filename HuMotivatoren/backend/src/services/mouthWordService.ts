import { generateMouthWord } from './llm.js';
import type { MouthWordRequest, MouthWordResponse } from '../types/index.js';

function getDeterministicFallback(request: MouthWordRequest): string {
  if (!request.mouthMoving) {
    return 'Signal idle. The matrix is waiting.';
  }

  if (typeof request.confidence !== 'number') {
    return 'Signal received. The matrix whispers in green.';
  }

  if (request.confidence >= 0.8) {
    return 'Signal locked. Follow the green cursor.';
  }

  if (request.confidence >= 0.5) {
    return 'Signal unstable. The matrix requests one more word.';
  }

  return 'Weak signal. The matrix asks for another blink.';
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