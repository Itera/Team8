import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../services/llm.js', () => ({
  generateMouthWord: vi.fn(),
}));

import { getMouthWord } from '../services/mouthWordService.js';
import { generateMouthWord } from '../services/llm.js';

describe('getMouthWord', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns an LLM subtitle-friendly transmission when movement is detected', async () => {
    vi.mocked(generateMouthWord).mockResolvedValueOnce('Cursor jokes in green, and your smile compiles.');

    const result = await getMouthWord({ mouthMoving: true, confidence: 0.88 });

    expect(generateMouthWord).toHaveBeenCalledWith({ mouthMoving: true, confidence: 0.88 });
    expect(result).toEqual({
      text: 'Cursor jokes in green, and your smile compiles.',
      source: 'llm',
    });
    expect(result.text).toMatch(/^[^\n\r]{1,120}$/);
  });

  it('uses deterministic fallback and skips LLM when there is no mouth movement', async () => {
    const result = await getMouthWord({ mouthMoving: false, confidence: 0.92 });

    expect(result).toEqual({
      text: 'Mic check: even my silence needs a subtitle.',
      source: 'fallback',
    });
    expect(generateMouthWord).not.toHaveBeenCalled();
  });

  it('falls back when movement is detected but the LLM path cannot provide text', async () => {
    vi.mocked(generateMouthWord).mockResolvedValueOnce(null);

    const result = await getMouthWord({ mouthMoving: true, confidence: 0.55 });

    expect(generateMouthWord).toHaveBeenCalledWith({ mouthMoving: true, confidence: 0.55 });
    expect(result).toEqual({
      text: 'Medium signal: this joke buffering icon is my co-host.',
      source: 'fallback',
    });
  });
});