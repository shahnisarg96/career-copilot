import app from './app.js';
import { PORT } from './config/index.js';
import { logger } from '@dissertation/common';

async function start() {
  app.listen(PORT, () => {
    logger.info(`Education service running on port ${PORT}`);
  });

  logger.info('Education service started - DB managed by Prisma migrations');
}

start().catch((err) => {
  logger.error(`Failed to start Education service: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
