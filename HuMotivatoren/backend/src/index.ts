import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`
🚀 HuMotivatoren Backend
━━━━━━━━━━━━━━━━━━━━━━━━
✅ Server running on http://localhost:${PORT}
📍 Health check: http://localhost:${PORT}/api/health
📍 Motivate API: POST http://localhost:${PORT}/api/motivate
📍 Development history API: GET http://localhost:${PORT}/api/development-history
📍 Word of your mouth API: POST http://localhost:${PORT}/api/word-of-your-mouth/signal

Ready to motivate! 💪
  `);
});

export default app;
