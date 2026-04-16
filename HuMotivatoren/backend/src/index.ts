import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { motivateRouter } from './routes/motivate.js';
import { healthRouter } from './routes/health.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/motivate', motivateRouter);
app.use('/api/health', healthRouter);

app.listen(PORT, () => {
  console.log(`🚀 HuMotivatoren backend running on http://localhost:${PORT}`);
});

export default app;
