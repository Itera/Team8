import { Router } from 'express';
import {
  getDevelopmentHistoryEntries,
  getDevelopmentHistoryEntry,
  isValidDevelopmentHistoryHash,
} from '../services/developmentHistoryStore.js';

export const developmentHistoryRouter = Router();

developmentHistoryRouter.get('/', async (_req, res, next) => {
  try {
    const entries = await getDevelopmentHistoryEntries();
    res.json(entries);
  } catch (error) {
    next(error);
  }
});

developmentHistoryRouter.get('/:hash', async (req, res, next) => {
  const { hash } = req.params;

  if (!isValidDevelopmentHistoryHash(hash)) {
    res.status(400).json({
      error: 'Ugyldig endringshash',
      code: 'INVALID_CHANGE_HASH',
    });
    return;
  }

  try {
    const entry = await getDevelopmentHistoryEntry(hash);

    if (!entry) {
      res.status(404).json({
        error: 'Endring ikke funnet',
        code: 'CHANGE_NOT_FOUND',
      });
      return;
    }

    res.json(entry);
  } catch (error) {
    next(error);
  }
});
