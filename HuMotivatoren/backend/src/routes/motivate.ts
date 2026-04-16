import { Router } from 'express';
import type { MotivationRequest } from '../types/index.js';
import { getMotivation } from '../services/llmService.js';

export const motivateRouter = Router();

motivateRouter.post('/', async (req, res) => {
  const { task, personality } = req.body as MotivationRequest;

  if (!task || typeof task !== 'string' || task.trim().length === 0) {
    res.status(400).json({ 
      error: 'Mangler oppgave! Fortell oss hva du skal gjøre 🤔',
      code: 'MISSING_TASK'
    });
    return;
  }

  const validPersonalities = ['serious', 'silly', 'sports', 'nerdy'];
  if (personality && !validPersonalities.includes(personality)) {
    res.status(400).json({
      error: `Ugyldig personality. Velg en av: ${validPersonalities.join(', ')}`,
      code: 'INVALID_PERSONALITY'
    });
    return;
  }

  try {
    const result = await getMotivation({ task: task.trim(), personality });
    res.json(result);
  } catch (error) {
    console.error('Error getting motivation:', error);
    res.status(500).json({
      error: 'Noe gikk galt på serveren 😅',
      code: 'INTERNAL_ERROR'
    });
  }
});
