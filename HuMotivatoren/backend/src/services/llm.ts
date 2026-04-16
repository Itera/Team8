/**
 * LLM integration service.
 * TODO: Implement actual LLM API calls (Rosa)
 */

const LLM_API_KEY = process.env.LLM_API_KEY;
const LLM_BASE_URL = process.env.LLM_BASE_URL || 'https://api.openai.com/v1';

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
