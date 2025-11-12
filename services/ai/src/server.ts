import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import aiRoutes from './routes/ai.routes.js';
import { logger } from '@dissertation/common';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 8091;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/ai', aiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'AI Service is running', timestamp: new Date() });
});

app.listen(PORT, () => {
  logger.info(`🤖 AI Service running on port ${PORT}`);
  const hasKey = Boolean((process.env.OPENAI_API_KEY || '').trim());
  const mode = process.env.USE_MOCK_AI === 'true'
    ? 'MOCK AI (Development)'
    : (hasKey ? 'OpenAI Integration' : 'MOCK AI (No OpenAI API key found)');
  logger.info(`   Mode: ${mode}`);
});

export default app;
