import app from './app.js';
import { logger } from '@dissertation/common';
import { PORT } from './config/index.js';

async function start() {
  app.listen(PORT, () => {
    logger.info(`Auth service running on port ${PORT}`);
  });

  logger.info('Auth service started - DB managed by Prisma migrations');
}

start().catch((err) => {
  logger.error(`Failed to start Auth service: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
