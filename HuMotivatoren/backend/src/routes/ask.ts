import { Router } from 'express';
import axios from 'axios';
import type { AskRequest, AskResponse } from '../types/index.js';

export const askRouter = Router();

// Fallback responses used when LLM API is unavailable
const FALLBACK_RESPONSES: AskResponse[] = [
  {
    answer: 'Du har allerede alt du trenger for å lykkes — stol på deg selv!',
    encouragement: 'Det at du spør viser at du allerede er halvveis der.',
    irrelevantFact: 'En gjennomsnittlig sky veier over 500 000 kg, men faller ikke ned. Du kan også klare dette.',
    emoji: '🚀',
  },
  {
    answer: 'Ta ett steg av gangen. Fremdrift, ikke perfeksjon, er nøkkelen.',
    encouragement: 'Hvert steg fremover teller, uansett størrelse.',
    irrelevantFact: 'Honningbier besøker 2 millioner blomster for å lage 500g honning. Tålmodighet lønner seg.',
    emoji: '🌟',
  },
  {
    answer: 'Ikke tenk på sluttmålet alene — bryt det ned og fokuser på neste lille steg.',
    encouragement: 'Du vet mer enn du tror. Begynn der du er.',
    irrelevantFact: 'Blekkspruter har tre hjerter. Du trenger bare ett for å lykkes.',
    emoji: '💪',
  },
];

async function callLLM(question: string): Promise<AskResponse> {
  const apiKey = process.env.LLM_API_KEY;
  const baseUrl = process.env.LLM_BASE_URL || 'https://api.openai.com/v1';

  if (!apiKey) {
    console.warn('⚠️  LLM_API_KEY not set — using fallback response');
    return FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
  }

  const systemPrompt = `Du er HuMotivatoren, en humoristisk og varm norsk motivasjonscoach.
  Brukeren stiller et spørsmål. Svar med:
  - "answer": et motiverende svar på 1-2 setninger (kan være litt humoristisk)
  - "encouragement": en kort oppmuntrende setning
  - "irrelevantFact": en morsom og irrelevant faktaopplysning
  - "emoji": ett relevant emoji
  Svar KUN med gyldig JSON-objekt med disse fire feltene. Ingen markdown, ingen forklaring.`;

  const response = await axios.post(
    `${baseUrl}/chat/completions`,
    {
      model: process.env.LLM_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question },
      ],
      max_tokens: 300,
      temperature: 0.85,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 10_000,
    },
  );

  const raw = response.data.choices?.[0]?.message?.content ?? '';
  const parsed = JSON.parse(raw) as AskResponse;

  // Validate required fields to prevent downstream errors
  if (!parsed.answer || !parsed.encouragement || !parsed.irrelevantFact || !parsed.emoji) {
    throw new Error('LLM response missing required fields');
  }

  return parsed;
}

askRouter.post('/', async (req, res) => {
  const { question } = req.body as AskRequest;

  if (!question || typeof question !== 'string' || question.trim().length === 0) {
    res.status(400).json({
      error: 'Mangler spørsmål! Hva lurer du på? 🤔',
      code: 'MISSING_QUESTION',
    });
    return;
  }

  if (question.trim().length > 280) {
    res.status(400).json({
      error: 'Spørsmålet er for langt! Maks 280 tegn.',
      code: 'INPUT_TOO_LONG',
    });
    return;
  }

  try {
    const response = await callLLM(question.trim());
    res.json(response);
  } catch (error) {
    console.error('Error in /api/ask:', error);
    // Don't leak internal error details — use fallback instead of 500
    const fallback = FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
    res.json(fallback);
  }
});
