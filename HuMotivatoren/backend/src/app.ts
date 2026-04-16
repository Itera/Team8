import express, { type Express, type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import { motivateRouter } from './routes/motivate.js';
import { healthRouter } from './routes/health.js';
import { cowsayRouter } from './routes/cowsay.js';
import { developmentHistoryRouter } from './routes/developmentHistory.js';
import { mouthWordRouter } from './routes/mouthWord.js';
import { weatherRouter } from './routes/weather.js';

const app: Express = express();

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin '${origin}' not allowed`));
    },
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
  }),
);

app.use(express.json({ limit: '4kb' }));

app.use('/api/motivate', motivateRouter);
app.use('/api/health', healthRouter);
app.use('/api/cowsay', cowsayRouter);
app.use('/api/development-history', developmentHistoryRouter);
app.use('/api/mouth-word', mouthWordRouter);
app.use('/api/word-of-your-mouth', mouthWordRouter);
app.use('/api/weather', weatherRouter);

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: 'Endpoint ikke funnet 🔍',
    code: 'NOT_FOUND',
  });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err.message);
  res.status(500).json({
    error: 'Noe gikk galt på serveren 😅',
    code: 'INTERNAL_ERROR',
    ...(process.env.NODE_ENV === 'development' && { details: err.message }),
  });
});

export default app;
