import express, { type Express, type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import { motivateRouter } from './routes/motivate.js';
import { healthRouter } from './routes/health.js';
import { cowsayRouter } from './routes/cowsay.js';

const app: Express = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/motivate', motivateRouter);
app.use('/api/health', healthRouter);
app.use('/api/cowsay', cowsayRouter);

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
