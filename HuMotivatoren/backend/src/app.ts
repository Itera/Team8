import express, { type Express, type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { motivateRouter } from './routes/motivate.js';
import { healthRouter } from './routes/health.js';
import { cowsayRouter } from './routes/cowsay.js';
import { developmentHistoryRouter } from './routes/developmentHistory.js';
import { mouthWordRouter } from './routes/mouthWord.js';

const app: Express = express();

// Security middleware
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. curl, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin '${origin}' not allowed`));
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json({ limit: '4kb' }));

const limiter = rateLimit({
  windowMs: 60 * 1000,   // 1 minute
  max: 30,               // 30 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'For mange forespørsler. Vent litt og prøv igjen. ⏳', code: 'RATE_LIMITED' },
});
app.use(limiter);

// Routes
app.use('/api/motivate', motivateRouter);
app.use('/api/health', healthRouter);
app.use('/api/cowsay', cowsayRouter);
app.use('/api/development-history', developmentHistoryRouter);
app.use('/api/mouth-word', mouthWordRouter);
app.use('/api/word-of-your-mouth', mouthWordRouter);

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
