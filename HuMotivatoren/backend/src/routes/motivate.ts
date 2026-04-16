import { Router } from 'express';
import type { MotivationRequest, MotivationResponse } from '../types/index.js';

export const motivateRouter = Router();

motivateRouter.post('/', async (req, res) => {
  const { task, personality } = req.body as MotivationRequest;

  if (!task || typeof task !== 'string' || task.trim().length === 0) {
    res.status(400).json({ error: 'Missing required field: task' });
    return;
  }

  // TODO: Replace stub with real LLM + API calls (Rosa)
  const response: MotivationResponse = {
    motivation: `Du skal ${task}? Da er det bare å kjøre på! 💪`,
    humor: `Visste du at 73% av alle som ${task} gjør det mens de spiser sjokolade? (kilde: meg selv)`,
    funFact: 'En blekksprut har tre hjerter. Hvis den kan klare det, kan du klare hva som helst.',
    gifUrl: undefined,
    source: 'stub',
  };

  if (personality) {
    response.motivation = `[${personality}] ${response.motivation}`;
  }

  res.json(response);
});
