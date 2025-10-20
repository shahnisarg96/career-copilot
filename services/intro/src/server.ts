import app from './app.js';
import dotenv from 'dotenv';
import { logger } from '@dissertation/common';
import { PORT } from './config/index.js';

dotenv.config({ path: '../../.env' });

async function start() {
  app.listen(PORT, () => {
    logger.info(`Intro service running on port ${PORT}`);
  });

  logger.info('Intro service started - DB managed by Prisma migrations');
}

start().catch((err) => {
  logger.error(`Failed to start Intro service: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
