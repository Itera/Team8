import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockPost = vi.fn();

vi.mock('axios', () => ({
  default: { post: mockPost },
}));

describe('generateMouthWord', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    mockPost.mockReset();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.resetModules();
  });

  it('returns null and skips axios when LLM_API_KEY is missing', async () => {
    delete process.env.LLM_API_KEY;

    const { generateMouthWord } = await import('../services/llm.js');

    const result = await generateMouthWord({ mouthMoving: true, confidence: 0.9 });

    expect(result).toBeNull();
    expect(mockPost).not.toHaveBeenCalled();
  });

  it('requests a short safe subtitle joke prompt and returns sanitized output', async () => {
    process.env.LLM_API_KEY = 'test-key';
    process.env.LLM_BASE_URL = 'https://api.test.local/v1';
    process.env.LLM_MODEL = 'test-model';

    mockPost.mockResolvedValueOnce({
      data: {
        choices: [{ message: { content: '   "Tiny joke for subtitles"   ' } }],
      },
    });

    const { generateMouthWord } = await import('../services/llm.js');

    const result = await generateMouthWord({ mouthMoving: true, confidence: 0.85 });

    expect(result).toBe('Tiny joke for subtitles');
    expect(mockPost).toHaveBeenCalledOnce();

    const [, body] = mockPost.mock.calls[0] as [string, any, any];
    const messages = body.messages as Array<{ role: string; content: string }>;
    const systemMessage = messages.find(m => m.role === 'system');
    const userMessage = messages.find(m => m.role === 'user');

    expect(systemMessage?.content.toLowerCase()).toContain('safe');
    expect(systemMessage?.content.toLowerCase()).toContain('joke');
    expect(systemMessage?.content.toLowerCase()).toContain('subtitle');
    expect(systemMessage?.content.toLowerCase()).toContain('plain text');
    expect(userMessage?.content.toLowerCase()).toContain('mouthmoving=true');
    expect(userMessage?.content.toLowerCase()).toContain('confidence=high');
    expect(userMessage?.content.toLowerCase()).toContain('joke');
    expect(userMessage?.content.toLowerCase()).toContain('subtitle');
  });

  it('truncates long generated strings to subtitle-safe length', async () => {
    process.env.LLM_API_KEY = 'test-key';

    mockPost.mockResolvedValueOnce({
      data: {
        choices: [{ message: { content: ` ${'x'.repeat(140)} ` } }],
      },
    });

    const { generateMouthWord } = await import('../services/llm.js');

    const result = await generateMouthWord({ mouthMoving: true, confidence: 0.5 });

    expect(typeof result).toBe('string');
    expect(result?.length).toBeLessThanOrEqual(120);
    expect(result?.endsWith('…')).toBe(true);
  });
});
