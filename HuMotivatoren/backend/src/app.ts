import express, { type Express, type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { motivateRouter } from './routes/motivate.js';
import { healthRouter } from './routes/health.js';
import { cowsayRouter } from './routes/cowsay.js';
import { askRouter } from './routes/ask.js';

const app: Express = express();

const cowsayLimiter = rateLimit({
  windowMs: 60_000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
}));
app.use(express.json({ limit: '4kb' }));

// Routes
app.use('/api/motivate', motivateRouter);
app.use('/api/health', healthRouter);
app.use('/api/cowsay', cowsayLimiter, cowsayRouter);
app.use('/api/ask', cowsayLimiter, askRouter);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ 
    error: 'Endpoint ikke funnet 🔍',
    code: 'NOT_FOUND'
  });
});

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err.message);
  res.status(500).json({ 
    error: 'Noe gikk galt på serveren 😅',
    code: 'INTERNAL_ERROR',
    ...(process.env.NODE_ENV === 'development' && { details: err.message })
  });
});

export default app;
