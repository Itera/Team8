import { describe, it, expect, vi, beforeAll, afterAll, beforeEach } from 'vitest';
import type { MotivationRequest } from '../types/index.js';

// Capture the spy outside the factory so the same reference is shared
// across all module instances, even after vi.resetModules().
const mockPost = vi.fn();

vi.mock('axios', () => ({
  default: { post: mockPost },
}));

const AZURE_ENV = {
  AZURE_OPENAI_ENDPOINT: 'https://test.openai.azure.com',
  AZURE_OPENAI_DEPLOYMENT: 'gpt-4-test',
  AZURE_OPENAI_API_VERSION: '2024-02-01',
  AZURE_OPENAI_API_KEY: 'test-key-12345',
};

function makeAxiosResponse(payload: object) {
  return {
    data: {
      choices: [{ message: { content: JSON.stringify(payload) } }],
    },
  };
}

// ─── Suite 1: env vars set → LLM path active ──────────────────────────────

describe('llmService — Azure OpenAI configured', () => {
  let getMotivation: (req: MotivationRequest) => Promise<any>;

  beforeAll(async () => {
    Object.assign(process.env, AZURE_ENV);
    vi.resetModules();
    const mod = await import('../services/llmService.js');
    getMotivation = mod.getMotivation;
  });

  afterAll(() => {
    Object.keys(AZURE_ENV).forEach(k => delete process.env[k]);
  });

  beforeEach(() => {
    mockPost.mockReset();
  });

  it('happy path: parses LLM JSON into MotivationResponse', async () => {
    mockPost.mockResolvedValueOnce(
      makeAxiosResponse({ quote: 'Test sitat', fact: 'Test fakta', tip: 'Test tips', emoji: '🚀' })
    );

    const result = await getMotivation({ task: 'skrive tester', personality: 'silly' });

    expect(result.quote).toBe('Test sitat');
    expect(result.fact).toBe('Test fakta');
    expect(result.tip).toBe('Test tips');
    expect(result.emoji).toBe('🚀');
    expect(result.personality).toBe('silly');
  });

  it('happy path: gifUrl is populated from fallback gif bank', async () => {
    mockPost.mockResolvedValueOnce(
      makeAxiosResponse({ quote: 'q', fact: 'f', tip: 't', emoji: '🎯' })
    );

    const result = await getMotivation({ task: 'jobbe hardt', personality: 'serious' });

    expect(result.gifUrl).toBeDefined();
    expect(result.gifUrl).toContain('giphy.com');
    expect(result.personality).toBe('serious');
  });

  it('task text is included in the user message sent to axios', async () => {
    mockPost.mockResolvedValueOnce(
      makeAxiosResponse({ quote: 'q', fact: 'f', tip: 't', emoji: '🤓' })
    );

    const task = 'debugge kode midt på natten';
    await getMotivation({ task, personality: 'nerdy' });

    expect(mockPost).toHaveBeenCalledOnce();
    const [, body] = mockPost.mock.calls[0] as [string, any, any];
    const userMessage = (body.messages as Array<{ role: string; content: string }>).find(
      m => m.role === 'user'
    );
    expect(userMessage?.content).toContain(task);
  });

  it('fallback — axios throws: returns fallback for requested personality', async () => {
    mockPost.mockRejectedValueOnce(new Error('Network timeout'));

    const result = await getMotivation({ task: 'løpe maraton', personality: 'sports' });

    expect(result.personality).toBe('sports');
    expect(result.emoji).toBe('⚽');
    expect(result.quote).toBeTruthy();
    expect(mockPost).toHaveBeenCalledOnce();
  });

  it('fallback — invalid JSON: returns fallback when LLM returns non-JSON content', async () => {
    mockPost.mockResolvedValueOnce({
      data: { choices: [{ message: { content: 'dette er ikke gyldig JSON!!!' } }] },
    });

    const result = await getMotivation({ task: 'noe', personality: 'nerdy' });

    expect(result.personality).toBe('nerdy');
    expect(result.emoji).toBe('🤓');
    expect(result.quote).toBeTruthy();
  });

  it.each([
    ['silly', '😜'],
    ['serious', '🎯'],
    ['sports', '⚽'],
    ['nerdy', '🤓'],
  ] as const)(
    'personality routing: "%s" fallback carries emoji %s',
    async (personality, emoji) => {
      mockPost.mockRejectedValueOnce(new Error('forced failure'));

      const result = await getMotivation({ task: 'test', personality });

      expect(result.emoji).toBe(emoji);
      expect(result.personality).toBe(personality);
    }
  );

  it('default personality is silly when personality is omitted', async () => {
    mockPost.mockRejectedValueOnce(new Error('forced failure'));

    const result = await getMotivation({ task: 'no personality provided' });

    expect(result.personality).toBe('silly');
    expect(result.emoji).toBe('😜');
  });
});

// ─── Suite 2: env vars absent → short-circuit fallback, no axios call ─────

describe('llmService — Azure OpenAI NOT configured', () => {
  let getMotivation: (req: MotivationRequest) => Promise<any>;

  beforeAll(async () => {
    // Ensure no Azure env vars are present when the module loads
    Object.keys(AZURE_ENV).forEach(k => delete process.env[k]);
    vi.resetModules();
    const mod = await import('../services/llmService.js');
    getMotivation = mod.getMotivation;
  });

  beforeEach(() => {
    mockPost.mockReset();
  });

  it('returns fallback without calling axios when config is missing', async () => {
    const result = await getMotivation({ task: 'noe morsomt', personality: 'silly' });

    expect(result.personality).toBe('silly');
    expect(result.quote).toBeTruthy();
    expect(mockPost).not.toHaveBeenCalled();
  });

  it('no config: returns correct personality fallback for serious', async () => {
    const result = await getMotivation({ task: 'jobbe hardt', personality: 'serious' });

    expect(result.personality).toBe('serious');
    expect(result.emoji).toBe('🎯');
    expect(mockPost).not.toHaveBeenCalled();
  });

  it('no config: defaults to silly when personality is omitted', async () => {
    const result = await getMotivation({ task: 'noe' });

    expect(result.personality).toBe('silly');
    expect(mockPost).not.toHaveBeenCalled();
  });
});
