import { Router } from 'express';

export const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'humotivatoren-backend',
    message: 'Alt er klart for motivasjon og kaos',
    timestamp: new Date().toISOString(),
  });
});
