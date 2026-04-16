import { Router } from 'express';

import { getMouthWord } from '../services/mouthWordService.js';
import type { MouthWordRequest, WordOfYourMouthSignal } from '../types/index.js';

export const mouthWordRouter = Router();

function createInsight(request: MouthWordRequest, source: 'llm' | 'fallback'): string {
  if (!request.mouthMoving) {
    return 'No visible mouth motion yet. The matrix is still observing your face for a live transmission.';
  }

  if (typeof request.confidence !== 'number') {
    return source === 'llm'
      ? 'Live movement detected. The LLM translated the signal into a matrix fragment.'
      : 'Live movement detected. A fallback matrix fragment was emitted while the LLM was unavailable.';
  }

  if (request.confidence >= 0.8) {
    return source === 'llm'
      ? 'High-confidence mouth motion produced a strong matrix transmission.'
      : 'High-confidence mouth motion was detected, but the fallback generator answered instead.';
  }

  if (request.confidence >= 0.5) {
    return 'Moderate mouth motion detected. The matrix signal is unstable but readable.';
  }

  return 'Weak motion detected. The matrix is extrapolating meaning from a faint mouth signal.';
}

function parseRequest(body: unknown): MouthWordRequest | { error: string; code: string } {
  const { mouthMoving, confidence } = (body ?? {}) as Partial<MouthWordRequest>;

  if (typeof mouthMoving !== 'boolean') {
    return {
      error: 'mouthMoving må være true eller false',
      code: 'INVALID_MOUTH_SIGNAL',
    };
  }

  if (
    confidence !== undefined
    && (typeof confidence !== 'number' || !Number.isFinite(confidence) || confidence < 0 || confidence > 1)
  ) {
    return {
      error: 'confidence må være et tall mellom 0 og 1',
      code: 'INVALID_CONFIDENCE',
    };
  }

  return { mouthMoving, confidence };
}

async function handleSignal(reqBody: unknown): Promise<WordOfYourMouthSignal | { error: string; code: string }> {
  const parsed = parseRequest(reqBody);

  if ('error' in parsed) {
    return parsed;
  }

  const response = await getMouthWord(parsed);

  return {
    transmission: response.text,
    insight: createInsight(parsed, response.source),
    source: response.source,
    receivedAt: new Date().toISOString(),
  };
}

mouthWordRouter.post('/', async (req, res, next) => {
  try {
    const result = await handleSignal(req.body);

    if ('error' in result) {
      res.status(400).json(result);
      return;
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
});

mouthWordRouter.post('/signal', async (req, res, next) => {
  try {
    const result = await handleSignal(req.body);

    if ('error' in result) {
      res.status(400).json(result);
      return;
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
});