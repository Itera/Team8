import axios from 'axios';

import type { MouthWordRequest } from '../types/index.js';

/**
 * LLM integration service.
 * TODO: Implement actual LLM API calls (Rosa)
 */

const LLM_API_KEY = process.env.LLM_API_KEY;
const LLM_BASE_URL = process.env.LLM_BASE_URL || 'https://api.openai.com/v1';
const LLM_MODEL = process.env.LLM_MODEL || 'gpt-4.1-mini';
const MAX_MOUTH_WORD_LENGTH = 120;

function sanitizeShortText(text: string): string {
  const normalized = text.replace(/\s+/g, ' ').trim().replace(/^"|"$/g, '');

  if (normalized.length <= MAX_MOUTH_WORD_LENGTH) {
    return normalized;
  }

  return `${normalized.slice(0, MAX_MOUTH_WORD_LENGTH - 1).trimEnd()}…`;
}

function getConfidenceDescription(confidence?: number): string {
  if (typeof confidence !== 'number' || Number.isNaN(confidence)) {
    return 'unknown';
  }

  if (confidence >= 0.8) {
    return 'high';
  }

  if (confidence >= 0.5) {
    return 'medium';
  }

  return 'low';
}

export async function generateMotivation(task: string, personality?: string): Promise<string> {
  if (!LLM_API_KEY) {
    console.warn('⚠️ LLM_API_KEY not set — returning stub response');
    return `Stub motivation for: ${task}`;
  }

  // TODO: Call LLM API with proper prompt engineering
  // The prompt should:
  // 1. Generate Norwegian motivational content
  // 2. Include humor aligned with Itera values (no offensive content)
  // 3. Optionally apply a personality style
  console.log(`TODO: Call ${LLM_BASE_URL} with key ${LLM_API_KEY.slice(0, 4)}...`);

  return `Stub motivation for: ${task} (personality: ${personality ?? 'default'})`;
}

export async function generateMouthWord(request: MouthWordRequest): Promise<string | null> {
  if (!LLM_API_KEY) {
    return null;
  }

  try {
    const response = await axios.post(
      `${LLM_BASE_URL}/chat/completions`,
      {
        model: LLM_MODEL,
        temperature: 0.9,
        max_tokens: 40,
        messages: [
          {
            role: 'system',
            content:
              'Return one short, safe, family-friendly joke for live subtitles. Plain text only. Max 12 words. No markdown. No slurs, insults, sexual content, politics, religion, or violence.',
          },
          {
            role: 'user',
            content: `mouthMoving=${request.mouthMoving}; confidence=${getConfidenceDescription(request.confidence)}; generate one playful joke line suitable as a subtitle. Keep it easy to read and positive.`,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${LLM_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 4000,
      },
    );

    const text = response.data?.choices?.[0]?.message?.content;

    if (typeof text !== 'string' || text.trim().length === 0) {
      return null;
    }

    return sanitizeShortText(text);
  } catch (error) {
    console.warn('⚠️ Mouth-word LLM unavailable, falling back to deterministic response');
    console.warn(error);
    return null;
  }
}
